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

export default function ProtectedRoute({ component, requiredRole = 1, redirectTo = "/login" }) {
  const token = localStorage.getItem("sb_token");
  const user = parseJwt(token);
  
  if (!user) {
    window.location.href = redirectTo;
    return {
      tag: "div",
      attributes: [["style", {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontSize: "1.2rem",
        color: "#666"
      }]],
      children: ["Redirection vers la page de connexion..."]
    };
  }
  
  return {
    tag: "div",
    attributes: [["id", "protected-route"]],
    children: [component],
    events: {
      DOMContentLoaded: [
        async function() {
          try {
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
              
              if (role < requiredRole) {
                const container = document.getElementById('protected-route');
                if (container) {
                  container.innerHTML = `
                    <div style="
                      display: flex;
                      flex-direction: column;
                      justify-content: center;
                      align-items: center;
                      height: 60vh;
                      text-align: center;
                      padding: 2rem;
                    ">
                      <div style="
                        font-size: 4rem;
                        margin-bottom: 1rem;
                        color: #dc3545;
                      ">🚫</div>
                      <h1 style="
                        color: #333;
                        margin-bottom: 1rem;
                        font-size: 2rem;
                      ">Accès Refusé</h1>
                      <p style="
                        color: #666;
                        margin-bottom: 2rem;
                        font-size: 1.1rem;
                        max-width: 500px;
                      ">
                        Vous n'avez pas les permissions nécessaires pour accéder à cette page.
                        <br><br>
                        Rôle requis: ${getRoleName(requiredRole)}<br>
                        Votre rôle: ${getRoleName(role)}
                      </p>
                      <button onclick="window.location.href='/web_api/profile'" style="
                        background-color: #5A3FF3;
                        color: white;
                        border: none;
                        border-radius: 8px;
                        padding: 12px 24px;
                        font-size: 1rem;
                        cursor: pointer;
                        transition: background-color 0.2s;
                      " onmouseover="this.style.backgroundColor='#4a2fd8'" onmouseout="this.style.backgroundColor='#5A3FF3'">
                        Retour au profil
                      </button>
                    </div>
                  `;
                }
              }
            }
          } catch (error) {
            console.error('Erreur lors de la vérification des permissions:', error);
            window.location.href = redirectTo;
          }
        }
      ]
    }
  };
}

function getRoleName(roleId) {
  switch (roleId) {
    case 1:
      return "Utilisateur";
    case 2:
      return "Administrateur";
    default:
      return "Inconnu";
  }
}

export function createProtectedRoute(component, requiredRole = 1) {
  return ProtectedRoute({ component, requiredRole });
} 