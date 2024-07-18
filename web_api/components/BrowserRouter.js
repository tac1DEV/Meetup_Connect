import generateStructure from "../lib/generateStructure.js";
import StateService from "../services/StateService.js";

const browserRouterOptions = {};

// Système de refs et de binding pour éviter querySelector
class ReactiveRenderer {
  constructor() {
    this.refs = new Map();
    this.bindings = new Map();
    this.unsubscribers = new Set();
  }

  // Stocker une référence d'élément
  setRef(refId, element) {
    this.refs.set(refId, element);
  }

  // Récupérer une référence d'élément
  getRef(refId) {
    return this.refs.get(refId);
  }

  // Créer un binding entre state et DOM
  bindState(stateKey, refId, updateFn) {
    const bindingId = `${stateKey}-${refId}`;
    
    // Désabonner l'ancien binding s'il existe
    if (this.bindings.has(bindingId)) {
      this.bindings.get(bindingId)();
    }

    // Créer le nouveau binding
    const unsubscribe = StateService.subscribe(stateKey, (newValue, oldValue) => {
      const element = this.getRef(refId);
      if (element && updateFn) {
        updateFn(element, newValue, oldValue);
      }
    });

    this.bindings.set(bindingId, unsubscribe);
    this.unsubscribers.add(unsubscribe);

    // Appliquer la valeur initiale
    const currentValue = StateService.getState(stateKey);
    const element = this.getRef(refId);
    if (element && updateFn && currentValue !== null) {
      updateFn(element, currentValue, null);
    }
  }

  // Nettoyer tous les bindings
  cleanup() {
    this.unsubscribers.forEach(unsubscribe => unsubscribe());
    this.refs.clear();
    this.bindings.clear();
    this.unsubscribers.clear();
  }
}

// Instance globale du renderer réactif
window.reactiveRenderer = new ReactiveRenderer();

export default function BrowserRouter(props) {
  const routes = props.routes;
  const rootElement = props.rootElement;
  const baseUrl = props.baseUrl ?? "";
  browserRouterOptions.baseUrl = baseUrl;
  
  // Fonction pour extraire les paramètres d'une route
  function extractParams(routePattern, actualPath) {
    const patternParts = routePattern.split('/');
    const pathParts = actualPath.split('/');
    
    if (patternParts.length !== pathParts.length) {
      return null;
    }
    
    const params = {};
    for (let i = 0; i < patternParts.length; i++) {
      const patternPart = patternParts[i];
      const pathPart = pathParts[i];
      
      if (patternPart.startsWith(':')) {
        // C'est un paramètre dynamique
        const paramName = patternPart.slice(1);
        params[paramName] = pathPart;
      } else if (patternPart !== pathPart) {
        // Les parties statiques ne correspondent pas
        return null;
      }
    }
    
    return params;
  }
  
  // Fonction pour trouver la route correspondante
  function findMatchingRoute(path) {
    
    // Correspondance exacte
    if (routes[path]) {
      return { route: routes[path], params: {} };
    }
    
    // Correspondance avec paramètres
    for (const routePattern in routes) {
      if (routePattern.includes(':')) {
        const params = extractParams(routePattern, path);
        if (params !== null) {
          return { route: routes[routePattern], params };
        }
      }
    }
    
    // Sinon retourner 404
    return { route: routes["*"], params: {} };
  }
  
  function generatePage() {
    let path = window.location.pathname.slice(baseUrl.length);
    
    if (path === '' || path === '/') {
      path = '/';
    }
    
    const { route, params } = findMatchingRoute(path);
    
    // Mettre à jour les paramètres
    window.routeParams = params;
    
    window.reactiveRenderer.cleanup();
    
    const page = generateStructure(route);
    if (rootElement.childNodes.length === 0) rootElement.appendChild(page);
    else rootElement.replaceChild(page, rootElement.childNodes[0]);
  }

  window.addEventListener("popstate", generatePage);
  window.addEventListener("pushstate", generatePage);
  generatePage();
}

export function BrowserLink(props) {
  const link = props.link;
  const title = props.title;

  return {
    tag: "a",
    attributes: [["href", browserRouterOptions.baseUrl + link]],
    events: {
      click: [
        function (event) {
          event.preventDefault();
          window.history.pushState(
            {},
            undefined,
            event.currentTarget.getAttribute("href")
          );
          window.dispatchEvent(new Event("pushstate"));
        },
      ],
    },
    children: [title],
  };
}

// Exporter le ReactiveRenderer pour l'utiliser dans d'autres modules
export { ReactiveRenderer };


export function useRef(refId) {
  return window.reactiveRenderer.getRef(refId);
}

export function bindState(stateKey, refId, updateFn) {
  return window.reactiveRenderer.bindState(stateKey, refId, updateFn);
}

export function updateElement(refId, updateFn) {
  const element = window.reactiveRenderer.getRef(refId);
  if (element && updateFn) {
    updateFn(element);
  }
}
