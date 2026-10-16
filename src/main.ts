import "./styles/main.css";
import { createApp } from "./app/create-app";

const app = document.getElementById("app");
if (!app) throw new Error("missing #app");
const application = createApp(app);
if (import.meta.hot) import.meta.hot.dispose(() => application.dispose());
