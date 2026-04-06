import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

window.geotab = window.geotab || {};
window.geotab.addin = window.geotab.addin || {};

let geotabMounted = false;

window.geotab.addin.putzmeister = function (elt) {
  return {
    initialize(api, state, initializeCallback) {
      geotabMounted = true;
      createRoot(elt).render(
        <StrictMode>
          <App api={api} state={state} />
        </StrictMode>
      );
      initializeCallback();
    },
    focus() {},
    blur() {},
  };
};

// Fallback: render into #root only when opened directly in browser
setTimeout(() => {
  if (!geotabMounted) {
    const rootEl = document.getElementById("root");
    if (rootEl) {
      createRoot(rootEl).render(
        <StrictMode>
          <App api={null} state={null} />
        </StrictMode>
      );
    }
  }
}, 300);
