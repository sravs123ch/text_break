import React, { useState, useEffect, useRef } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getTableCellNodeFromLexicalNode,
  $getTableNodeFromLexicalNodeOrThrow,
  $isTableCellNode,
  $isTableSelection,
} from "@lexical/table";
import {
  $getSelection,
  $isRangeSelection,
  $getNodeByKey,
} from "lexical";
import {
  Box,
  IconButton,
  Popover,
  Typography,
  Grid,
  Button,
} from "@mui/material";
import {
  GridOn as GridOnIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import { SketchPicker } from "react-color";

// Predefined color palette for quick selection
const PRESET_COLORS = [
  '#FFFFFF', '#F8F9FA', '#E9ECEF', '#DEE2E6', '#CED4DA', '#ADB5BD',
  '#6C757D', '#495057', '#343A40', '#212529', '#000000',
  '#FFF3CD', '#FCF8E3', '#D4EDDA', '#D1ECF1', '#CCE5FF', '#E2E3F3',
  '#F8D7DA', '#F5C6CB', '#FADBD8', '#FDEBD0', '#FFF2CC', '#E1F5FE',
  '#FFEB3B', '#FFC107', '#FF9800', '#FF5722', '#F44336', '#E91E63',
  '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4',
  '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107'
];

export default function TableCellShadingPlugin() {
  const [editor] = useLexicalComposerContext();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCells, setSelectedCells] = useState([]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [customColor, setCustomColor] = useState('#FFFFFF');

  // Track selected cells
  useEffect(() => {
    const updateListener = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        const cells = [];

        if ($isTableSelection(selection)) {
          // Multiple cell selection
          const shape = selection.getShape();
          const tableNode = $getNodeByKey(selection.tableKey);
          
          if (tableNode) {
            const rows = tableNode.getChildren();
            for (let y = shape.fromY; y <= shape.toY; y++) {
              if (y < rows.length) {
                const row = rows[y];
                const rowCells = row.getChildren();
                for (let x = shape.fromX; x <= shape.toX; x++) {
                  if (x < rowCells.length) {
                    const cell = rowCells[x];
                    if ($isTableCellNode(cell)) {
                      cells.push(cell);
                    }
                  }
                }
              }
            }
          }
        } else if ($isRangeSelection(selection)) {
          // Single cell selection
          const node = selection.anchor.getNode();
          const cellNode = $getTableCellNodeFromLexicalNode(node);
          if (cellNode) {
            cells.push(cellNode);
          }
        }

        setSelectedCells(cells);
      });
    });

    return updateListener;
  }, [editor]);

  const handleColorClick = (event) => {
    if (selectedCells.length === 0) {
      return;
    }
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setShowColorPicker(false);
  };

  const applyCellShading = (color) => {
    if (selectedCells.length === 0) return;

    editor.update(() => {
      selectedCells.forEach((cellNode) => {
        if ($isTableCellNode(cellNode) && cellNode.isAttached()) {
          // Get the DOM element for this cell
          const cellElement = editor.getElementByKey(cellNode.getKey());
          if (cellElement) {
            cellElement.style.backgroundColor = color;
            
            // Also store the color as a data attribute for persistence
            cellElement.setAttribute('data-bg-color', color);
          }
        }
      });
    });

    handleClose();
  };

  const clearCellShading = () => {
    if (selectedCells.length === 0) return;

    editor.update(() => {
      selectedCells.forEach((cellNode) => {
        if ($isTableCellNode(cellNode) && cellNode.isAttached()) {
          const cellElement = editor.getElementByKey(cellNode.getKey());
          if (cellElement) {
            cellElement.style.backgroundColor = '';
            cellElement.removeAttribute('data-bg-color');
          }
        }
      });
    });

    handleClose();
  };

  const handleCustomColorChange = (color) => {
    setCustomColor(color.hex);
  };

  const applyCustomColor = () => {
    applyCellShading(customColor);
  };

  const isOpen = Boolean(anchorEl);
  const hasSelectedCells = selectedCells.length > 0;

  return (
    <>
      <IconButton
        aria-label="Table cell shading"
        size="small"
        onClick={handleColorClick}
        disabled={!hasSelectedCells}
        sx={{
          color: hasSelectedCells ? "primary.main" : "disabled",
        }}
      >
        <GridOnIcon />
      </IconButton>

      <Popover
        open={isOpen}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: 2, maxWidth: 300 }}>
          <Typography variant="subtitle2" gutterBottom>
            Cell Shading ({selectedCells.length} cell{selectedCells.length !== 1 ? 's' : ''} selected)
          </Typography>

          {/* Clear formatting button */}
          <Box sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<ClearIcon />}
              onClick={clearCellShading}
              fullWidth
            >
              No Fill
            </Button>
          </Box>

          {/* Preset color palette */}
          <Typography variant="caption" display="block" gutterBottom>
            Theme Colors
          </Typography>
          <Grid container spacing={0.5} sx={{ mb: 2 }}>
            {PRESET_COLORS.map((color, index) => (
              <Grid item key={index}>
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    backgroundColor: color,
                    border: '1px solid #ccc',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      boxShadow: 1,
                    },
                  }}
                  onClick={() => applyCellShading(color)}
                  title={color}
                />
              </Grid>
            ))}
          </Grid>

          {/* Custom color picker toggle */}
          <Button
            variant="text"
            size="small"
            onClick={() => setShowColorPicker(!showColorPicker)}
            fullWidth
          >
            {showColorPicker ? 'Hide' : 'More Colors...'}
          </Button>

          {/* Custom color picker */}
          {showColorPicker && (
            <Box sx={{ mt: 2 }}>
              <SketchPicker
                color={customColor}
                onChangeComplete={handleCustomColorChange}
                width="260px"
              />
              <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={applyCustomColor}
                  fullWidth
                >
                  Apply Color
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Popover>
    </>
  );
}