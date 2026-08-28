import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "react-hot-toast";

import "./styles.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />

        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{
            duration: 3000,
          }}
        />
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>
);