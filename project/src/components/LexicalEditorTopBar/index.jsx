import toolbarIconsList from "./toolbarIconsList";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import useOnClickListener from "./useOnClickListener";
import { createPortal } from "react-dom";
import FloatingLinkEditor from "./FloatingLinkEditor";
import { InsertImageDialog } from "../CustomPlugins/ImagePlugin";
import { useState } from "react";
import { TwitterPicker } from "react-color";
import { eventTypes } from "./toolbarIconsList";
import ColorPlugin from "../CustomPlugins/ColorPlugin";
import InsertTableButton from "../InsertTableButton";
import { $getRoot } from "lexical";
import { $generateNodesFromDOM } from "@lexical/html";
import { renderAsync } from "docx-preview";
import TablePlugin from "../CustomPlugins/TablePlugin";
import FontPlugin from "../CustomPlugins/FontPlugin";
import TableCellShadingPlugin from "../CustomPlugins/TableCellShadingPlugin";
import TableActionMenuPlugin from "../CustomPlugins/TableActionMenuPlugin";
import { Grid, Button, Box, Popover, CircularProgress } from '@mui/material';
import PageBreakPlugin from "../CustomPlugins/PageBreakPlugin";

// Import the provided parseWordDocument and related utilities
const WORD_FONT_TO_WEB_FONT = {
  Calibri: 'Carlito',
  Cambria: 'Caladea',
  Arial: 'Arimo',
  'Times New Roman': 'Tinos',
  'Courier New': 'Cousine',
};

const WEB_FONT_TO_GOOGLE_FAMILY = {
  Carlito: 'Carlito:wght@400;700',
  Caladea: 'Caladea:wght@400;700',
  Arimo: 'Arimo:wght@400;700',
  Tinos: 'Tinos:wght@400;700',
  Cousine: 'Cousine:wght@400;700',
};

const normalizeAndCollectFonts = (html) => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  const usedWebFonts = new Set();

  const elementsWithFont = tempDiv.querySelectorAll('[style*="font-family"]');
  elementsWithFont.forEach((el) => {
    const current = el.style.fontFamily || '';
    if (!current) return;

    const normalized = current.replace(/\s*,\s*/g, ', ').replace(/\"|\'/g, '');
    let updated = normalized;

    Object.entries(WORD_FONT_TO_WEB_FONT).forEach(([wordFont, webFont]) => {
      if (normalized.toLowerCase().includes(wordFont.toLowerCase())) {
        const regex = new RegExp(`(^|, )${wordFont}(, |$)`, 'i');
        if (!new RegExp(`(^|, )${webFont}(, |$)`, 'i').test(updated)) {
          updated = updated.replace(regex, (m, p1, p2) => `${p1}${wordFont}, ${webFont}${p2 || ''}`);
          usedWebFonts.add(webFont);
        }
      }
    });

    if (updated !== normalized) {
      el.style.fontFamily = updated;
    }
  });

  return { html: tempDiv.innerHTML, usedWebFonts: Array.from(usedWebFonts) };
};

const loadWebFontsIfNeeded = (webFonts) => {
  if (!webFonts || webFonts.length === 0) return;

  const id = 'doc-compare-webfonts';
  if (document.getElementById(id)) return;

  const families = webFonts
    .map((name) => WEB_FONT_TO_GOOGLE_FAMILY[name])
    .filter(Boolean);
  if (families.length === 0) return;

  const href = `https://fonts.googleapis.com/css2?${families
    .map((f) => `family=${encodeURIComponent(f)}`)
    .join('&')}&display=swap`;

  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
};

const processImagesInHtml = (html) => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  const images = tempDiv.querySelectorAll('img');
  images.forEach((img) => {
    if (!img.style.maxWidth) img.style.maxWidth = '100%';
    if (!img.style.height) img.style.height = 'auto';
    if (!img.style.display) img.style.display = 'block';
    if (!img.alt) img.alt = 'Document image';
    img.loading = 'lazy';
    img.onerror = function () {
      this.style.display = 'none';
      console.warn('Failed to load image:', this.src);
    };
    if (img.src && img.src.startsWith('data:image') && !img.src.includes(';base64,')) {
      console.warn('Invalid base64 image format:', img.src);
    }
  });

  return tempDiv.innerHTML;
};

const parseWordDocument = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const container = document.createElement('div');
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.position = 'relative';
    container.className = 'word-document-preview';

    await renderAsync(arrayBuffer, container, container, {
      className: 'word-document-preview',
      inWrapper: false,
      ignoreWidth: false,
      ignoreHeight: false,
      ignoreFonts: false,
      ignoreLastRenderedPageBreak: true,
      experimental: true,
      trimXmlDeclaration: true,
      useBase64URL: true,
      useMathMLPolyfill: true,
      renderHeaders: true,
      renderFooters: true,
      renderFootnotes: true,
      renderEndnotes: true,
      breakPages: false,
      ignoreOutsideWidth: false,
      ignoreOutsideHeight: false,
      renderMode: 'paginated',
      pageWidth: 816,
      pageHeight: 1056,
      pageMargins: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
      renderImages: true,
      imageRendering: 'auto',
      imageQuality: 1.0,
      convertImages: true,
      imagePositioning: 'inline',
      renderTables: true,
      renderLists: true,
      renderParagraphs: true,
      renderText: true,
      renderBreaks: true,
      renderSpaces: true,
      renderTabs: true,
      renderHyperlinks: true,
      renderBookmarks: true,
      renderComments: true,
      renderRevisions: true,
      renderFields: true,
      renderFormulas: true,
      renderCharts: true,
      renderShapes: true,
      renderSmartArt: true,
      renderWatermarks: true,
      renderBackgrounds: true,
      renderBorders: true,
      renderShadows: true,
      renderEffects: true,
      renderTransforms: true,
      renderAnimations: true,
      renderMedia: true,
      renderEmbedded: true,
      renderOle: true,
      renderActiveX: true,
      renderMacros: true,
      renderCustomXml: true,
      renderContentControls: true,
      renderSdt: true,
      renderLegacyNumbering: true,
      renderLegacyBorders: true,
      renderLegacyShading: true,
      renderLegacySpacing: true,
      renderLegacyIndentation: true,
      renderLegacyAlignment: true,
      renderLegacyFonts: true,
      renderLegacyColors: true,
      renderLegacyEffects: true,
      renderLegacyTransforms: true,
      renderLegacyAnimations: true,
      renderLegacyMedia: true,
      renderLegacyEmbedded: true,
      renderLegacyOle: true,
      renderLegacyActiveX: true,
      renderLegacyMacros: true,
      renderLegacyCustomXml: true,
      renderLegacyContentControls: true,
      renderLegacySdt: true,
    });

    await new Promise((resolve) => setTimeout(resolve, 200));
    const htmlContent = container.innerHTML;
    const processedHtml = processImagesInHtml(htmlContent);
    const { html: fontNormalizedHtml, usedWebFonts } = normalizeAndCollectFonts(processedHtml);
    loadWebFontsIfNeeded(usedWebFonts);

    return fontNormalizedHtml;
  } catch (error) {
    console.error('Error parsing document:', error);
    throw new Error('Failed to parse document. Please ensure it is a valid Word document.');
  }
};

const validateFile = (file) => {
  const validTypes = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
  ];
  const validExtensions = ['.docx', '.doc'];
  const hasValidType = validTypes.includes(file.type);
  const hasValidExtension = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));

  return hasValidType || hasValidExtension;
};

const LexicalEditorTopBar = ({ onDownloadDocx }) => {
  const { onClick, selectedEventTypes, blockType, isLink, editor, modal } =
    useOnClickListener();
  const [textColorAnchorEl, setTextColorAnchorEl] = useState(null);
  const [bgColorAnchorEl, setBgColorAnchorEl] = useState(null);
  const [selectedTextColor, setSelectedTextColor] = useState("");
  const [selectedBgColor, setSelectedBgColor] = useState("");
const [isLoading, setIsLoading] = useState(false);

  const isIconSelected = (plugin) =>
    selectedEventTypes.includes(plugin.event) ||
    blockType.includes(plugin.event);

  const handleTextColorClick = (event) => {
    setTextColorAnchorEl(event.currentTarget);
  };

  const handleBgColorClick = (event) => {
    setBgColorAnchorEl(event.currentTarget);
  };

  const handleTextColorChange = (color) => {
    setSelectedTextColor(color.hex);
    onClick(eventTypes.textColor, color.hex);
    setTextColorAnchorEl(null);
  };

  const handleBgColorChange = (color) => {
    setSelectedBgColor(color.hex);
    onClick(eventTypes.backgroundColor, color.hex);
    setBgColorAnchorEl(null);
  };

  // const handleImportDocx = async (event) => {
  //   const file = event.target.files[0];
  //   if (!file) return;
 
  //   try {
  //     const arrayBuffer = await file.arrayBuffer();
  //     const container = document.createElement("div");
  //     await renderAsync(arrayBuffer, container, undefined, { inWrapper: false, useBase64URL: true });
 
  //     container.style.position = "absolute";
  //     container.style.left = "-99999px";
  //     container.style.top = "-99999px";
  //     document.body.appendChild(container);
  //     const inlineProps = [
  //       "fontFamily",
  //       "fontSize",
  //       "lineHeight",
  //       "color",
  //       "backgroundColor",
  //       "textAlign",
  //       "fontWeight",
  //       "fontStyle",
  //       "textDecorationLine",
  //       "marginTop",
  //       "marginBottom",
  //       "marginLeft",
  //       "marginRight",
  //       "textIndent",
  //     ];
  //     const targets = container.querySelectorAll("p, span, div, li, td, th, h1, h2, h3, h4, h5, h6");
  //     targets.forEach((el) => {
  //       const cs = window.getComputedStyle(el);
  //       inlineProps.forEach((prop) => {
  //         const cssVal = cs[prop];
  //         if (!cssVal) return;
  //         const styleProp = prop.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
  //         if (!el.style[prop]) {
  //           // Special-case textDecorationLine -> text-decoration
  //           const finalProp = prop === "textDecorationLine" ? "text-decoration" : styleProp;
  //           el.style.setProperty(finalProp, cssVal);
  //         }
  //       });
  //     });
  //     document.body.removeChild(container);
 
  //     const html = container.innerHTML;
  //     editor.update(() => {
  //       const parser = new DOMParser();
  //       const dom = parser.parseFromString(html, "text/html");
  //       const nodes = $generateNodesFromDOM(editor, dom);
  //       const root = $getRoot();
  //       root.clear();
  //       if (Array.isArray(nodes) && nodes.length > 0) {
  //         root.append(...nodes);
  //       }
  //     });
  //   } catch (error) {
  //     console.error("Error importing DOCX:", error);
  //     alert("Error importing DOCX file. Please try again.");
  //   }
 
  //   event.target.value = "";
  // };

  const handleImportDocx = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!validateFile(file)) {
      alert('Please select a valid DOCX or DOC file.');
      event.target.value = '';
      return;
    }

    setIsLoading(true); // Show loader

    try {
      const html = await parseWordDocument(file);

      // Apply inline styles for Lexical compatibility
      const container = document.createElement('div');
      container.innerHTML = html;
      container.style.position = 'absolute';
      container.style.left = '-99999px';
      container.style.top = '-99999px';
      document.body.appendChild(container);

      const inlineProps = [
        'fontFamily',
        'fontSize',
        'lineHeight',
        'color',
        'backgroundColor',
        'textAlign',
        'fontWeight',
        'fontStyle',
        'textDecorationLine',
        'marginTop',
        'marginBottom',
        'marginLeft',
        'marginRight',
        'textIndent',
      ];

      const targets = container.querySelectorAll('p, span, div, li, td, th, h1, h2, h3, h4, h5, h6');
      targets.forEach((el) => {
        const cs = window.getComputedStyle(el);
        inlineProps.forEach((prop) => {
          const cssVal = cs[prop];
          if (!cssVal) return;
          const styleProp = prop.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());
          if (!el.style[prop]) {
            const finalProp = prop === 'textDecorationLine' ? 'text-decoration' : styleProp;
            el.style.setProperty(finalProp, cssVal);
          }
        });
      });

      const finalHtml = container.innerHTML;
      document.body.removeChild(container);

      // Update Lexical editor
      editor.update(() => {
        const parser = new DOMParser();
        const dom = parser.parseFromString(finalHtml, 'text/html');
        const nodes = $generateNodesFromDOM(editor, dom);
        const root = $getRoot();
        root.clear();
        if (Array.isArray(nodes) && nodes.length > 0) {
          root.append(...nodes);
        }
      });
    } catch (error) {
      console.error('Error importing DOCX:', error);
      alert('Error importing DOCX file. Please ensure it is a valid Word document.');
    } finally {
      setIsLoading(false); // Hide loader
      event.target.value = ''; // Reset file input
    }
  };

  return (
<>
  <Grid
    container
    justifyContent="flex-end"
    alignItems="center"
    sx={{
      background: "white",
      py: 1,
      px: 2,
      borderBottom: "1px solid #e0e0e0",
    }}
  >
    <Button variant="outlined" component="label" disabled={isLoading}>
      {isLoading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Importing...
            </>
          ) : (
            'Import DOCX'
          )}
      <input type="file" accept=".docx" hidden onChange={handleImportDocx} />
    </Button>
    <Button
      sx={{ ml: 1 }}
      variant="contained"
      onClick={() => onDownloadDocx(editor)}
    >
      Export DOCX
    </Button>
  </Grid>

  <Grid
    container
    alignItems="center"
    sx={{
      background: "white",
      py: 1,
      px: 2,
      borderBottom: "1px solid #e0e0e0",
    }}
  >
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 1,
      }}
    >
       <FontPlugin />
      {/* Toolbar Icons */}
      {toolbarIconsList.map((plugin) => (
        <Box key={plugin.id} sx={{ display: "flex", alignItems: "center" }}>
          {plugin.event === eventTypes.textColor ? (
            <>
              <plugin.Icon
                sx={{ fontSize: 22 }}
                onClick={handleTextColorClick}
                color={isIconSelected(plugin) ? "secondary" : undefined}
              />
              <Popover
                open={Boolean(textColorAnchorEl)}
                anchorEl={textColorAnchorEl}
                onClose={() => setTextColorAnchorEl(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              >
                <TwitterPicker
                  color={selectedTextColor}
                  onChangeComplete={handleTextColorChange}
                />
              </Popover>
            </>
          ) : plugin.event === eventTypes.backgroundColor ? (
            <>
              <plugin.Icon
                sx={{ fontSize: 22 }}
                onClick={handleBgColorClick}
                color={isIconSelected(plugin) ? "secondary" : undefined}
              />
              <Popover
                open={Boolean(bgColorAnchorEl)}
                anchorEl={bgColorAnchorEl}
                onClose={() => setBgColorAnchorEl(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              >
                <TwitterPicker
                  color={selectedBgColor}
                  onChangeComplete={handleBgColorChange}
                />
              </Popover>
            </>
          ) : (
            <plugin.Icon
              sx={{ fontSize: 22 }}
              onClick={() => onClick(plugin.event)}
              color={isIconSelected(plugin) ? "secondary" : undefined}
            />
          )}
        </Box>
      ))}

      {/* Plugins (with same spacing) */}
     
      <ColorPlugin />
      <PageBreakPlugin/>
      <TablePlugin />
      <TableCellShadingPlugin />
      <TableActionMenuPlugin />
    </Box>
  </Grid>
</>


);

//   return (
//    <>
//   {/* Top toolbar row */}
//   <Grid
//     container
//     justifyContent="space-between"
//     spacing={2}
//     alignItems="center"
//     sx={{ background: "white", py: 1.5, px: 0.5 }}
//   >
//     {/* Import/Export buttons on the left side */}
//     <Grid
//       item
//       sx={{ display: "flex", gap: 1, justifyContent: "flex-end", ml: "auto" }}
//     >
//       <Button variant="outlined" component="label">
//         Import DOCX
//         <input
//           type="file"
//           accept=".docx"
//           hidden
//           onChange={handleImportDocx}
//         />
//       </Button>
//       <Button variant="contained" onClick={() => onDownloadDocx(editor)}>
//         Export DOCX
//       </Button>
//     </Grid>

//     {/* Toolbar icons */}
//     <Grid item sx={{ display: "flex", gap: 1 }}>
//       {toolbarIconsList.map((plugin) => (
//         <Grid
//           key={plugin.id}
//           sx={{ cursor: "pointer" }}
//           item
//         >
//           {plugin.event === eventTypes.textColor ? (
//             <>
//               <plugin.Icon
//                 sx={{ fontSize: 24 }}
//                 onClick={handleTextColorClick}
//                 color={isIconSelected(plugin) ? "secondary" : undefined}
//               />
//               <Popover
//                 open={Boolean(textColorAnchorEl)}
//                 anchorEl={textColorAnchorEl}
//                 onClose={() => setTextColorAnchorEl(null)}
//                 anchorOrigin={{
//                   vertical: "bottom",
//                   horizontal: "left",
//                 }}
//               >
//                 <TwitterPicker
//                   color={selectedTextColor}
//                   onChangeComplete={handleTextColorChange}
//                 />
//               </Popover>
//             </>
//           ) : plugin.event === eventTypes.backgroundColor ? (
//             <>
//               <plugin.Icon
//                 sx={{ fontSize: 24 }}
//                 onClick={handleBgColorClick}
//                 color={isIconSelected(plugin) ? "secondary" : undefined}
//               />
//               <Popover
//                 open={Boolean(bgColorAnchorEl)}
//                 anchorEl={bgColorAnchorEl}
//                 onClose={() => setBgColorAnchorEl(null)}
//                 anchorOrigin={{
//                   vertical: "bottom",
//                   horizontal: "left",
//                 }}
//               >
//                 <TwitterPicker
//                   color={selectedBgColor}
//                   onChangeComplete={handleBgColorChange}
//                 />
//               </Popover>
//             </>
//           ) : (
//             <plugin.Icon
//               sx={{ fontSize: 24 }}
//               onClick={() => onClick(plugin.event)}
//               color={isIconSelected(plugin) ? "secondary" : undefined}
//             />
//           )}
//         </Grid>
//       ))}
//        <FontPlugin />
//     </Grid>

//     {modal}
//     {isLink && createPortal(<FloatingLinkEditor editor={editor} />, document.body)}
//   </Grid>

//   {/* Second row: Color + Table */}
//   <Grid
//     container
//     spacing={2}
//     alignItems="center"
//     sx={{ background: "white", py: 1, px: 0.5 }}
//   >
//     <Grid item>
//         <ColorPlugin />
//         <TablePlugin />
//         <TableCellShadingPlugin />
//     </Grid>
    
//   </Grid>
// </>

//   );
};

export default LexicalEditorTopBar;