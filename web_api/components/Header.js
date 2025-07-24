import { BrowserLink as Link } from "./BrowserRouter.js";

export default function Header() {
  return {
    tag: "header",
    attributes: [["style", {
      backgroundColor: "#fff",
      color: "#333",
      padding: "1rem 0",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      position: "sticky",
      top: "0",
      zIndex: "9998",
      overflow: "visible",
      willChange: "transform",
      transform: "translateZ(0)"
    }]],
    children: [
      {
        tag: "nav",
        attributes: [["style", {
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          overflow: "visible"
        }]],
        children: [
          {
            tag: Link,
            attributes: [["link", "/home"], ["title", "Meetup Connect"], ["style", {
              fontSize: "1.5rem",
              fontWeight: "bold",
              color: "#f64060",
              textDecoration: "none",
              cursor: "pointer"
            }]],
            children: ["Meetup Connect"]
          },
          {
            tag: "ul",
            attributes: [["style", {
              display: "flex",
              listStyle: "none",
              margin: "0",
              padding: "0",
              gap: "1.5rem",
              alignItems: "center"
            }]],
            children: [
              navLink("/home", "Accueil"),
              navLink("/evenement", "Événements"),
              navLink("/gallery", "Galerie"),
              navLink("/profile", "Profil"),
              {
                tag: "li",
                attributes: [["id", "admin-link"], ["style", { display: "none" }]],
                children: [
                  {
                    tag: Link,
                    attributes: [["link", "/admin"], ["title", "Admin"], ["style", {
                      color: "#dc3545",
                      textDecoration: "none",
                      fontWeight: "600",
                      fontSize: "1rem",
                      padding: "0.25rem 0",
                      cursor: "pointer"
                    }]],
                    children: ["🔧 Admin"]
                  }
                ]
              },
              {
                tag: "li",
                attributes: [["id", "user-dropdown"], ["style", { display: "none", position: "relative" }]],
                children: [
                  {
                    tag: "div",
                    attributes: [["id", "dropdown-trigger"], ["style", {
                      backgroundColor: "#5A3FF3",
                      color: "#fff",
                      padding: "0.5rem 1rem",
                      borderRadius: "6px",
                      fontWeight: "600",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontSize: "0.95rem"
                    }]],
                    children: ["👤 Mon Compte", { tag: "span", attributes: [["style", { fontSize: "0.8rem" }]], children: ["▼"] }]
                  },
                  {
                    tag: "div",
                    attributes: [["id", "dropdown-menu"], ["style", {
                      position: "absolute",
                      top: "100%",
                      right: "0",
                      backgroundColor: "#fff",
                      border: "1px solid #e0e0e0",
                      borderRadius: "6px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      minWidth: "180px",
                      display: "none",
                      zIndex: "10000",
                      marginTop: "0.5rem"
                    }]],
                    children: [
                      dropdownItem("/profile", "👤 Mon Profil"),
                      dropdownItem("/evenement/create", "➕ Créer un événement"),
                      {
                        tag: "div",
                        attributes: [["id", "logout-btn"], ["style", {
                          padding: "0.75rem 1rem",
                          color: "#dc3545",
                          cursor: "pointer"
                        }]],
                        children: ["🚪 Déconnexion"]
                      }
                    ]
                  }
                ]
              },
              {
                tag: "li",
                attributes: [["id", "auth-buttons"], ["style", { display: "flex", gap: "1rem" }]],
                children: [
                  navButton("/login", "Connexion", "#fff", "#5A3FF3", "#5A3FF3"),
                  navButton("/register", "Inscription", "#5A3FF3", "#fff", "#5A3FF3")
                ]
              }
            ]
          }
        ]
      }
    ]
  };
}

function navLink(to, label) {
  return {
    tag: "li",
    children: [{
      tag: Link,
      attributes: [["link", to], ["title", label], ["style", {
        color: "#333",
        textDecoration: "none",
        fontWeight: "500",
        fontSize: "1rem",
        cursor: "pointer"
      }]],
      children: [label]
    }]
  };
}

function navButton(to, label, bgColor, textColor, borderColor) {
  return {
    tag: "li",
    children: [{
      tag: Link,
      attributes: [["link", to], ["title", label], ["style", {
        backgroundColor: bgColor,
        color: textColor,
        padding: "0.5rem 1rem",
        border: `1px solid ${borderColor}`,
        borderRadius: "6px",
        fontWeight: "600",
        textDecoration: "none",
        fontSize: "0.95rem",
        cursor: "pointer"
      }]],
      children: [label]
    }]
  };
}

function dropdownItem(to, label) {
  return {
    tag: Link,
    attributes: [["link", to], ["title", label], ["style", {
      display: "block",
      padding: "0.75rem 1rem",
      color: "#333",
      textDecoration: "none",
      borderBottom: "1px solid #f0f0f0"
    }]],
    children: [label]
  };
}
