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

      console.log("elt received:", elt);
      console.log("elt type:", typeof elt);
      console.log("elt instanceof Element:", elt instanceof Element);

      // elt from GeoTab is sometimes a selector string or empty — use #root as fallback
      const container =
        elt instanceof Element ? elt : document.getElementById("root");

      createRoot(container).render(
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

// Fallback for direct browser visit
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
