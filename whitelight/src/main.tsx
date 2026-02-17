import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Add error handling
try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Root element not found");
  }
  
  const root = createRoot(rootElement);
  root.render(<App />);
  
  console.log("✅ App initialized successfully");
} catch (error) {
  console.error("❌ Failed to initialize app:", error);
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; font-family: sans-serif; text-align: center;">
        <h1>Application Error</h1>
        <p>Failed to initialize the application.</p>
        <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; overflow: auto; text-align: left;">${error instanceof Error ? error.stack : String(error)}</pre>
        <button onclick="location.reload()" style="padding: 10px 20px; margin-top: 10px; cursor: pointer;">Reload Page</button>
      </div>
    `;
  }
}
