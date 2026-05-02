import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const prefersDark = () => {
  const path = window.location.pathname || "";
  const key = path.startsWith("/admin") ? "adminTheme" : "clientTheme";
  return localStorage.getItem(key) !== "light";
};

document.documentElement.classList.toggle("dark", prefersDark());

createRoot(document.getElementById("root")!).render(<App />);
