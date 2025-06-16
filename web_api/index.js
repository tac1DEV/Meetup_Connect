const root = document.getElementById("root");
const table = document.createElement("table");
const tbody = document.createElement("tbody");

function onClick(event) {
  const td = event.currentTarget;
  const textNode = td.childNodes[0];
  const text = textNode.textContent;
  const input = document.createElement("input");
  input.value = text;
  td.appendChild(input);
  input.focus();
  td.removeChild(textNode);
  //td.replaceChild(input, textNode);
  td.removeEventListener("click", onClick);
  input.addEventListener("blur", function onBlur(event) {
    const input = event.currentTarget;
    const text = input.value;
    const textNode = document.createTextNode(text);
    const td = input.parentNode;
    td.replaceChild(textNode, input);
    td.addEventListener("click", onClick);
  });
}

table.appendChild(tbody);
for (let rowIndex = 0; rowIndex < 5; rowIndex++) {
  const tr = document.createElement("tr");
  tbody.appendChild(tr);
  for (let colIndex = 0; colIndex < 5; colIndex++) {
    const td = document.createElement("td");
    tr.appendChild(td);
    const text = document.createTextNode("Default");
    td.appendChild(text);

    td.addEventListener("click", onClick);
  }
}

const tableStructure = {
  tag: "div",
  children: [
    Link({ link: "/gallery", title: "Gallery" }),
    {
      tag: "table",
      attributes: [
        ["id", "table1"],
        ["style", { backgroundColor: "magenta", color: "yellow" }],
      ],
      children: [
        {
          tag: "tbody",
          attributes: [["class", "tbody-class"]],
          children: Array.from({ length: 5 }, function createRow(_, rowIndex) {
            return {
              tag: "tr",
              children: Array.from({ length: 5 }, (_, colIndex) => ({
                tag: "td",
                events: {
                  click: [onClick],
                },
                children: ["Default"],
              })),
            };
          }),
        },
      ],
    },
  ],
};

function generateStructure(structure) {
  const elem = document.createElement(structure.tag);
  if (structure.attributes) {
    for (let attribute of structure.attributes) {
      const attrName = attribute[0];
      const attrValue = attribute[1];
      if (attrName === "style") {
        Object.assign(elem.style, attrValue);
      } else if (attrName === "class") {
        elem.className = attrValue;
      } else {
        elem.setAttribute(attrName, attrValue);
      }
    }
  }
  if (structure.events) {
    for (let eventName in structure.events) {
      for (let listener of structure.events[eventName]) {
        elem.addEventListener(eventName, listener);
      }
    }
  }
  if (structure.children) {
    for (let child of structure.children) {
      const childElem =
        typeof child === "string"
          ? document.createTextNode(child)
          : generateStructure(child);
      elem.appendChild(childElem);
    }
  }
  return elem;
}

function Gallery() {
  return {
    tag: "div",
    children: [
      Link({ link: "/home", title: "HomePage" }),
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
    "ul",
    {},
    createElement("li", {}, "fourchette"),
    createElement("li", {}, "couteau"),
    createElement("li", {}, "cuillère")
  );
}

function createElement(tag, attributes, ...children) {
  return {
    tag,
    attributes: Object.entries(attributes),
    children,
  };
}

const page404 = {
  tag: "h1",
  children: ["Tu t'es perdu !!! Game Over !!!"],
};

const routes = {
  "/home": tableStructure,
  "/gallery": Gallery(),
  "*": page404,
};

function HashRouter(routes, rootElement) {
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

function Link(props) {
  const link = props.link;
  const title = props.title;

  return {
    tag: "a",
    attributes: [["href", "#" + link]],
    children: [title],
  };
}

HashRouter(routes, root);

/* root.appendChild(generateStructure(tableStructure));
root.appendChild(generateStructure(Toto()));
 */ //(async () => root.appendChild(generateStructure(await GalleryDatabase())))();
