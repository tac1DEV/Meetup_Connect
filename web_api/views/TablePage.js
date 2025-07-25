import { BrowserLink } from "../components/BrowserRouter.js";
import Layout from "../components/Layout.js";

function onClick(event) {
  const td = event.currentTarget;
  const textNode = td.childNodes[0];
  const text = textNode.textContent;
  const input = document.createElement("input");
  input.value = text;
  input.style.width = "100%";
  input.style.border = "none";
  input.style.outline = "none";
  input.style.fontSize = "inherit";
  input.style.fontFamily = "inherit";
  
  // Remplacer le contenu
  td.innerHTML = "";
  td.appendChild(input);
  input.focus();
  
  // Gérer la perte de focus
  input.addEventListener("blur", function onBlur() {
    const newText = input.value;
    td.textContent = newText;
    td.addEventListener("click", onClick);
  }, { once: true });
  
  // Supprimer l'événement click temporairement
  td.removeEventListener("click", onClick);
}

export default async function TablePage() {
  const content = [
    {
    tag: "div",
    children: [
      {
        tag: BrowserLink,
        attributes: [
          ["link", "/gallery"],
          ["title", "Gallery"],
        ],
      },
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
            children: Array.from(
              { length: 5 },
              function createRow(_, rowIndex) {
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
              }
            ),
          },
        ],
      },
    ],
  },
];

return Layout(content);
}


const TablePagePseudoFramework = function () {
  let editCell = undefined;
  return {
    tag: "div",
    children: [
      {
        tag: Link,
        attributes: [
          ["link", "/gallery"],
          ["title", "Gallery"],
        ],
      },
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
            children: Array.from(
              { length: 5 },
              function createRow(_, rowIndex) {
                return {
                  tag: "tr",
                  children: Array.from({ length: 5 }, (_, colIndex) => ({
                    tag: "td",
                    events: {
                      click: [
                        ,
                        /*onClick*/ function () {
                          editCell = `${rowIndex},${colIndex}`;
                        },
                      ],
                    },
                    children: [
                      editCell === `${rowIndex},${colIndex}`
                        ? {
                            tag: "input",
                            attributes: [["value", "Default"]],
                          }
                        : "Default",
                    ],
                  })),
                };
              }
            ),
          },
        ],
      },
    ],
  };
};
