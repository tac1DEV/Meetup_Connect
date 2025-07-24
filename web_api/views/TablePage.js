import { BrowserLink as Link } from "../components/BrowserRouter.js";
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

export default function TablePage() {
  const content = [
    {
      tag: "div",
      attributes: [
        ["style", {
          marginBottom: "2rem"
        }]
      ],
      children: [
        {
          tag: "h1",
          attributes: [
            ["style", {
              color: "#2c3e50",
              marginBottom: "1rem"
            }]
          ],
          children: ["Tableau interactif"]
        },
        {
          tag: "p",
          attributes: [
            ["style", {
              color: "#7f8c8d",
              marginBottom: "1rem"
            }]
          ],
          children: ["Cliquez sur une cellule pour la modifier"]
        }
      ]
    },
    {
      tag: "table",
      attributes: [
        ["id", "table1"],
        ["style", { 
          backgroundColor: "white", 
          color: "#2c3e50",
          borderCollapse: "collapse",
          width: "100%",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          borderRadius: "8px",
          overflow: "hidden"
        }],
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
                  attributes: [
                    ["style", {
                      padding: "1rem",
                      border: "1px solid #ecf0f1",
                      cursor: "pointer",
                      transition: "background-color 0.2s"
                    }]
                  ],
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
