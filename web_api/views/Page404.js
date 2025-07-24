import { BrowserLink as Link } from "../components/BrowserRouter.js";
import Layout from "../components/Layout.js";

const Page404 = function () {
  const content = [
    {
      tag: "div",
      attributes: [
        ["style", {
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          textAlign: "center"
        }]
      ],
      children: [
        {
          tag: "div",
          attributes: [
            ["style", {
              fontSize: "8rem",
              fontWeight: "bold",
              color: "#e74c3c",
              marginBottom: "1rem"
            }]
          ],
          children: ["404"]
        },
        {
          tag: "h1",
          attributes: [
            ["style", {
              fontSize: "2rem",
              color: "#2c3e50",
              marginBottom: "1rem"
            }]
          ],
          children: ["Page non trouvée"]
        },
        {
          tag: "p",
          attributes: [
            ["style", {
              fontSize: "1.1rem",
              color: "#7f8c8d",
              marginBottom: "2rem",
              maxWidth: "500px"
            }]
          ],
          children: ["Désolé, la page que vous recherchez n'existe pas ou a été déplacée."]
        },
        {
          tag: "div",
          attributes: [
            ["style", {
              display: "flex",
              gap: "1rem",
              flexWrap: "wrap",
              justifyContent: "center"
            }]
          ],
          children: [
            {
              tag: Link,
              attributes: [
                ["link", "/home"],
                ["title", "Retour à l'accueil"],
                ["style", {
                  backgroundColor: "#3498db",
                  color: "white",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontWeight: "bold",
                  transition: "background-color 0.3s"
                }]
              ],
              children: ["Retour à l'accueil"]
            },
            {
              tag: Link,
              attributes: [
                ["link", "/gallery"],
                ["title", "Voir la galerie"],
                ["style", {
                  backgroundColor: "#27ae60",
                  color: "white",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontWeight: "bold",
                  transition: "background-color 0.3s"
                }]
              ],
              children: ["Voir la galerie"]
            }
          ]
        }
      ]
    }
  ];

  return Layout(content);
};

Page404.show = function () {};

export default Page404;
