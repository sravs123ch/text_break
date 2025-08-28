import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection } from "lexical";
import { useEffect } from "react";

const TextColorPlugin = ({ textColor, backgroundColor }) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (textColor || backgroundColor) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          if (textColor) {
            selection.formatText("textColor", textColor);
          }
          if (backgroundColor) {
            selection.formatText("backgroundColor", backgroundColor);
          }
        }
      });
    }
  }, [editor, textColor, backgroundColor]);

  return null;
};

export default TextColorPlugin;