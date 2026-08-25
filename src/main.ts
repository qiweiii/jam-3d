import "./style.css";
import { createUniverse } from "./universe";

const app = document.getElementById("app");
if (!app) throw new Error("missing #app");
createUniverse(app);
