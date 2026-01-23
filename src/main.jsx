import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Load test automation module (makes it available in browser console)
import "./lib/test-automation";

// Load LLM helper (makes it available in browser console)
import "./lib/llm-helper";

ReactDOM.createRoot(document.getElementById("root")).render(
    <App />
);
