import React from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $insertNodeToNearestRoot } from "@lexical/utils";
import { $getSelection, $isRangeSelection, createCommand, COMMAND_PRIORITY_EDITOR } from "lexical";
import { IconButton, Tooltip } from "@mui/material";
import { InsertPageBreak as InsertPageBreakIcon } from "@mui/icons-material";
import { $createPageBreakNode, PageBreakNode } from "../CustomNodes/PageBreakNode";
import { useEffect } from "react";

export const INSERT_PAGE_BREAK_COMMAND = createCommand("INSERT_PAGE_BREAK_COMMAND");

export default function PageBreakPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([PageBreakNode])) {
      throw new Error("PageBreakPlugin: PageBreakNode not registered on editor");
    }

    return editor.registerCommand(
      INSERT_PAGE_BREAK_COMMAND,
      () => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const pageBreakNode = $createPageBreakNode();
          $insertNodeToNearestRoot(pageBreakNode);
        }
        return true;
      },
      COMMAND_PRIORITY_EDITOR
    );
  }, [editor]);

  const handleInsertPageBreak = () => {
    editor.dispatchCommand(INSERT_PAGE_BREAK_COMMAND);
  };

  return (
    <Tooltip title="Insert Page Break">
      <IconButton
        aria-label="Insert Page Break"
        size="small"
        onClick={handleInsertPageBreak}
        sx={{ color: "#333" }}
      >
        <InsertPageBreakIcon />
      </IconButton>
    </Tooltip>
  );
}