import { useState } from "react";
import {
  Button,
  Grid,
  Popover,
  TextField,
  Box,
} from "@mui/material";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { INSERT_TABLE_COMMAND } from "@lexical/table";
import TableChartIcon from "@mui/icons-material/TableChart";

const InsertTableButton = () => {
  const [editor] = useLexicalComposerContext();
  const [anchorEl, setAnchorEl] = useState(null);
  const [rows, setRows] = useState("");
  const [columns, setColumns] = useState("");

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setRows("");
    setColumns("");
  };

  const handleInsert = () => {
    if (
      rows &&
      columns &&
      !isNaN(Number(rows)) &&
      !isNaN(Number(columns))
    ) {
      editor.dispatchCommand(INSERT_TABLE_COMMAND, {
        rows: Number(rows),
        columns: Number(columns),
      });
      handleClose();
    }
  };

  return (
    <>
      <TableChartIcon
        sx={{ fontSize: 24, cursor: "pointer" }}
        onClick={handleClick}
      />
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1 }}>
          <TextField
            label="Rows"
            variant="outlined"
            size="small"
            value={rows}
            onChange={(e) => setRows(e.target.value)}
          />
          <TextField
            label="Columns"
            variant="outlined"
            size="small"
            value={columns}
            onChange={(e) => setColumns(e.target.value)}
          />
          <Button
            variant="contained"
            size="small"
            onClick={handleInsert}
          >
            Insert
          </Button>
        </Box>
      </Popover>
    </>
  );
};

export default InsertTableButton;
