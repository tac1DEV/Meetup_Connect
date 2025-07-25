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
        position: "relative", 
        
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
            zIndex: "1", 
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

// Fonction appelée après le rendu pour initialiser les composants
Layout.postRender = function() {
  // Initialiser l'état d'authentification
  if (Header.updateAuthState) {
    Header.updateAuthState();
  }

  // Vérifier le rôle admin
  if (Header.checkAdminRole) {
    Header.checkAdminRole();
  }
};
