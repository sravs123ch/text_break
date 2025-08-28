import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";

export default function TableResizePlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const rootElement = editor.getRootElement();
    if (!rootElement) return;

    let isResizing = false;
    let currentCell = null;
    let startX = 0;
    let startWidth = 0;

    const handleMouseDown = (event) => {
      const target = event.target;
      const cell = target.closest('td, th');
      
      if (cell && isNearRightBorder(event, cell)) {
        isResizing = true;
        currentCell = cell;
        startX = event.clientX;
        startWidth = cell.offsetWidth;
        
        event.preventDefault();
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        
        // Change cursor
        document.body.style.cursor = 'col-resize';
      }
    };

    const handleMouseMove = (event) => {
      if (!isResizing || !currentCell) return;
      
      const diff = event.clientX - startX;
      const newWidth = Math.max(50, startWidth + diff); // Minimum width of 50px
      
      currentCell.style.width = `${newWidth}px`;
      currentCell.style.minWidth = `${newWidth}px`;
    };

    const handleMouseUp = () => {
      if (isResizing) {
        isResizing = false;
        currentCell = null;
        document.body.style.cursor = 'default';
        
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      }
    };

    const handleMouseMove_Hover = (event) => {
      if (isResizing) return;
      
      const target = event.target;
      const cell = target.closest('td, th');
      
      if (cell && isNearRightBorder(event, cell)) {
        document.body.style.cursor = 'col-resize';
      } else {
        document.body.style.cursor = 'default';
      }
    };

    const isNearRightBorder = (event, cell) => {
      const rect = cell.getBoundingClientRect();
      const threshold = 5; // 5px threshold for resize handle
      return event.clientX >= rect.right - threshold && event.clientX <= rect.right + threshold;
    };

    rootElement.addEventListener('mousedown', handleMouseDown);
    rootElement.addEventListener('mousemove', handleMouseMove_Hover);

    return () => {
      rootElement.removeEventListener('mousedown', handleMouseDown);
      rootElement.removeEventListener('mousemove', handleMouseMove_Hover);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [editor]);

  return null;
}