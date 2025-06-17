import BrowserRouter from "./components/BrowserRouter.js";
import routes from "./routes/index.js";

BrowserRouter({
  routes,
  rootElement: document.getElementById("root"),
  baseUrl: "/web_api",
});
