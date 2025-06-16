import BrowserRouter, { BrowserLink as Link } from "./BrowserRouter.js";
import generateStructure from "./generateStructure.js";
import TablePage from "./TablePage.js";

const root = document.getElementById("root");

function Gallery() {
  return {
    tag: "div",
    children: [
      {
        tag: Link,
        attributes: [
          ["link", "/home"],
          ["title", "HomePage"],
        ],
      },
      {
        tag: "div",
        children: Array.from({ length: 500 }, (_, index) => ({
          tag: "img",
          attributes: [["src", "https://picsum.photos/200?random=" + index]],
        })),
      },
    ],
  };
}
async function GalleryDatabase() {
  const res = await fetch("/photos.json");
  const photos = await res.json();

  return {
    tag: "div",
    children: photos.map((photo) => ({
      tag: "img",
      attributes: [
        ["src", photo.url],
        ["alt", photo.title],
      ],
    })),
  };
}
async function GalleryDatabase2() {
  const res = await fetch("/photos.json");
  const photos = await res.json();

  return createElement(
    "div",
    {},
    photos.map((photo) =>
      createElement("img", {
        src: photo.url,
        alt: photo.title,
      })
    )
  );
}

function Toto() {
  return createElement(
    "div",
    createElement(Link, {
      link: "/home",
      title: "HomePage",
    }),
    createElement(
      "ul",
      {},
      createElement("li", {}, "fourchette"),
      createElement("li", {}, "couteau"),
      createElement("li", {}, "cuillère")
    )
  );
}

function createElement(tag, attributes, ...children) {
  return {
    tag,
    attributes: Object.entries(attributes),
    children,
  };
}

const Page404 = function () {
  return {
    tag: "div",
    children: [
      {
        tag: Link,
        attributes: [
          ["link", "/home"],
          ["title", "HomePage"],
        ],
      },
      {
        tag: Link,
        attributes: [
          ["link", "/gallery"],
          ["title", "Gallery"],
        ],
      },
      {
        tag: "h1",
        children: ["Tu t'es perdu !!! Game Over !!!"],
      },
    ],
  };
};

const routes = {
  "/": {
    tag: TablePage,
  },
  "/home": {
    tag: TablePage,
  },
  "/gallery": {
    tag: Gallery,
  },
  "*": {
    tag: Page404,
  },
};

function HashRouter(props) {
  const routes = props.routes;
  const rootElement = props.rootElement;
  function generatePage() {
    const path = window.location.hash.slice(1);
    const struct = routes[path] ?? routes["*"];
    const page = generateStructure(struct);
    if (rootElement.childNodes.length === 0) rootElement.appendChild(page);
    else rootElement.replaceChild(page, rootElement.childNodes[0]);
  }

  window.addEventListener("hashchange", generatePage);
  generatePage();
}

function HashLink(props) {
  const link = props.link;
  const title = props.title;

  return {
    tag: "a",
    attributes: [["href", "#" + link]],
    children: [title],
  };
}

BrowserRouter({ routes, rootElement: root, baseUrl: "/web_api" });

/* root.appendChild(generateStructure(tableStructure));
root.appendChild(generateStructure(Toto()));
 */ //(async () => root.appendChild(generateStructure(await GalleryDatabase())))();
