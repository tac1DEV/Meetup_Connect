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
      zIndex: "1000",
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
          alignItems: "center"
        }]],
        children: [
          {
            tag: Link,
            attributes: [
              ["link", "/home"],
              ["title", "Meetup Connect"],
              ["style", {
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: "#f64060",
                textDecoration: "none",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                cursor: "pointer",
                willChange: "transform, color"
              }]
            ],
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
              navLink("/gallery", "Galerie"),
              navLink("/profile", "Profil"),
              {
                tag: "li",
                attributes: [["id", "admin-link"], ["style", { display: "none" }]],
                children: [
                  {
                    tag: Link,
                    attributes: [
                      ["link", "/admin"],
                      ["title", "Admin"],
                      ["style", {
                        color: "#dc3545",
                        textDecoration: "none",
                        fontWeight: "600",
                        fontSize: "1rem",
                        padding: "0.25rem 0",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        cursor: "pointer",
                        willChange: "transform, color",
                        position: "relative"
                      }]
                    ],
                    children: ["🔧 Admin"]
                  }
                ]
              },
              navButton("/login", "Connexion", "#fff", "#5A3FF3", "#5A3FF3"),
              navButton("/register", "Inscription", "#5A3FF3", "#fff", "#5A3FF3")
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
    children: [
      {
        tag: Link,
        attributes: [
          ["link", to],
          ["title", label],
          ["style", {
            color: "#333",
            textDecoration: "none",
            fontWeight: "500",
            fontSize: "1rem",
            padding: "0.25rem 0",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            cursor: "pointer",
            willChange: "transform, color",
            position: "relative"
          }]
        ],
        children: [label]
      }
    ]
  };
}


function navButton(to, label, bgColor, textColor, borderColor) {
  return {
    tag: "li",
    children: [
      {
        tag: Link,
        attributes: [
          ["link", to],
          ["title", label],
          ["style", {
            backgroundColor: bgColor,
            color: textColor,
            padding: "0.5rem 1rem",
            border: `1px solid ${borderColor}`,
            borderRadius: "6px",
            fontWeight: "600",
            textDecoration: "none",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            fontSize: "0.95rem",
            cursor: "pointer",
            display: "inline-block",
            willChange: "transform, background-color, color",
            position: "relative"
          }]
        ],
        children: [label]
      }
    ]
  };
}


Header.checkAdminRole = async function() {
  const token = localStorage.getItem("sb_token");
  if (!token) return;

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
    const user = JSON.parse(jsonPayload);
    
    if (user && user.sub) {
      
      const response = await fetch(`https://wxfruxhckurswdcbdxwq.supabase.co/rest/v1/utilisateur?select=id_role&id=eq.${user.sub}&limit=1`, {
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4ZnJ1eGhja3Vyc3dkY2JkeHdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMzM0OTksImV4cCI6MjA2NTgwOTQ5OX0.OztdaAYi3kRHhXmPwhmQCH7emQAkyYk-2R5io6M-8es',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4ZnJ1eGhja3Vyc3dkY2JkeHdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMzM0OTksImV4cCI6MjA2NTgwOTQ5OX0.OztdaAYi3kRHhXmPwhmQCH7emQAkyYk-2R5io6M-8es',
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const role = data[0]?.id_role || 1;
        
        const adminLink = document.getElementById('admin-link');
        if (adminLink) {
          adminLink.style.display = role === 2 ? 'block' : 'none';
        }
      }
    }
  } catch (error) {
    console.error('Erreur lors de la vérification du rôle admin:', error);
  }
};
