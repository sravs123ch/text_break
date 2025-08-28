import React, { useState } from "react";
import {
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
} from "@mui/material";
import TableChartIcon from "@mui/icons-material/TableChart";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { 
  $createTableNodeWithDimensions,
  $insertTableRow__EXPERIMENTAL,
  $insertTableColumn__EXPERIMENTAL,
  $deleteTableRow__EXPERIMENTAL,
  $deleteTableColumn__EXPERIMENTAL,
} from "@lexical/table";
import { $insertNodeToNearestRoot } from "@lexical/utils";
import { $getSelection, $isRangeSelection } from "lexical";

export default function TablePlugin() {
  const [isOpen, setIsOpen] = useState(false);
  const [rows, setRows] = useState("");
  const [columns, setColumns] = useState("");
  const [editor] = useLexicalComposerContext();

  const onAddTable = () => {
    if (!rows || !columns) return;
    
    editor.update(() => {
      const selection = $getSelection();
      const tableNode = $createTableNodeWithDimensions(
        parseInt(rows, 10),
        parseInt(columns, 10),
        false // No headers by default
      );
      
      if ($isRangeSelection(selection)) {
        $insertNodeToNearestRoot(tableNode);
      }
    });
    
    setRows("");
    setColumns("");
    setIsOpen(false);
  };

  return (
    <>
      <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
        <DialogTitle>Add Table</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              type="number"
              label="Rows"
              value={rows}
              onChange={(e) => setRows(e.target.value)}
              autoFocus
              fullWidth
            />
            <TextField
              type="number"
              label="Columns"
              value={columns}
              onChange={(e) => setColumns(e.target.value)}
              fullWidth
            />
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

      <IconButton
        aria-label="Add Table"
        size="small"
        onClick={() => setIsOpen(true)}
      >
        <TableChartIcon style={{ color: "black" }} />
      </IconButton>

    </>
  );
}