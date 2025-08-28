import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { 
  $getSelection, 
  $isRangeSelection,
  $setSelection,
  COMMAND_PRIORITY_LOW,
  CLICK_COMMAND,
} from "lexical";
import { 
  $isTableCellNode, 
  $createTableSelection,
  $isTableSelection,
  $getTableNodeFromLexicalNodeOrThrow,
  $getTableCellNodeFromLexicalNode,
  $getTableRowIndexFromTableCellNode,
  $getTableColumnIndexFromTableCellNode,
} from "@lexical/table";
import { useEffect, useState } from "react";
import { mergeRegister } from "@lexical/utils";

export default function TableSelectionPlugin() {
  const [editor] = useLexicalComposerContext();
  const [selectedCells, setSelectedCells] = useState(new Set());
  const [isSelecting, setIsSelecting] = useState(false);
  const [startCell, setStartCell] = useState(null);
  const [startCellNode, setStartCellNode] = useState(null);

  useEffect(() => {
    const rootElement = editor.getRootElement();
    if (!rootElement) return;

    let isMouseDown = false;

    const handleMouseDown = (event) => {
      // Only handle left mouse button
      if (event.button !== 0) return;
      
      const target = event.target;
      const cell = target.closest('td, th');
      
      if (cell) {
        isMouseDown = true;
        setIsSelecting(true);
        setStartCell(cell);
        
        // Get the cell node from Lexical
        editor.update(() => {
          const cellKey = cell.getAttribute('data-lexical-key');
          if (cellKey) {
            const cellNode = $getNodeByKey(cellKey);
            if ($isTableCellNode(cellNode)) {
              setStartCellNode(cellNode);
              
              // Create single cell selection
              try {
                const tableNode = $getTableNodeFromLexicalNodeOrThrow(cellNode);
                const rowIndex = $getTableRowIndexFromTableCellNode(cellNode);
                const colIndex = $getTableColumnIndexFromTableCellNode(cellNode);
                
                const tableSelection = $createTableSelection();
                tableSelection.set(tableNode.getKey(), {
                  fromX: colIndex,
                  fromY: rowIndex,
                  toX: colIndex,
                  toY: rowIndex,
                });
                
                $setSelection(tableSelection);
              } catch (error) {
                console.warn('Could not create table selection:', error);
              }
            }
          }
        });
        
        event.preventDefault();
      }
    };

    const handleMouseMove = (event) => {
      if (!isMouseDown || !isSelecting) return;
      
      const target = event.target;
      const cell = target.closest('td, th');
      
      if (cell && startCell && startCellNode) {
        editor.update(() => {
          const cellKey = cell.getAttribute('data-lexical-key');
          if (cellKey) {
            const endCellNode = $getNodeByKey(cellKey);
            if ($isTableCellNode(endCellNode)) {
              try {
                const tableNode = $getTableNodeFromLexicalNodeOrThrow(startCellNode);
                const startRowIndex = $getTableRowIndexFromTableCellNode(startCellNode);
                const startColIndex = $getTableColumnIndexFromTableCellNode(startCellNode);
                const endRowIndex = $getTableRowIndexFromTableCellNode(endCellNode);
                const endColIndex = $getTableColumnIndexFromTableCellNode(endCellNode);
                
                // Create table selection for the range
                const tableSelection = $createTableSelection();
                tableSelection.set(tableNode.getKey(), {
                  fromX: Math.min(startColIndex, endColIndex),
                  fromY: Math.min(startRowIndex, endRowIndex),
                  toX: Math.max(startColIndex, endColIndex),
                  toY: Math.max(startRowIndex, endRowIndex),
                });
                
                $setSelection(tableSelection);
              } catch (error) {
                console.warn('Could not create table selection:', error);
              }
            }
          }
        });
      }
    };

    const handleMouseUp = () => {
      isMouseDown = false;
      setIsSelecting(false);
      setStartCell(null);
      setStartCellNode(null);
    };

    const handleClick = (event) => {
      const target = event.target;
      const cell = target.closest('td, th');
      
      if (!cell) {
        // Clicked outside table, clear selection
        editor.update(() => {
          $setSelection(null);
        });
      }
    };

    rootElement.addEventListener('mousedown', handleMouseDown);
    rootElement.addEventListener('mousemove', handleMouseMove);
    rootElement.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('click', handleClick);

    return mergeRegister(
      () => {
        rootElement.removeEventListener('mousedown', handleMouseDown);
        rootElement.removeEventListener('mousemove', handleMouseMove);
        rootElement.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('click', handleClick);
      }
    );
  }, [editor, isSelecting, startCell]);

  
  return null;
}