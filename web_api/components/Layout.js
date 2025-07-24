import Header from "./Header.js";
import Footer from "./Footer.js";

export default function Layout(children) {
  return {
    tag: "div",
    attributes: [
      ["class", "layout"],
      ["style", {
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        willChange: "transform, opacity",
        transform: "translateZ(0)" 
      }]
    ],
    children: [
      {
        tag: Header
      },
      {
        tag: "main",
        attributes: [
          ["style", {
            flex: "1",
            width: "100%",
            position: "relative"
          }]
        ],
        children: children
      },
      {
        tag: Footer
      }
    ]
  };
} 