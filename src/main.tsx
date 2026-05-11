import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

const rootElement = document.getElementById("root");
const appTitle = import.meta.env.VITE_APP_TITLE ?? "Pulley Playground";

if (rootElement === null) {
  throw new Error("Root element '#root' was not found.");
}

document.title = appTitle;

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
