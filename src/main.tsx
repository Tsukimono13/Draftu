import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import "./index.scss";
import App from "./App.tsx";
import { store } from "./store.ts";

const savedTheme = localStorage.getItem("draftu-theme");
if (savedTheme) {
  document.documentElement.setAttribute("data-theme", savedTheme);
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
);
