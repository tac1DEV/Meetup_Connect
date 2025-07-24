import createElement from "../lib/createElement.js";
import { useState, createComponent } from "../lib/useState.js";

// Composant Counter avec état
const Counter = createComponent((props) => {
  const [count, setCount] = useState(0);
  const [name, setName] = useState("Compteur");

  const increment = () => {
    console.log('Increment clicked! Current count:', count);
    setCount(prevCount => prevCount + 1);
  };

  const decrement = () => {
    console.log('Decrement clicked! Current count:', count);
    setCount(prevCount => prevCount - 1);
  };

  const reset = () => {
    console.log('Reset clicked!');
    setCount(0);
  };

  const updateName = () => {
    console.log('Update name clicked! Current name:', name);
    setName(prevName => prevName === "Compteur" ? "Mon Compteur" : "Compteur");
  };

  console.log('Counter rendering with count:', count, 'name:', name);

  return createElement("div", {
    style: {
      padding: "20px",
      border: "2px solid #3498db",
      borderRadius: "8px",
      margin: "20px",
      textAlign: "center",
      backgroundColor: "#f8f9fa"
    }
  },
    createElement("h2", {}, name),
    createElement("p", {
      style: {
        fontSize: "24px",
        fontWeight: "bold",
        color: "#2c3e50"
      }
    }, `Compteur: ${count}`),
    createElement("div", {
      style: {
        display: "flex",
        justifyContent: "center",
        gap: "10px",
        marginTop: "15px"
      }
    },
      createElement("button", {
        style: {
          padding: "8px 16px",
          backgroundColor: "#27ae60",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer"
        },
        events: {
          click: [increment]
        }
      }, "+"),
      createElement("button", {
        style: {
          padding: "8px 16px",
          backgroundColor: "#e74c3c",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer"
        },
        events: {
          click: [decrement]
        }
      }, "-"),
      createElement("button", {
        style: {
          padding: "8px 16px",
          backgroundColor: "#f39c12",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer"
        },
        events: {
          click: [reset]
        }
      }, "Reset"),
      createElement("button", {
        style: {
          padding: "8px 16px",
          backgroundColor: "#9b59b6",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer"
        },
        events: {
          click: [updateName]
        }
      }, "Changer nom")
    )
  );
});

export default Counter; 