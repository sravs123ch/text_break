import React, { useRef } from 'react';
import {
  Box,
  CssBaseline,
  Grid,
  ThemeProvider,
  Typography,
} from "@mui/material";
import LexicalEditorWrapper from "./components/LexicalEditorWrapper";
import theme from "./theme";
import "./App.css";
import LexicalEditorTopBar from './components/LexicalEditorTopBar';

function App() {
  return (
    // <ThemeProvider theme={theme}>
    //   <CssBaseline />
    //   <Grid
    //     container
    //     sx={{ minHeight: "250vh" }}
    //     flexDirection="column"
    //     alignItems="center"
    //   >
    //     <Grid sx={{ my: 4 }}>
    //       <Typography variant="h4">Lexical Editor</Typography>
    //     </Grid>
    //     <Grid sx={{ width: 750, overflow: "hidden" }}>
    //       <LexicalEditorWrapper />
    //     </Grid>
    //   </Grid>
    // </ThemeProvider>
//     <ThemeProvider theme={theme}>
//   <CssBaseline />
  
//   <Grid
//     container
//     sx={{ minHeight: "100vh", background: "#f5f5f5" }}
//     flexDirection="column"
//     alignItems="center"
//   >
   
//     {/* Removed the title */}
//     <Grid sx={{ width: 950, my: 4, boxShadow: 3, borderRadius: 2, background: "white" }}>
//       <LexicalEditorWrapper />
//     </Grid>
//   </Grid>
// </ThemeProvider>
<ThemeProvider theme={theme}>
  <CssBaseline />

  {/* Toolbar should not be constrained by width */}
  <LexicalEditorWrapper />
</ThemeProvider>


  );
}

export default App;