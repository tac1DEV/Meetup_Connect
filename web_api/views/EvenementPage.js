import { supabase } from "../../config.js";
import { BrowserLink } from "../components/BrowserRouter.js";
import Layout from "../components/Layout.js";

export default async function EvenementPage() {
  const communautes = await supabase.query("communaute");
  const data = await supabase.query("evenement");

  const content = [
    {
      tag: "div",
      attributes: [["style", {
        fontFamily: "Arial, sans-serif",
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "20px",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh"
      }]],
      children: [
        {
          tag: "nav",
          attributes: [["style", { marginBottom: "20px" }]],
          children: [
            {
              tag: BrowserLink,
              attributes: [
                ["link", "/"],
                ["title", "Retour"],
                ["style", {
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "10px 15px",
                  backgroundColor: "#4730dc",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  fontSize: "14px",
                  cursor: "pointer",
                  textDecoration: "none"
                }]
              ],
              children: ["← Retour à l'accueil"]
            }
          ]
        },
        {
          tag: "div",
          attributes: [["style", {
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "8px",
            marginBottom: "30px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }]],
          children: [
            {
              tag: "div",
              attributes: [["style", { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }]],
              children: [
                {
                  tag: "h1",
                  attributes: [["style", { margin: 0, color: "#333", fontSize: "28px" }]],
                  children: ["Liste des événements"]
                },
                {
                  tag: BrowserLink,
                  attributes: [
                    ["link", "/evenement/create"],
                    ["title", "Nouvel événement"],
                    ["style", {
                      padding: "10px 20px",
                      backgroundColor: "#4caf50",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "bold"
                    }]
                  ],
                  children: ["+ Créer"]
                }
              ]
            },
            {
              tag: "div",
              children: data.map((d) => ({
                tag: "div",
                attributes: [["style", {
                  border: "1px solid #e1e1e1",
                  borderRadius: "8px",
                  padding: "20px",
                  marginBottom: "16px",
                  backgroundColor: "#fff",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                }]],
                children: [
                  {
                    tag: "div",
                    attributes: [["style", { display: "flex", justifyContent: "space-between", alignItems: "flex-start" }]],
                    children: [
                      {
                        tag: BrowserLink,
                        attributes: [
                          ["link", `/evenement/${d.id}`],
                          ["title", d.nom || `Événement ${d.id}`],
                          ["style", {
                            fontSize: "20px",
                            fontWeight: "bold",
                            color: "#1976d2",
                            textDecoration: "none"
                          }]
                        ],
                        children: [d.nom || `Événement ${d.id}`]
                      }
                    ]
                  },
                  {
                    tag: "p",
                    attributes: [["style", {
                      color: "#666",
                      margin: "12px 0",
                      fontSize: "14px",
                      lineHeight: "1.5"
                    }]],
                    children: [d.description || "Aucune description disponible"]
                  },
                  {
                    tag: "div",
                    attributes: [["style", {
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: "16px",
                      marginBottom: "16px"
                    }]],
                    children: [
                      ["date", d.date],
                      ["lieu", d.lieu],
                      ["prix", d.prix + " €"],
                      ["participants max", d.nombre_max_participants || "Illimité"]
                    ].map(([label, value]) => ({
                      tag: "div",
                      children: [
                        {
                          tag: "strong",
                          attributes: [["style", { color: "#333", display: "block", marginBottom: "4px" }]],
                          children: [label.charAt(0).toUpperCase() + label.slice(1)]
                        },
                        {
                          tag: "span",
                          attributes: [["style", { color: "#666", fontSize: "14px" }]],
                          children: [String(value)]
                        }
                      ]
                    }))
                  }
                ]
              }))
            }
          ]
        }
      ]
    }
  ];

  return Layout(content);
}
