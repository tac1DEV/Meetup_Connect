import { BrowserLink as Link } from "../components/BrowserRouter.js";
import Layout from "../components/Layout.js";
import ProtectedRoute from "../components/ProtectedRoute.js";

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

function AdminPageContent() {
  const content = [
    {
      tag: "div",
      attributes: [["style", {
        padding: "2rem",
        
        margin: "0 auto"
      }]],
      children: [
        {
          tag: "div",
          attributes: [["style", {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
            paddingBottom: "1rem",
            borderBottom: "2px solid #5A3FF3"
          }]],
          children: [
            {
              tag: "h1",
              attributes: [["style", {
                color: "#5A3FF3",
                fontSize: "2rem",
                fontWeight: "bold",
                margin: 0
              }]],
              children: ["🔧 Panel Administrateur"]
            },
            {
              tag: "div",
              attributes: [["style", {
                display: "flex",
                gap: "1rem",
                alignItems: "center"
              }]],
              children: [
                {
                  tag: "span",
                  attributes: [["style", {
                    color: "#666",
                    fontSize: "0.9rem"
                  }]],
                  children: [`Connecté en tant qu'admin`]
                },
                {
                  tag: "button",
                  attributes: [["style", {
                    backgroundColor: "#dc3545",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    padding: "0.5rem 1rem",
                    cursor: "pointer",
                    fontSize: "0.9rem"
                  }]],
                  events: {
                    click: [function() {
                      localStorage.removeItem("sb_token");
                      window.location.href = "/web_api/login";
                    }]
                  },
                  children: ["Déconnexion"]
                }
              ]
            }
          ]
        },

        {
          tag: "div",
          attributes: [["class", "admin-stats"], ["style", {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1.5rem",
            marginBottom: "2rem"
          }]],
          children: [
            createStatCard("👥 Utilisateurs", "0", "#5A3FF3"),
            createStatCard("🆕 Nouveaux (7j)", "0", "#28a745"),
            createStatCard("⚠️ En attente", "0", "#ffc107"),
            createStatCard("❌ Bannis", "0", "#dc3545")
          ]
        },

        {
          tag: "div",
          attributes: [["style", {
            backgroundColor: "#fff",
            borderRadius: "12px",
            padding: "2rem",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
          }]],
          children: [
            {
              tag: "div",
              attributes: [["style", {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem"
              }]],
              children: [
                {
                  tag: "h2",
                  attributes: [["style", {
                    color: "#333",
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    margin: 0
                  }]],
                  children: ["Gestion des Utilisateurs"]
                },
                {
                  tag: "button",
                  attributes: [["id", "refresh-users"], ["style", {
                    backgroundColor: "#5A3FF3",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    padding: "0.5rem 1rem",
                    cursor: "pointer",
                    fontSize: "0.9rem"
                  }]],
                  events: {
                    click: [function() {
                      AdminPage.loadUsers();
                    }]
                  },
                  children: ["🔄 Actualiser"]
                }
              ]
            },

            {
              tag: "div",
              attributes: [["id", "users-table"], ["style", {
                overflowX: "auto"
              }]],
              children: [
                {
                  tag: "table",
                  attributes: [["style", {
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "0.9rem"
                  }]],
                  children: [
                    {
                      tag: "thead",
                      children: [
                        {
                          tag: "tr",
                          attributes: [["style", {
                            backgroundColor: "#f8f9fa",
                            borderBottom: "2px solid #dee2e6"
                          }]],
                          children: [
                            { tag: "th", attributes: [["style", { padding: "1rem", textAlign: "left" }]], children: ["ID"] },
                            { tag: "th", attributes: [["style", { padding: "1rem", textAlign: "left" }]], children: ["Email"] },
                            { tag: "th", attributes: [["style", { padding: "1rem", textAlign: "left" }]], children: ["Nom"] },
                            { tag: "th", attributes: [["style", { padding: "1rem", textAlign: "left" }]], children: ["Prénom"] },
                            { tag: "th", attributes: [["style", { padding: "1rem", textAlign: "left" }]], children: ["Pseudo"] },
                            { tag: "th", attributes: [["style", { padding: "1rem", textAlign: "left" }]], children: ["Rôle"] },
                            { tag: "th", attributes: [["style", { padding: "1rem", textAlign: "left" }]], children: ["Date d'inscription"] },
                            { tag: "th", attributes: [["style", { padding: "1rem", textAlign: "left" }]], children: ["Actions"] }
                          ]
                        }
                      ]
                    },
                    {
                      tag: "tbody",
                      attributes: [["id", "users-tbody"]],
                      children: [
                        {
                          tag: "tr",
                          children: [
                            {
                              tag: "td",
                              attributes: [["colspan", "8"], ["style", { padding: "2rem", textAlign: "center", color: "#666" }]],
                              children: ["Chargement des utilisateurs..."]
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ];

  return Layout(content);
}

export default function AdminPage() {
  return ProtectedRoute({
    component: AdminPageContent(),
    requiredRole: 2,
    redirectTo: "/web_api/login"
  });
}

function createStatCard(title, value, color) {
  return {
    tag: "div",
    attributes: [["style", {
      backgroundColor: "#fff",
      borderRadius: "12px",
      padding: "1.5rem",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      borderLeft: `4px solid ${color}`
    }]],
    children: [
      {
        tag: "h3",
        attributes: [["style", {
          color: "#666",
          fontSize: "0.9rem",
          fontWeight: "500",
          margin: "0 0 0.5rem 0"
        }]],
        children: [title]
      },
      {
        tag: "div",
        attributes: [["style", {
          color: color,
          fontSize: "2rem",
          fontWeight: "bold"
        }]],
        children: [value]
      }
    ]
  };
}

// Méthodes statiques pour la gestion des utilisateurs
AdminPage.loadUsers = async function() {
  try {
    const response = await fetch('https://wxfruxhckurswdcbdxwq.supabase.co/rest/v1/utilisateur?select=*&order=created_at.desc', {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4ZnJ1eGhja3Vyc3dkY2JkeHdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMzM0OTksImV4cCI6MjA2NTgwOTQ5OX0.OztdaAYi3kRHhXmPwhmQCH7emQAkyYk-2R5io6M-8es',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4ZnJ1eGhja3Vyc3dkY2JkeHdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMzM0OTksImV4cCI6MjA2NTgwOTQ5OX0.OztdaAYi3kRHhXmPwhmQCH7emQAkyYk-2R5io6M-8es',
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const users = await response.json();
      AdminPage.displayUsers(users);
      AdminPage.updateStats(users);
    } else {
      throw new Error('Erreur lors du chargement des utilisateurs');
    }
  } catch (error) {
    AdminPage.showToast('Erreur lors du chargement des utilisateurs: ' + error.message, 'error');
  }
};

AdminPage.displayUsers = function(users) {
  const tbody = document.getElementById('users-tbody');
  if (!tbody) return;

  if (users.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="padding: 2rem; text-align: center; color: #666;">
          Aucun utilisateur trouvé
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = users.map(user => `
    <tr style="border-bottom: 1px solid #dee2e6;">
      <td style="padding: 1rem; font-family: monospace; font-size: 0.8rem;">${user.id}</td>
      <td style="padding: 1rem;">${user.email}</td>
      <td style="padding: 1rem;">${user.nom || '-'}</td>
      <td style="padding: 1rem;">${user.prenom || '-'}</td>
      <td style="padding: 1rem;">${user.pseudo || '-'}</td>
      <td style="padding: 1rem;">
        <select 
          onchange="AdminPage.changeUserRole('${user.id}', this.value)"
          style="padding: 0.25rem; border: 1px solid #ddd; border-radius: 4px; font-size: 0.8rem;"
        >
          <option value="1" ${user.id_role === 1 ? 'selected' : ''}>Utilisateur</option>
          <option value="2" ${user.id_role === 2 ? 'selected' : ''}>Administrateur</option>
        </select>
      </td>
      <td style="padding: 1rem; font-size: 0.8rem;">
        ${new Date(user.created_at).toLocaleDateString('fr-FR')}
      </td>
      <td style="padding: 1rem;">
        <button 
          onclick="AdminPage.deleteUser('${user.id}')"
          style="
            background-color: #dc3545; 
            color: white; 
            border: none; 
            border-radius: 4px; 
            padding: 0.25rem 0.5rem; 
            cursor: pointer; 
            font-size: 0.8rem;
          "
        >
          🗑️ Supprimer
        </button>
      </td>
    </tr>
  `).join('');
};

AdminPage.updateStats = function(users) {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const totalUsers = users.length;
  const newUsers = users.filter(user => new Date(user.created_at) > weekAgo).length;
  const pendingUsers = users.filter(user => user.id_role === 1).length; // Utilisateurs normaux
  const bannedUsers = 0; // À implémenter si nécessaire

  // Mettre à jour les statistiques
  const statCards = document.querySelectorAll('.admin-stats > div');
  if (statCards.length >= 4) {
    statCards[0].querySelector('div').textContent = totalUsers;
    statCards[1].querySelector('div').textContent = newUsers;
    statCards[2].querySelector('div').textContent = pendingUsers;
    statCards[3].querySelector('div').textContent = bannedUsers;
  }
};

AdminPage.changeUserRole = async function(userId, roleId) {
  try {
    const response = await fetch(`https://wxfruxhckurswdcbdxwq.supabase.co/rest/v1/utilisateur?id=eq.${userId}`, {
      method: 'PATCH',
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4ZnJ1eGhja3Vyc3dkY2JkeHdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMzM0OTksImV4cCI6MjA2NTgwOTQ5OX0.OztdaAYi3kRHhXmPwhmQCH7emQAkyYk-2R5io6M-8es',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4ZnJ1eGhja3Vyc3dkY2JkeHdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMzM0OTksImV4cCI6MjA2NTgwOTQ5OX0.OztdaAYi3kRHhXmPwhmQCH7emQAkyYk-2R5io6M-8es',
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ id_role: parseInt(roleId) })
    });

    if (response.ok) {
      AdminPage.showToast('Rôle mis à jour avec succès', 'success');
      AdminPage.loadUsers(); // Recharger la liste
    } else {
      throw new Error('Erreur lors du changement de rôle');
    }
  } catch (error) {
    AdminPage.showToast('Erreur lors du changement de rôle: ' + error.message, 'error');
  }
};

AdminPage.deleteUser = async function(userId) {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.')) {
    return;
  }

  try {
    const response = await fetch(`https://wxfruxhckurswdcbdxwq.supabase.co/rest/v1/utilisateur?id=eq.${userId}`, {
      method: 'DELETE',
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4ZnJ1eGhja3Vyc3dkY2JkeHdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMzM0OTksImV4cCI6MjA2NTgwOTQ5OX0.OztdaAYi3kRHhXmPwhmQCH7emQAkyYk-2R5io6M-8es',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4ZnJ1eGhja3Vyc3dkY2JkeHdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMzM0OTksImV4cCI6MjA2NTgwOTQ5OX0.OztdaAYi3kRHhXmPwhmQCH7emQAkyYk-2R5io6M-8es',
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      AdminPage.showToast('Utilisateur supprimé avec succès', 'success');
      AdminPage.loadUsers(); // Recharger la liste
    } else {
      throw new Error('Erreur lors de la suppression');
    }
  } catch (error) {
    AdminPage.showToast('Erreur lors de la suppression: ' + error.message, 'error');
  }
};

AdminPage.showToast = function(message, type = 'success') {
  const existingToasts = document.querySelectorAll('.toast');
  existingToasts.forEach(toast => toast.remove());
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#4CAF50' : '#f44336'};
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    font-weight: 500;
    z-index: 1000;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    max-width: 300px;
    word-wrap: break-word;
  `;
  
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.transform = 'translateX(0)';
  }, 100);
  
  setTimeout(() => {
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 3000);
};

// Initialisation automatique
AdminPage.init = function() {
  setTimeout(() => {
    AdminPage.loadUsers();
  }, 100);
}; 