import { BrowserLink as Link } from "./BrowserRouter.js";

export default function Header({ isAuthenticated = true, isAdmin = true }) {
  return {
    tag: "header",
    attributes: [["style", headerStyle]],
    children: [
      {
        tag: "nav",
        attributes: [["style", navStyle]],
        children: [
          logoLink(),
          {
            tag: "ul",
            attributes: [["style", navListStyle]],
            children: [
              navLink("/home", "Accueil"),
              navLink("/communautes", "Communautés"),
              navLink("/evenement", "Événements"),
          
           
              
              ...(isAuthenticated
                ? [
                    navButton("/profile", "👤 Profil", "#5A3FF3", "#fff", "#5A3FF3"),
                    ...(isAdmin
                      ? [navButton("/admin", "🔧 Admin", "#dc3545", "#fff", "#dc3545")]
                      : [])
                  ]
                : [
                    navButton("/login", "Connexion", "#fff", "#5A3FF3", "#5A3FF3"),
                    navButton("/register", "Inscription", "#5A3FF3", "#fff", "#5A3FF3")
                  ])
            ]
          }
        ]
      }
    ]
  };
}

// Styles et composants utilitaires
const headerStyle = {
  backgroundColor: "#fff",
  color: "#333",
  padding: "1rem 0",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  position: "sticky",
  top: "0",
  zIndex: "9998"
};

const navStyle = {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "0 2rem",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const navListStyle = {
  display: "flex",
  listStyle: "none",
  gap: "1.5rem",
  alignItems: "center",
  margin: 0,
  padding: 0
};

function logoLink() {
  return {
    tag: Link,
    attributes: [["link", "/home"], ["title", "Meetup Connect"], ["style", {
      fontSize: "1.5rem",
      fontWeight: "bold",
      color: "#f64060",
      textDecoration: "none",
      cursor: "pointer"
    }]],
    children: ["Meetup Connect"]
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
        cursor: "pointer",
        transition: "color 0.2s ease"
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
        cursor: "pointer",
        transition: "all 0.2s ease"
      }]],
      children: [label]
    }]
  };
}