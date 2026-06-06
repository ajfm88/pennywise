import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

// Wake up Render backend on app load (free tier spins down after inactivity)
import { useBackendStore } from "./store/backendStore";

fetch(import.meta.env.VITE_API_BASE_URL?.replace("/api", "") || "https://pennywise-backend-ajfm88.onrender.com")
  .finally(() => useBackendStore.getState().setWakingUp(false));

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
