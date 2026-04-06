import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

window.geotab = window.geotab || {};
window.geotab.addin = window.geotab.addin || {};

window.geotab.addin.putzmeister = function (elt, service) {
  return {
    initialize(api, state, initializeCallback) {
      createRoot(elt).render(
        <StrictMode>
          <App api={api} state={state} />
        </StrictMode>
      );
      initializeCallback();
    },
    focus(api, state) {},
    blur() {},
  };
};

// Render into #root when opened directly (dev or Vercel preview)
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App api={null} state={null} />
  </StrictMode>
);
