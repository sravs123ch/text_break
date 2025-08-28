import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  IconButton,
  Paper,
  Tooltip,
  ClickAwayListener,
  Divider,
} from "@mui/material";
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  GridOn as GridOnIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $insertTableRow__EXPERIMENTAL,
  $insertTableColumn__EXPERIMENTAL,
  $deleteTableRow__EXPERIMENTAL,
  $deleteTableColumn__EXPERIMENTAL,
  $isTableCellNode,
  $isTableRowNode,
  $isTableNode,
  getTableObserverFromTableElement,
} from "@lexical/table";
import {
  $getSelection,
  $isNodeSelection,
  $getNodeByKey,
  $setSelection,
} from "lexical";
import { $findMatchingParent } from "@lexical/utils";
import { SketchPicker } from "react-color";

export default function TableActionsPlugin() {
  const [editor] = useLexicalComposerContext();
  const [showMenu, setShowMenu] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [hoveredCell, setHoveredCell] = useState(null);
  const [selectedColor, setSelectedColor] = useState("#ffffff");
  const menuRef = useRef(null);
  const colorPickerRef = useRef(null);

  useEffect(() => {
    const rootElement = editor.getRootElement();
    if (!rootElement) return;

    let hoverTimeout = null;

    const handleCellMouseEnter = (event) => {
      const cell = event.target.closest('td, th');
      if (!cell) return;

      clearTimeout(hoverTimeout);
      hoverTimeout = setTimeout(() => {
        const rect = cell.getBoundingClientRect();
        setMenuPosition({
          x: rect.right - 40,
          y: rect.top + 5,
        });
        setHoveredCell(cell);
        setShowMenu(true);
      }, 500); // Show menu after 500ms hover
    };

    const handleCellMouseLeave = (event) => {
      clearTimeout(hoverTimeout);
      const relatedTarget = event.relatedTarget;
      
      // Don't hide if moving to the menu
      if (menuRef.current && menuRef.current.contains(relatedTarget)) {
        return;
      }
      
      // Don't hide if moving to color picker
      if (colorPickerRef.current && colorPickerRef.current.contains(relatedTarget)) {
        return;
      }

      setTimeout(() => {
        setShowMenu(false);
        setShowColorPicker(false);
        setHoveredCell(null);
      }, 100);
    };

    const handleMenuMouseEnter = () => {
      clearTimeout(hoverTimeout);
    };

    const handleMenuMouseLeave = (event) => {
      const relatedTarget = event.relatedTarget;
      
      // Don't hide if moving to color picker
      if (colorPickerRef.current && colorPickerRef.current.contains(relatedTarget)) {
        return;
      }
      
      // Don't hide if moving back to cell
      if (hoveredCell && hoveredCell.contains(relatedTarget)) {
        return;
      }

      setTimeout(() => {
        setShowMenu(false);
        setShowColorPicker(false);
      }, 100);
    };

    // Add event listeners to all table cells
    const addCellListeners = () => {
      const cells = rootElement.querySelectorAll('td, th');
      cells.forEach(cell => {
        cell.addEventListener('mouseenter', handleCellMouseEnter);
        cell.addEventListener('mouseleave', handleCellMouseLeave);
      });
    };

    // Initial setup
    addCellListeners();

    // Re-add listeners when editor content changes
    const removeUpdateListener = editor.registerUpdateListener(() => {
      setTimeout(addCellListeners, 100);
    });

    // Add menu listeners
    if (menuRef.current) {
      menuRef.current.addEventListener('mouseenter', handleMenuMouseEnter);
      menuRef.current.addEventListener('mouseleave', handleMenuMouseLeave);
    }

    return () => {
      clearTimeout(hoverTimeout);
      removeUpdateListener();
      const cells = rootElement.querySelectorAll('td, th');
      cells.forEach(cell => {
        cell.removeEventListener('mouseenter', handleCellMouseEnter);
        cell.removeEventListener('mouseleave', handleCellMouseLeave);
      });
    };
  }, [editor, hoveredCell]);

  const getCellNodeFromDOMCell = (domCell) => {
    const cellKey = domCell.getAttribute('data-lexical-key');
    if (!cellKey) return null;
    
    let cellNode = null;
    editor.getEditorState().read(() => {
      cellNode = $getNodeByKey(cellKey);
    });
    return cellNode;
  };

  const insertRowAbove = () => {
    if (!hoveredCell) return;
    
    editor.update(() => {
      const cellNode = getCellNodeFromDOMCell(hoveredCell);
      if (!cellNode || !$isTableCellNode(cellNode)) return;
      
      const tableRowNode = $findMatchingParent(cellNode, $isTableRowNode);
      if (!tableRowNode) return;
      
      try {
        $insertTableRow__EXPERIMENTAL(false); // false = above
      } catch (error) {
        console.error('Error inserting row above:', error);
      }
    });
    setShowMenu(false);
  };

  const insertRowBelow = () => {
    if (!hoveredCell) return;
    
    editor.update(() => {
      const cellNode = getCellNodeFromDOMCell(hoveredCell);
      if (!cellNode || !$isTableCellNode(cellNode)) return;
      
      const tableRowNode = $findMatchingParent(cellNode, $isTableRowNode);
      if (!tableRowNode) return;
      
      try {
        $insertTableRow__EXPERIMENTAL(true); // true = below
      } catch (error) {
        console.error('Error inserting row below:', error);
      }
    });
    setShowMenu(false);
  };

  const insertColumnLeft = () => {
    if (!hoveredCell) return;
    
    editor.update(() => {
      const cellNode = getCellNodeFromDOMCell(hoveredCell);
      if (!cellNode || !$isTableCellNode(cellNode)) return;
      
      try {
        $insertTableColumn__EXPERIMENTAL(false); // false = left
      } catch (error) {
        console.error('Error inserting column left:', error);
      }
    });
    setShowMenu(false);
  };

  const insertColumnRight = () => {
    if (!hoveredCell) return;
    
    editor.update(() => {
      const cellNode = getCellNodeFromDOMCell(hoveredCell);
      if (!cellNode || !$isTableCellNode(cellNode)) return;
      
      try {
        $insertTableColumn__EXPERIMENTAL(true); // true = right
      } catch (error) {
        console.error('Error inserting column right:', error);
      }
    });
    setShowMenu(false);
  };

  const deleteRow = () => {
    if (!hoveredCell) return;
    
    editor.update(() => {
      const cellNode = getCellNodeFromDOMCell(hoveredCell);
      if (!cellNode || !$isTableCellNode(cellNode)) return;
      
      try {
        $deleteTableRow__EXPERIMENTAL();
      } catch (error) {
        console.error('Error deleting row:', error);
      }
    });
    setShowMenu(false);
  };

  const deleteColumn = () => {
    if (!hoveredCell) return;
    
    editor.update(() => {
      const cellNode = getCellNodeFromDOMCell(hoveredCell);
      if (!cellNode || !$isTableCellNode(cellNode)) return;
      
      try {
        $deleteTableColumn__EXPERIMENTAL();
      } catch (error) {
        console.error('Error deleting column:', error);
      }
    });
    setShowMenu(false);
  };

  const applyBackgroundColor = (color) => {
    if (!hoveredCell) return;
    
    editor.update(() => {
      const cellNode = getCellNodeFromDOMCell(hoveredCell);
      if (!cellNode || !$isTableCellNode(cellNode)) return;
      
      // Apply background color to the cell
      hoveredCell.style.backgroundColor = color;
    });
    setShowColorPicker(false);
    setShowMenu(false);
  };

  const handleColorChange = (color) => {
    setSelectedColor(color.hex);
    applyBackgroundColor(color.hex);
  };

  if (!showMenu) return null;

  return (
    <ClickAwayListener onClickAway={() => {
      setShowMenu(false);
      setShowColorPicker(false);
    }}>
      <Paper
        ref={menuRef}
        elevation={8}
        sx={{
          position: 'fixed',
          left: menuPosition.x,
          top: menuPosition.y,
          zIndex: 1000,
          p: 1,
          minWidth: 200,
          backgroundColor: 'white',
          border: '1px solid #ddd',
        }}
      >
        <Box display="flex" flexDirection="column" gap={0.5}>
          <Tooltip title="Insert Row Above" placement="left">
            <IconButton size="small" onClick={insertRowAbove}>
              <AddIcon fontSize="small" />
              <span style={{ fontSize: '12px', marginLeft: '4px' }}>Row Above</span>
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Insert Row Below" placement="left">
            <IconButton size="small" onClick={insertRowBelow}>
              <AddIcon fontSize="small" />
              <span style={{ fontSize: '12px', marginLeft: '4px' }}>Row Below</span>
            </IconButton>
          </Tooltip>
          
          <Divider />
          
          <Tooltip title="Insert Column Left" placement="left">
            <IconButton size="small" onClick={insertColumnLeft}>
              <AddIcon fontSize="small" />
              <span style={{ fontSize: '12px', marginLeft: '4px' }}>Column Left</span>
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Insert Column Right" placement="left">
            <IconButton size="small" onClick={insertColumnRight}>
              <AddIcon fontSize="small" />
              <span style={{ fontSize: '12px', marginLeft: '4px' }}>Column Right</span>
            </IconButton>
          </Tooltip>
          
          <Divider />
          
          <Tooltip title="Delete Row" placement="left">
            <IconButton size="small" onClick={deleteRow} color="error">
              <RemoveIcon fontSize="small" />
              <span style={{ fontSize: '12px', marginLeft: '4px' }}>Delete Row</span>
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Delete Column" placement="left">
            <IconButton size="small" onClick={deleteColumn} color="error">
              <RemoveIcon fontSize="small" />
              <span style={{ fontSize: '12px', marginLeft: '4px' }}>Delete Column</span>
            </IconButton>
          </Tooltip>
          
          <Divider />
          
          <Tooltip title="Cell Shading" placement="left">
            <IconButton 
              size="small" 
              onClick={() => setShowColorPicker(!showColorPicker)}
            >
              <GridOnIcon fontSize="small" />
              <span style={{ fontSize: '12px', marginLeft: '4px' }}>Shading</span>
            </IconButton>
          </Tooltip>
        </Box>
        
        {showColorPicker && (
          <Box
            ref={colorPickerRef}
            sx={{
              position: 'absolute',
              top: 0,
              left: '100%',
              ml: 1,
              zIndex: 1001,
            }}
          >
            <SketchPicker
              color={selectedColor}
              onChangeComplete={handleColorChange}
            />
          </Box>
        )}
      </Paper>
    </ClickAwayListener>
  );
}