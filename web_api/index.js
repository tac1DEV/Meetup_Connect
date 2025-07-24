import BrowserRouter from "./components/BrowserRouter.js";
import routes from "./routes/index.js";
import { preloadCriticalResources, optimizeScroll, getOptimizedConfig } from "./config/performance.js";

// Initialiser les optimisations de performance
const config = getOptimizedConfig();
console.log('Performance config:', config);

// Précharger les ressources critiques
preloadCriticalResources();

// Optimiser le scroll
optimizeScroll();

// Initialiser le routeur avec les optimisations
BrowserRouter({
  routes,
  rootElement: document.getElementById("root"),
  baseUrl: "/web_api",
});
