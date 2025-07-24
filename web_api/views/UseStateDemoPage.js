import createElement from "../lib/createElement.js";
import Counter from "../components/Counter.js";

const UseStateDemoPage = () => {
  return createElement("div", {
    style: {
      padding: "20px",
      maxWidth: "800px",
      margin: "0 auto",
      fontFamily: "Arial, sans-serif"
    }
  },
    createElement("h1", {
      style: {
        color: "#2c3e50",
        textAlign: "center",
        marginBottom: "30px"
      }
    }, "Démonstration du système useState"),
    
    createElement("div", {
      style: {
        backgroundColor: "#ecf0f1",
        padding: "20px",
        borderRadius: "8px",
        marginBottom: "30px"
      }
    },
      createElement("h3", {
        style: {
          color: "#34495e",
          marginTop: "0"
        }
      }, "Fonctionnalités du système useState :"),
      createElement("ul", {},
        createElement("li", {}, "Gestion d'état local pour chaque composant"),
        createElement("li", {}, "Mise à jour d'état avec setState"),
        createElement("li", {}, "Support des fonctions de mise à jour"),
        createElement("li", {}, "Gestion automatique du re-render"),
        createElement("li", {}, "Isolation d'état entre composants")
      )
    ),
    
    createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "20px"
      }
    },
      createElement("div", {},
        createElement("h3", {
          style: {
            color: "#34495e",
            textAlign: "center"
          }
        }, "Compteur 1"),
        Counter()
      ),
      createElement("div", {},
        createElement("h3", {
          style: {
            color: "#34495e",
            textAlign: "center"
          }
        }, "Compteur 2"),
        Counter()
      )
    ),
    
    createElement("div", {
      style: {
        marginTop: "30px",
        padding: "15px",
        backgroundColor: "#f8f9fa",
        borderRadius: "8px",
        border: "1px solid #dee2e6"
      }
    },
      createElement("h4", {
        style: {
          color: "#495057",
          marginTop: "0"
        }
      }, "Comment utiliser useState :"),
      createElement("pre", {
        style: {
          backgroundColor: "#f1f3f4",
          padding: "10px",
          borderRadius: "4px",
          overflow: "auto"
        }
      }, `import { useState, createComponent } from "../lib/useState.js";

const MonComposant = createComponent((props) => {
  const [valeur, setValeur] = useState(0);
  
  const incrementer = () => {
    setValeur(valeur + 1);
  };
  
  return createElement("div", {},
    createElement("p", {}, \`Valeur: \${valeur}\`),
    createElement("button", {
      events: { click: [incrementer] }
    }, "Incrémenter")
  );
});`)
    )
  );
};

export default UseStateDemoPage; 