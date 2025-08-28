// import React, { useState, useEffect } from "react";
// import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
// import {
//   $getSelection,
//   $isRangeSelection,
//   SELECTION_CHANGE_COMMAND,
// } from "lexical";
// import {
//   $patchStyleText,
//   $getSelectionStyleValueForProperty,
// } from "@lexical/selection";
// import { mergeRegister } from "@lexical/utils";
// import { Select, MenuItem, FormControl, InputLabel, Box } from "@mui/material";

// const LOW_PRIORITY = 1;

// // Font size options (in pixels)
// const FONT_SIZES = [
//   { label: "8px", value: "8px" },
//   { label: "9px", value: "9px" },
//   { label: "10px", value: "10px" },
//   { label: "11px", value: "11px" },
//   { label: "12px", value: "12px" },
//   { label: "14px", value: "14px" },
//   { label: "16px", value: "16px" },
//   { label: "18px", value: "18px" },
//   { label: "20px", value: "20px" },
//   { label: "24px", value: "24px" },
//   { label: "28px", value: "28px" },
//   { label: "32px", value: "32px" },
//   { label: "36px", value: "36px" },
//   { label: "48px", value: "48px" },
//   { label: "60px", value: "60px" },
//   { label: "72px", value: "72px" },
// ];

// // Font family options
// const FONT_FAMILIES = [
//   { label: "Arial", value: "Arial, sans-serif" },
//   { label: "Times New Roman", value: "Times New Roman, serif" },
//   { label: "Helvetica", value: "Helvetica, sans-serif" },
//   { label: "Georgia", value: "Georgia, serif" },
//   { label: "Verdana", value: "Verdana, sans-serif" },
//   { label: "Courier New", value: "Courier New, monospace" },
//   { label: "Trebuchet MS", value: "Trebuchet MS, sans-serif" },
//   { label: "Palatino", value: "Palatino, serif" },
//   { label: "Garamond", value: "Garamond, serif" },
//   { label: "Bookman", value: "Bookman, serif" },
//   { label: "Comic Sans MS", value: "Comic Sans MS, cursive" },
//   { label: "Impact", value: "Impact, sans-serif" },
// ];

// export default function FontPlugin() {
//   const [editor] = useLexicalComposerContext();
//   const [fontSize, setFontSize] = useState("16px");
//   const [fontFamily, setFontFamily] = useState("Arial, sans-serif");

//   const updateToolbar = () => {
//     const selection = $getSelection();
//     if ($isRangeSelection(selection)) {
//       const currentFontSize = $getSelectionStyleValueForProperty(
//         selection,
//         "font-size",
//         "16px"
//       );
//       const currentFontFamily = $getSelectionStyleValueForProperty(
//         selection,
//         "font-family",
//         "Arial, sans-serif"
//       );
      
//       setFontSize(currentFontSize);
//       setFontFamily(currentFontFamily);
//     }
//   };

//   useEffect(() => {
//     return mergeRegister(
//       editor.registerUpdateListener(({ editorState }) => {
//         editorState.read(() => {
//           updateToolbar();
//         });
//       }),
//       editor.registerCommand(
//         SELECTION_CHANGE_COMMAND,
//         () => {
//           updateToolbar();
//           return false;
//         },
//         LOW_PRIORITY
//       )
//     );
//   }, [editor]);

//   const handleFontSizeChange = (event) => {
//     const newSize = event.target.value;
//     setFontSize(newSize);
    
//     editor.update(() => {
//       const selection = $getSelection();
//       if ($isRangeSelection(selection)) {
//         $patchStyleText(selection, { "font-size": newSize });
//       }
//     });
//   };

//   const handleFontFamilyChange = (event) => {
//     const newFamily = event.target.value;
//     setFontFamily(newFamily);
    
//     editor.update(() => {
//       const selection = $getSelection();
//       if ($isRangeSelection(selection)) {
//         $patchStyleText(selection, { "font-family": newFamily });
//       }
//     });
//   };

//   return (
//     <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
//       <FormControl size="small" sx={{ minWidth: 80 }}>
//         <InputLabel>Size</InputLabel>
//         <Select
//           value={fontSize}
//           label="Size"
//           onChange={handleFontSizeChange}
//           sx={{ fontSize: "14px" }}
//         >
//           {FONT_SIZES.map((size) => (
//             <MenuItem key={size.value} value={size.value}>
//               {size.label}
//             </MenuItem>
//           ))}
//         </Select>
//       </FormControl>

//       <FormControl size="small" sx={{ minWidth: 140 }}>
//         <InputLabel>Font</InputLabel>
//         <Select
//           value={fontFamily}
//           label="Font"
//           onChange={handleFontFamilyChange}
//           sx={{ fontSize: "14px" }}
//         >
//           {FONT_FAMILIES.map((font) => (
//             <MenuItem key={font.value} value={font.value} sx={{ fontFamily: font.value }}>
//               {font.label}
//             </MenuItem>
//           ))}
//         </Select>
//       </FormControl>
//     </Box>
//   );
// }



import React, { useState, useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import {
  $patchStyleText,
  $getSelectionStyleValueForProperty,
} from "@lexical/selection";
import { mergeRegister } from "@lexical/utils";

const LOW_PRIORITY = 1;

// Font size options (in pixels)
const FONT_SIZES = [
  { label: "8px", value: "8px" },
  { label: "9px", value: "9px" },
  { label: "10px", value: "10px" },
  { label: "11px", value: "11px" },
  { label: "12px", value: "12px" },
  { label: "14px", value: "14px" },
  { label: "16px", value: "16px" },
  { label: "18px", value: "18px" },
  { label: "20px", value: "20px" },
  { label: "24px", value: "24px" },
  { label: "28px", value: "28px" },
  { label: "32px", value: "32px" },
  { label: "36px", value: "36px" },
  { label: "48px", value: "48px" },
  { label: "60px", value: "60px" },
  { label: "72px", value: "72px" },
];

// Font family options
const FONT_FAMILIES = [
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Times New Roman", value: "Times New Roman, serif" },
  { label: "Helvetica", value: "Helvetica, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Verdana", value: "Verdana, sans-serif" },
  { label: "Courier New", value: "Courier New, monospace" },
  { label: "Trebuchet MS", value: "Trebuchet MS, sans-serif" },
  { label: "Palatino", value: "Palatino, serif" },
  { label: "Garamond", value: "Garamond, serif" },
  { label: "Bookman", value: "Bookman, serif" },
  { label: "Comic Sans MS", value: "Comic Sans MS, cursive" },
  { label: "Impact", value: "Impact, sans-serif" },
];

export default function FontPlugin() {
  const [editor] = useLexicalComposerContext();
  const [fontSize, setFontSize] = useState("16px");
  const [fontFamily, setFontFamily] = useState("Arial, sans-serif");

  const updateToolbar = () => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const currentFontSize = $getSelectionStyleValueForProperty(
        selection,
        "font-size",
        "16px"
      );
      const currentFontFamily = $getSelectionStyleValueForProperty(
        selection,
        "font-family",
        "Arial, sans-serif"
      );
      
      setFontSize(currentFontSize);
      setFontFamily(currentFontFamily);
    }
  };

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateToolbar();
          return false;
        },
        LOW_PRIORITY
      )
    );
  }, [editor]);

  const handleFontSizeChange = (event) => {
    const newSize = event.target.value;
    setFontSize(newSize);
    
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $patchStyleText(selection, { "font-size": newSize });
      }
    });
  };

  const handleFontFamilyChange = (event) => {
    const newFamily = event.target.value;
    setFontFamily(newFamily);
    
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $patchStyleText(selection, { "font-family": newFamily });
      }
    });
  };

  const selectStyle = {
    padding: "4px 8px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: "14px",
    backgroundColor: "white",
    cursor: "pointer",
    marginRight: "8px"
  };

  return (
    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
      <select
        value={fontSize}
        onChange={handleFontSizeChange}
        style={{ ...selectStyle, minWidth: "80px" }}
      >
        {FONT_SIZES.map((size) => (
          <option key={size.value} value={size.value}>
            {size.label}
          </option>
        ))}
      </select>

      <select
        value={fontFamily}
        onChange={handleFontFamilyChange}
        style={{ ...selectStyle, minWidth: "140px" }}
      >
        {FONT_FAMILIES.map((font) => (
          <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
            {font.label}
          </option>
        ))}
      </select>
    </div>
  );
}