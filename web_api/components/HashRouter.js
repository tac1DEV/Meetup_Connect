import generateStructure from "../lib/generateStructure.js";

export default function HashRouter(props) {
  const routes = props.routes;
  const rootElement = props.rootElement;
  async function generatePage() {
    const path = window.location.hash.slice(1);
    const struct =
      typeof routeHandler === "function" ? await routeHandler() : routeHandler;
    const page = await generateStructure(struct);
    if (rootElement.childNodes.length === 0) rootElement.appendChild(page);
    else rootElement.replaceChild(page, rootElement.childNodes[0]);
  }

  window.addEventListener("hashchange", generatePage);
  generatePage();
}

export function HashLink(props) {
  const link = props.link;
  const title = props.title;

  return {
    tag: "a",
    attributes: [["href", "#" + link]],
    children: [title],
  };
}
