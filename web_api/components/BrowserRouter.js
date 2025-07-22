import generateStructure from "../lib/generateStructure.js";
import Layout from "../views/Layout.js";

const browserRouterOptions = {};

export default function BrowserRouter(props) {
  const routes = props.routes;
  const rootElement = props.rootElement;
  const baseUrl = props.baseUrl ?? "";
  browserRouterOptions.baseUrl = baseUrl;
  async function generatePage() {
    const path = window.location.pathname.slice(baseUrl.length);
    // const struct = routes[path] ?? routes["*"];
    const routeHandler = routes[path] ?? routes["*"];
    const rawStruct =
      typeof routeHandler === "function" ? await routeHandler() : routeHandler;
    // Injecte le layout autour du contenu
    const struct = await Layout(rawStruct);
    const page = await generateStructure(struct);
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
