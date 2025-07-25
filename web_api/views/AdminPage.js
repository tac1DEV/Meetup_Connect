import { BrowserLink } from "../components/BrowserRouter.js";
function parseJwt(token) {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}
export default function AdminPage() {
  const token = localStorage.getItem("sb_token");
  const user = parseJwt(token);
  console.log(user);
  
  if (!user) {
    window.location.href = "/web_api/login";
    return { tag: "div", children: ["Redirection..."] };
  }

  
  return {
    tag: "div",
    attributes: [["style", {
      maxWidth: "900px",
      margin: "2rem auto",
      background: "#fff",
      borderRadius: "10px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      padding: "2rem"
    }]],
    children: [
      {
        tag: "h1",
        attributes: [["style", { fontSize: "2rem", marginBottom: "1.5rem", color: "#5A3FF3" }]],
        children: ["Panel d'administration"]
      },
      {
        tag: "ul",
        attributes: [["style", { display: "flex", gap: "2rem", listStyle: "none", padding: 0, margin: 0 }]],
        children: [
          navAdminLink("/admin/utilisateurs", "Utilisateurs 👤"),
          navAdminLink("/admin/evenements", "Événements 📅"),
          navAdminLink("/admin/communautes", "Communautés 🏘️")
        ]
      },
      {
        tag: "div",
        attributes: [["style", { marginTop: "2.5rem", color: "#666" }]],
        children: [
          "Bienvenue sur le panel d'administration. Choisissez une section pour gérer les données de la plateforme."
        ]
      }
    ]
  };
}

function navAdminLink(to, label) {
  return {
    tag: "li",
    children: [
      {
        tag: BrowserLink,
        attributes: [["link", to], ["title", label], ["style", {
          fontSize: "1.15rem",
          color: "#5A3FF3",
          textDecoration: "none",
          fontWeight: "bold",
          padding: "0.75rem 1.5rem",
          borderRadius: "6px",
          background: "#f3f0ff",
          border: "1px solid #e0e0e0",
          transition: "background 0.2s, color 0.2s"
        }]],
        children: [label]
      }
    ]
  };
} 