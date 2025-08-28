import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Menu,
  MenuItem,
  Divider,
  Typography,
  Popover,
  Grid,
} from "@mui/material";
import {
  TableChart as TableChartIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  FormatColorFill as FormatColorFillIcon,
  BorderAll as BorderAllIcon,
  BorderClear as BorderClearIcon,
} from "@mui/icons-material";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createTableNodeWithDimensions, $isTableNode } from "@lexical/table";
import { $insertNodeToNearestRoot } from "@lexical/utils";
import { $getSelection, $isNodeSelection } from "lexical";
import { SketchPicker } from "react-color";

export default function EnhancedTablePlugin() {
  const [isOpen, setIsOpen] = useState(false);
  const [rows, setRows] = useState("3");
  const [columns, setColumns] = useState("3");
  const [editor] = useLexicalComposerContext();
  const [anchorEl, setAnchorEl] = useState(null);
  const [colorPickerAnchor, setColorPickerAnchor] = useState(null);
  const [selectedColor, setSelectedColor] = useState("#ffffff");

  const onAddTable = () => {
    if (!rows || !columns) return;
    
    editor.update(() => {
      const tableNode = $createTableNodeWithDimensions(
        parseInt(rows, 10),
        parseInt(columns, 10),
        false // No headers by default
      );
      $insertNodeToNearestRoot(tableNode);
    });
    
    setRows("3");
    setColumns("3");
    setIsOpen(false);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleColorPickerOpen = (event) => {
    setColorPickerAnchor(event.currentTarget);
  };

  const handleColorPickerClose = () => {
    setColorPickerAnchor(null);
  };

  const insertRowAbove = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isNodeSelection(selection)) {
        const nodes = selection.getNodes();
        const tableNode = nodes.find(node => $isTableNode(node.getParent()?.getParent()));
        if (tableNode) {
          // Logic to insert row above
          console.log("Insert row above");
        }
      }
    });
    handleMenuClose();
  };

  const insertRowBelow = () => {
    editor.update(() => {
      // Logic to insert row below
      console.log("Insert row below");
    });
    handleMenuClose();
  };

  const insertColumnLeft = () => {
    editor.update(() => {
      // Logic to insert column left
      console.log("Insert column left");
    });
    handleMenuClose();
  };

  const insertColumnRight = () => {
    editor.update(() => {
      // Logic to insert column right
      console.log("Insert column right");
    });
    handleMenuClose();
  };

  const deleteRow = () => {
    editor.update(() => {
      // Logic to delete row
      console.log("Delete row");
    });
    handleMenuClose();
  };

  const deleteColumn = () => {
    editor.update(() => {
      // Logic to delete column
      console.log("Delete column");
    });
    handleMenuClose();
  };

  const applyBackgroundColor = (color) => {
    editor.update(() => {
      // Logic to apply background color to selected cells
      console.log("Apply background color:", color);
    });
    handleColorPickerClose();
  };

  return (
    <>
      <Dialog open={isOpen} onClose={() => setIsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Insert Table</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={3} mt={2}>
            <TextField
              type="number"
              label="Rows"
              value={rows}
              onChange={(e) => setRows(e.target.value)}
              autoFocus
              fullWidth
              inputProps={{ min: 1, max: 20 }}
            />
            <TextField
              type="number"
              label="Columns"
              value={columns}
              onChange={(e) => setColumns(e.target.value)}
              fullWidth
              inputProps={{ min: 1, max: 10 }}
            />
            
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Table Options
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<BorderAllIcon />}
                  onClick={() => console.log("Add borders")}
                >
                  Borders
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<FormatColorFillIcon />}
                  onClick={handleColorPickerOpen}
                >
                  Background
                </Button>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button
            onClick={onAddTable}
            disabled={!rows || !columns || isNaN(rows) || isNaN(columns) || rows <= 0 || columns <= 0}
            variant="contained"
          >
            Insert Table
          </Button>
        </DialogActions>
      </Dialog>

      {/* Color Picker Popover */}
      <Popover
        open={Boolean(colorPickerAnchor)}
        anchorEl={colorPickerAnchor}
        onClose={handleColorPickerClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Box p={2}>
          <SketchPicker
            color={selectedColor}
            onChangeComplete={(color) => {
              setSelectedColor(color.hex);
              applyBackgroundColor(color.hex);
            }}
          />
        </Box>
      </Popover>

      {/* Table Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          style: {
            maxHeight: 400,
            width: '250px',
          },
        }}
      >
        <MenuItem onClick={insertRowAbove}>
          <AddIcon fontSize="small" style={{ marginRight: 8 }} />
          Insert Row Above
        </MenuItem>
        <MenuItem onClick={insertRowBelow}>
          <AddIcon fontSize="small" style={{ marginRight: 8 }} />
          Insert Row Below
        </MenuItem>
        <Divider />
        <MenuItem onClick={insertColumnLeft}>
          <AddIcon fontSize="small" style={{ marginRight: 8 }} />
          Insert Column Left
        </MenuItem>
        <MenuItem onClick={insertColumnRight}>
          <AddIcon fontSize="small" style={{ marginRight: 8 }} />
          Insert Column Right
        </MenuItem>
        <Divider />
        <MenuItem onClick={deleteRow}>
          <RemoveIcon fontSize="small" style={{ marginRight: 8 }} />
          Delete Row
        </MenuItem>
        <MenuItem onClick={deleteColumn}>
          <RemoveIcon fontSize="small" style={{ marginRight: 8 }} />
          Delete Column
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleColorPickerOpen}>
          <FormatColorFillIcon fontSize="small" style={{ marginRight: 8 }} />
          Cell Background Color
        </MenuItem>
        <MenuItem onClick={() => console.log("Clear formatting")}>
          <BorderClearIcon fontSize="small" style={{ marginRight: 8 }} />
          Clear Formatting
        </MenuItem>
      </Menu>

      {/* Main Table Button */}
      <Box display="flex" alignItems="center">
        <IconButton
          aria-label="Add Table"
          size="small"
          onClick={() => setIsOpen(true)}
        >
          <TableChartIcon style={{ color: "black" }} />
        </IconButton>
        <IconButton
          aria-label="Table Options"
          size="small"
          onClick={handleMenuClick}
        >
          <MoreVertIcon style={{ color: "black" }} />
        </IconButton>
      </Box>
    </>
  );
}