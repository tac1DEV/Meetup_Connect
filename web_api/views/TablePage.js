import { BrowserLink as Link } from "../components/BrowserRouter.js";

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

export default function TablePage() {
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
        tag: Link,
        attributes: [
          ["link", "/communaute"],
          ["title", "Communaute"],
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
  };
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
