import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $deleteTableColumn,
  $getTableCellNodeFromLexicalNode,
  $getTableColumnIndexFromTableCellNode,
  $getTableNodeFromLexicalNodeOrThrow,
  $getTableRowIndexFromTableCellNode,
  $insertTableColumn,
  $insertTableRow,
  $isTableCellNode,
  $isTableRowNode,
  $removeTableRowAtIndex,
  TableCellHeaderStates,
  $isTableSelection,
  $createTableSelection,
  $createTableCellNode,
  $createTableRowNode
} from "@lexical/table";
import {
  $getSelection,
  $isRangeSelection,
  $getNodeByKey,
  $setSelection,
  $isElementNode,
  $getNearestNodeFromDOMNode,
  $createParagraphNode,
  $createTextNode
} from "lexical";
import {
  Box,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Fade
} from "@mui/material";
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  TableRows as TableRowsIcon,
  ViewColumn as ViewColumnIcon,
  MoreVert as MoreVertIcon
} from "@mui/icons-material";

const manualInsertTableRow = (tableNode, rowIndex, shouldInsertAfter, numRows) => {
  try {
    const rows = tableNode.getChildren();
    if (!rows.length) return false;

    const targetIndex = shouldInsertAfter ? Math.min(rowIndex + 1, rows.length) : Math.max(0, rowIndex);

    for (let n = 0; n < numRows; n++) {
      const newRow = $createTableRowNode();

      // Find a valid row to use as template
      let templateRow = null;
      for (let i = 0; i < rows.length; i++) {
        if ($isTableRowNode(rows[i]) && rows[i].getChildren().length > 0) {
          templateRow = rows[i];
          break;
        }
      }

      if (templateRow && $isTableRowNode(templateRow)) {
        const templateCells = templateRow.getChildren();
        templateCells.forEach((templateCell) => {
          if ($isTableCellNode(templateCell)) {
            // Try to clone header state safely
            let headerState = TableCellHeaderStates.NO_STATUS;
            try {
              if (typeof templateCell.getHeaderState === "function") {
                headerState = templateCell.getHeaderState();
              } else if (templateCell.__headerState != null) {
                headerState = templateCell.__headerState;
              }
            } catch {
              headerState = TableCellHeaderStates.NO_STATUS;
            }

            const newCell = $createTableCellNode(headerState);
            newCell.append($createParagraphNode().append($createTextNode("")));
            newRow.append(newCell);
          } else {
            // Fallback: basic cell
            const newCell = $createTableCellNode(TableCellHeaderStates.NO_STATUS);
            newCell.append($createParagraphNode().append($createTextNode("")));
            newRow.append(newCell);
          }
        });
      } else {
        // Fallback: create row with 1 cell if no template available
        const newCell = $createTableCellNode(TableCellHeaderStates.NO_STATUS);
        newCell.append($createParagraphNode().append($createTextNode("")));
        newRow.append(newCell);
      }

      // Insert at the correct index
      if (targetIndex >= rows.length) {
        tableNode.append(newRow);
      } else {
        const targetRow = rows[targetIndex];
        if (targetRow) {
          targetRow.insertBefore(newRow);
        } else {
          tableNode.append(newRow);
        }
      }
    }

    return true;
  } catch (error) {
    console.error("Manual row insertion failed:", error);
    return false;
  }
};

// Manual table column insertion
const manualInsertTableColumn = (tableNode, columnIndex, shouldInsertAfter, numCols) => {
  try {
    const rows = tableNode.getChildren();
    if (!rows.length) return false;

    const targetIndex = shouldInsertAfter ? columnIndex + 1 : columnIndex;
   
    rows.forEach((row) => {
      if ($isTableRowNode(row)) {
        const cells = row.getChildren();
        if (cells.length === 0) return;
       
        const sampleCell = cells[Math.min(columnIndex, cells.length - 1)];
       
        for (let n = 0; n < numCols; n++) {
          const newCell = $createTableCellNode(sampleCell?.getHeaderState?.() || TableCellHeaderStates.NO_STATUS);
          newCell.append($createParagraphNode().append($createTextNode('')));
         
          if (targetIndex >= cells.length) {
            row.append(newCell);
          } else {
            const targetCell = cells[targetIndex];
            targetCell.insertBefore(newCell);
          }
        }
      }
    });
   
    return true;
  } catch (error) {
    console.error("Manual column insertion failed:", error);
    return false;
  }
};

export default function TableActionMenuPlugin() {
  const [editor] = useLexicalComposerContext();
  const [anchorEl, setAnchorEl] = useState(null);
  const [tableCellNode, setTableCellNode] = useState(null);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 });
  const [showButton, setShowButton] = useState(false);
  const [selectionCounts, setSelectionCounts] = useState({
    columns: 1,
    rows: 1
  });
  const containerRef = useRef(null);

  // Handle selection changes and position the button
  useEffect(() => {
    const updateListener = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        let cellNode = null;
        let counts = { columns: 1, rows: 1 };

        if ($isTableSelection(selection)) {
          const shape = selection.getShape();
          counts = { columns: shape.toX - shape.fromX + 1, rows: shape.toY - shape.fromY + 1 };
          const tableNode = $getNodeByKey(selection.tableKey);
          if (tableNode && $isElementNode(tableNode)) {
            const rows = tableNode.getChildren();
            if (shape.toY < rows.length) {
              const row = rows[shape.toY];
              if ($isTableRowNode(row)) {
                const cells = row.getChildren();
                if (shape.toX < cells.length) {
                  const cell = cells[shape.toX];
                  if ($isTableCellNode(cell)) {
                    cellNode = cell;
                  }
                }
              }
            }
          }
        } else if ($isRangeSelection(selection)) {
          const node = selection.anchor.getNode();
          cellNode = $getTableCellNodeFromLexicalNode(node);
        }

        if (cellNode) {
          setTableCellNode(cellNode);
          setSelectionCounts(counts);
          
          // Get the DOM element for positioning
          const cellElement = editor.getElementByKey(cellNode.getKey());
          if (cellElement) {
            const rootElement = editor.getRootElement();
            if (rootElement) {
              const cellRect = cellElement.getBoundingClientRect();
              const rootRect = rootElement.getBoundingClientRect();
              
              setButtonPosition({
                top: cellRect.top - rootRect.top + 5,
                left: cellRect.right - rootRect.left - 35,
              });
              
              setShowButton(true);
            }
          }
        } else {
          // Not in a table cell
          setShowButton(false);
          setTableCellNode(null);
        }
      });
    });

    // Click outside handler
    const handleClickOutside = (event) => {
      if (
        !event.target.closest('.table-action-button') &&
        !event.target.closest('.MuiMenu-root') &&
        !event.target.closest('table')
      ) {
        setShowButton(false);
        setTableCellNode(null);
        setAnchorEl(null);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      updateListener();
      document.removeEventListener('click', handleClickOutside);
    };
  }, [editor]);

  // const executeAction = useCallback((action) => {
  //   if (!tableCellNode) {
  //     console.error('No table cell node available');
  //     return;
  //   }

  //   editor.update(() => {
  //     try {
  //       const selection = $getSelection();
  //       let tableNode = null;
  //       let startRow = 0;
  //       let startCol = 0;
  //       let numRows = 1;
  //       let numCols = 1;

  //       if (!tableCellNode || !tableCellNode.isAttached()) {
  //         return;
  //       }

  //       try {
  //         tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode);
  //       } catch (error) {
  //         console.error("Table node not found:", error);
  //         return;
  //       }

  //       if (!tableNode.isAttached()) return;

  //       startRow = $getTableRowIndexFromTableCellNode(tableCellNode);
  //       startCol = $getTableColumnIndexFromTableCellNode(tableCellNode);

  //       if ($isTableSelection(selection)) {
  //         const shape = selection.getShape();
  //         numRows = shape.toY - shape.fromY + 1;
  //         numCols = shape.toX - shape.fromX + 1;
  //       }

  //       // Execute action with fallback to manual implementation
  //       switch (action) {
  //         case 'insertRowAbove':
  //           try {
  //             $insertTableRow(tableNode, startRow, false, numRows);
  //           } catch (error) {
  //             console.warn("Built-in row insertion failed, using manual method");
  //             manualInsertTableRow(tableNode, startRow, false, numRows);
  //           }
  //           break;
           
  //         case 'insertRowBelow':
  //           try {
  //             $insertTableRow(tableNode, startRow + numRows, true, numRows);
  //           } catch (error) {
  //             console.warn("Built-in row insertion failed, using manual method");
  //             manualInsertTableRow(tableNode, startRow + numRows, true, numRows);
  //           }
  //           break;
           
  //         case 'insertColumnLeft':
  //           try {
  //             $insertTableColumn(tableNode, startCol, false, numCols);
  //           } catch (error) {
  //             console.warn("Built-in column insertion failed, using manual method");
  //             manualInsertTableColumn(tableNode, startCol, false, numCols);
  //           }
  //           break;
           
  //         case 'insertColumnRight':
  //           try {
  //             $insertTableColumn(tableNode, startCol + numCols, true, numCols);
  //           } catch (error) {
  //             console.warn("Built-in column insertion failed, using manual method");
  //             manualInsertTableColumn(tableNode, startCol + numCols, true, numCols);
  //           }
  //           break;
           
  //         case 'deleteRow':
  //           for (let i = startRow + numRows - 1; i >= startRow; i--) {
  //             try {
  //               $removeTableRowAtIndex(tableNode, i);
  //             } catch (error) {
  //               console.error(`Failed to delete row at index ${i}:`, error);
  //             }
  //           }
  //           break;
           
  //         case 'deleteColumn':
  //           for (let i = startCol + numCols - 1; i >= startCol; i--) {
  //             try {
  //               $deleteTableColumn(tableNode, i);
  //             } catch (error) {
  //               console.error(`Failed to delete column at index ${i}:`, error);
  //             }
  //           }
  //           break;
           
  //         case 'deleteTable':
  //           try {
  //             tableNode.remove();
  //           } catch (error) {
  //             console.error("Failed to delete table:", error);
  //           }
  //           break;
           
  //         case 'toggleRowHeader': {
  //           const rows = tableNode.getChildren();
  //           for (let r = startRow; r < startRow + numRows; r++) {
  //             if (r < rows.length) {
  //               const row = rows[r];
  //               if ($isTableRowNode(row)) {
  //                 row.getChildren().forEach((cell) => {
  //                   if ($isTableCellNode(cell)) {
  //                     try {
  //                       cell.toggleHeaderStyle(TableCellHeaderStates.ROW);
  //                     } catch (error) {
  //                       console.error("Failed to toggle row header:", error);
  //                     }
  //                   }
  //                 });
  //               }
  //             }
  //           }
  //           break;
  //         }
         
  //         case 'toggleColumnHeader': {
  //           const rows = tableNode.getChildren();
  //           for (let r = 0; r < rows.length; r++) {
  //             const row = rows[r];
  //             if ($isTableRowNode(row)) {
  //               const cells = row.getChildren();
  //               for (let c = startCol; c < startCol + numCols; c++) {
  //                 if (c < cells.length) {
  //                   const cell = cells[c];
  //                   if ($isTableCellNode(cell)) {
  //                     try {
  //                       cell.toggleHeaderStyle(TableCellHeaderStates.COLUMN);
  //                     } catch (error) {
  //                       console.error("Failed to toggle column header:", error);
  //                     }
  //                   }
  //                 }
  //               }
  //             }
  //           }
  //           break;
  //         }
  //       }

  //       // Focus the editor after the operation
  //       setTimeout(() => {
  //         const rootElement = editor.getRootElement();
  //         if (rootElement) {
  //           rootElement.focus();
  //         }
  //       }, 0);
        
  //     } catch (error) {
  //       console.error("Error executing table action:", error);
  //     }
  //   });
   
  //   handleClose();
  // }, [editor, tableCellNode]);

  // ... (previous imports and manual functions remain the same)


  const executeAction = useCallback((action) => {
    if (!tableCellNode) {
      console.error('No table cell node available');
      return;
    }

    editor.update(() => {
      try {
        const selection = $getSelection();
        let tableNode = null;
        let startRow = 0;
        let startCol = 0;
        let numRows = 1;
        let numCols = 1;

        if (!tableCellNode || !tableCellNode.isAttached()) {
          return;
        }

        try {
          tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode);
        } catch (error) {
          console.error("Table node not found:", error);
          return;
        }

        if (!tableNode.isAttached()) return;

        startRow = $getTableRowIndexFromTableCellNode(tableCellNode);
        startCol = $getTableColumnIndexFromTableCellNode(tableCellNode);

        if ($isTableSelection(selection)) {
          const shape = selection.getShape();
          numRows = shape.toY - shape.fromY + 1;
          numCols = shape.toX - shape.fromX + 1;
        }

        // Execute action with fallback to manual implementation
        switch (action) {
           case 'insertRowAbove':
            try {
              $insertTableRow(tableNode, startRow, false, numRows);
            } catch (error) {
              console.warn("Built-in row insertion failed, using manual method");
              manualInsertTableRow(tableNode, startRow, false, numRows);
            }
            break;
           
          case 'insertRowBelow':
            try {
              // Insert AFTER the current row (or selection)
              $insertTableRow(tableNode, startRow + numRows - 1, true, numRows);
            } catch (error) {
              console.warn("Built-in row insertion failed, using manual method");
              manualInsertTableRow(tableNode, startRow + numRows - 1, true, numRows);
            }
            break;
            
          case 'insertColumnLeft':
            try {
              $insertTableColumn(tableNode, startCol, false, numCols);
            } catch (error) {
              console.warn("Built-in column insertion failed, using manual method");
              manualInsertTableColumn(tableNode, startCol, false, numCols);
            }
            break;
           
          case 'insertColumnRight':
            try {
              // Insert AFTER the current column (or selection)
              $insertTableColumn(tableNode, startCol + numCols - 1, true, numCols);
            } catch (error) {
              console.warn("Built-in column insertion failed, using manual method");
              manualInsertTableColumn(tableNode, startCol + numCols - 1, true, numCols);
            }
            break;
           
           case 'deleteRow':
            for (let i = startRow + numRows - 1; i >= startRow; i--) {
              try {
                $removeTableRowAtIndex(tableNode, i);
              } catch (error) {
                console.error(`Failed to delete row at index ${i}:`, error);
              }
            }
            break;
           
          case 'deleteColumn':
            for (let i = startCol + numCols - 1; i >= startCol; i--) {
              try {
                $deleteTableColumn(tableNode, i);
              } catch (error) {
                console.error(`Failed to delete column at index ${i}:`, error);
              }
            }
            break;
           
          case 'deleteTable':
            try {
              tableNode.remove();
            } catch (error) {
              console.error("Failed to delete table:", error);
            }
            break;
           
          case 'toggleRowHeader': {
            const rows = tableNode.getChildren();
            for (let r = startRow; r < startRow + numRows; r++) {
              if (r < rows.length) {
                const row = rows[r];
                if ($isTableRowNode(row)) {
                  row.getChildren().forEach((cell) => {
                    if ($isTableCellNode(cell)) {
                      try {
                        cell.toggleHeaderStyle(TableCellHeaderStates.ROW);
                      } catch (error) {
                        console.error("Failed to toggle row header:", error);
                      }
                    }
                  });
                }
              }
            }
            break;
          }
         
          case 'toggleColumnHeader': {
            const rows = tableNode.getChildren();
            for (let r = 0; r < rows.length; r++) {
              const row = rows[r];
              if ($isTableRowNode(row)) {
                const cells = row.getChildren();
                for (let c = startCol; c < startCol + numCols; c++) {
                  if (c < cells.length) {
                    const cell = cells[c];
                    if ($isTableCellNode(cell)) {
                      try {
                        cell.toggleHeaderStyle(TableCellHeaderStates.COLUMN);
                      } catch (error) {
                        console.error("Failed to toggle column header:", error);
                      }
                    }
                  }
                }
              }
            }
            break;
          }
        }
        

        // Focus the editor after the operation
        setTimeout(() => {
          const rootElement = editor.getRootElement();
          if (rootElement) {
            rootElement.focus();
          }
        }, 0);
        
      } catch (error) {
        console.error("Error executing table action:", error);
      }
    });
   
    handleClose();
  }, [editor, tableCellNode]);


  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleButtonClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const getHeaderStateText = (action) => {
    if (!tableCellNode) return action === 'toggleRowHeader' ? 'Add Row Header' : 'Add Column Header';
    
    let hasHeader = false;
    try {
      if (action === 'toggleRowHeader') {
        hasHeader = (tableCellNode.__headerState & TableCellHeaderStates.ROW) === TableCellHeaderStates.ROW;
      } else {
        hasHeader = (tableCellNode.__headerState & TableCellHeaderStates.COLUMN) === TableCellHeaderStates.COLUMN;
      }
    } catch (e) {
      // Fallback if header state is not accessible
    }
    
    const prefix = hasHeader ? 'Remove' : 'Add';
    const suffix = action === 'toggleRowHeader' ? 'Row Header' : 'Column Header';
    return `${prefix} ${suffix}`;
  };

  const menuItems = [
    {
      label: `Insert ${selectionCounts.rows === 1 ? 'row' : `${selectionCounts.rows} rows`} above`,
      action: 'insertRowAbove',
      icon: <AddIcon />,
    },
    {
      label: `Insert ${selectionCounts.rows === 1 ? 'row' : `${selectionCounts.rows} rows`} below`,
      action: 'insertRowBelow',
      icon: <AddIcon />,
    },
    { divider: true },
    {
      label: `Insert ${selectionCounts.columns === 1 ? 'column' : `${selectionCounts.columns} columns`} left`,
      action: 'insertColumnLeft',
      icon: <AddIcon />,
    },
    {
      label: `Insert ${selectionCounts.columns === 1 ? 'column' : `${selectionCounts.columns} columns`} right`,
      action: 'insertColumnRight',
      icon: <AddIcon />,
    },
    { divider: true },
    {
      label: getHeaderStateText('toggleRowHeader'),
      action: 'toggleRowHeader',
      icon: <TableRowsIcon />,
    },
    {
      label: getHeaderStateText('toggleColumnHeader'),
      action: 'toggleColumnHeader',
      icon: <ViewColumnIcon />,
    },
    { divider: true },
    {
      label: `Delete ${selectionCounts.rows === 1 ? 'row' : 'rows'}`,
      action: 'deleteRow',
      icon: <RemoveIcon />,
      color: 'error'
    },
    {
      label: `Delete ${selectionCounts.columns === 1 ? 'column' : 'columns'}`,
      action: 'deleteColumn',
      icon: <RemoveIcon />,
      color: 'error'
    },
    {
      label: 'Delete table',
      action: 'deleteTable',
      icon: <DeleteIcon />,
      color: 'error'
    }
  ];

  return (
    <>
      {/* Floating Action Button */}
      <div ref={containerRef}>
        <Fade in={showButton}>
          <Box
            className="table-action-button"
            sx={{
              // position: 'absolute',
              // top: buttonPosition.top,
              // left: buttonPosition.left,
              zIndex: 1000,
            }}
          >
            <Tooltip title="Table Actions">
              <IconButton
                size="small"
                onClick={handleButtonClick}
                sx={{
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  boxShadow: 2,
                  width: 28,
                  height: 28,
                }}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Fade>
      </div>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: 400,
            width: '220px',
          },
        }}
      >
        {menuItems.map((item, index) => {
          if (item.divider) {
            return <Divider key={`divider-${index}`} />;
          }

          return (
            <MenuItem
              key={item.action}
              onClick={() => executeAction(item.action)}
              sx={{
                color: item.color === 'error' ? 'error.main' : 'inherit',
              }}
            >
              <ListItemIcon
                sx={{
                  color: item.color === 'error' ? 'error.main' : 'inherit',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
}