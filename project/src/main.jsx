import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

// Quick fix for Draft.js expecting `global`
window.global = window;

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);