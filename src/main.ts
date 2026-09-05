import "./style.css";
import { createUniverse } from "./experience/universe";

const app = document.getElementById("app");
if (!app) throw new Error("missing #app");
const universe = createUniverse(app);
if (import.meta.hot) import.meta.hot.dispose(() => universe.dispose());
