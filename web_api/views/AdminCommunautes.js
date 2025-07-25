import { BrowserLink } from "../components/BrowserRouter.js";

export default function AdminCommunautes() {
  return {
    tag: "div",
    attributes: [["style", {
      maxWidth: "1200px",
      margin: "2rem auto",
      background: "#fff",
      borderRadius: "10px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      padding: "2rem"
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
            children: ["🏘️ Gestion des Communautés"]
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
                tag: BrowserLink,
                attributes: [["link", "/admin"], ["title", "Retour"], ["style", {
                  backgroundColor: "#6c757d",
                  color: "#fff",
                  padding: "0.5rem 1rem",
                  borderRadius: "6px",
                  textDecoration: "none",
                  fontSize: "0.9rem"
                }]],
                children: ["← Retour"]
              },
              {
                tag: "button",
                attributes: [["id", "add-community-btn"], ["style", {
                  backgroundColor: "#28a745",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  padding: "0.5rem 1rem",
                  cursor: "pointer",
                  fontSize: "0.9rem"
                }]],
                events: {
                  click: [showAddCommunityModal]
                },
                children: ["➕ Ajouter Communauté"]
              }
            ]
          }
        ]
      },
      {
        tag: "div",
        attributes: [["id", "communities-table-container"], ["style", {
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
                      { tag: "th", attributes: [["style", { padding: "1rem", textAlign: "left" }]], children: ["Nom"] },
                      { tag: "th", attributes: [["style", { padding: "1rem", textAlign: "left" }]], children: ["Description"] },
                      { tag: "th", attributes: [["style", { padding: "1rem", textAlign: "left" }]], children: ["Catégorie"] },
                      { tag: "th", attributes: [["style", { padding: "1rem", textAlign: "left" }]], children: ["Max Membres"] },
                      { tag: "th", attributes: [["style", { padding: "1rem", textAlign: "left" }]], children: ["Créateur"] },
                      { tag: "th", attributes: [["style", { padding: "1rem", textAlign: "left" }]], children: ["Créé le"] },
                      { tag: "th", attributes: [["style", { padding: "1rem", textAlign: "left" }]], children: ["Actions"] }
                    ]
                  }
                ]
              },
              {
                tag: "tbody",
                attributes: [["id", "communities-tbody"]],
                children: [
                  {
                    tag: "tr",
                    children: [
                      {
                        tag: "td",
                        attributes: [["colspan", "8"], ["style", { padding: "2rem", textAlign: "center", color: "#666" }]],
                        children: ["Chargement des communautés..."]
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
  };
}

// Fonctions CRUD
async function loadCommunities() {
  try {
    const response = await fetch('https://wxfruxhckurswdcbdxwq.supabase.co/rest/v1/communaute?select=*,categorie(nom),utilisateur(nom,prenom)&order=date_creation.desc', {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4ZnJ1eGhja3Vyc3dkY2JkeHdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMzM0OTksImV4cCI6MjA2NTgwOTQ5OX0.OztdaAYi3kRHhXmPwhmQCH7emQAkyYk-2R5io6M-8es',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4ZnJ1eGhja3Vyc3dkY2JkeHdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMzM0OTksImV4cCI6MjA2NTgwOTQ5OX0.OztdaAYi3kRHhXmPwhmQCH7emQAkyYk-2R5io6M-8es',
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const communities = await response.json();
      displayCommunities(communities);
    } else {
      throw new Error('Erreur lors du chargement des communautés');
    }
  } catch (error) {
    showToast('Erreur lors du chargement des communautés: ' + error.message, 'error');
  }
}

function displayCommunities(communities) {
  const tbody = document.getElementById('communities-tbody');
  if (!tbody) return;

  if (communities.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="padding: 2rem; text-align: center; color: #666;">
          Aucune communauté trouvée
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = communities.map(community => `
    <tr style="border-bottom: 1px solid #dee2e6;">
      <td style="padding: 1rem; font-family: monospace; font-size: 0.8rem;">${community.id}</td>
      <td style="padding: 1rem; font-weight: 500;">${community.nom}</td>
      <td style="padding: 1rem; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
        ${community.description || '-'}
      </td>
      <td style="padding: 1rem;">${community.categorie?.nom || '-'}</td>
      <td style="padding: 1rem;">${community.nombre_max_membres || 'Illimité'}</td>
      <td style="padding: 1rem; font-size: 0.8rem;">
        ${community.utilisateur ? `${community.utilisateur.prenom} ${community.utilisateur.nom}` : '-'}
      </td>
      <td style="padding: 1rem; font-size: 0.8rem;">
        ${new Date(community.date_creation).toLocaleDateString('fr-FR')}
      </td>
      <td style="padding: 1rem;">
        <button 
          onclick="editCommunity(${community.id})"
          style="
            background-color: #ffc107; 
            color: #000; 
            border: none; 
            border-radius: 4px; 
            padding: 0.25rem 0.5rem; 
            cursor: pointer; 
            font-size: 0.8rem;
            margin-right: 0.5rem;
          "
        >
          ✏️ Modifier
        </button>
        <button 
          onclick="deleteCommunity(${community.id})"
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
}

async function deleteCommunity(communityId) {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cette communauté ? Cette action est irréversible.')) {
    return;
  }

  try {
    const response = await fetch(`https://wxfruxhckurswdcbdxwq.supabase.co/rest/v1/communaute?id=eq.${communityId}`, {
      method: 'DELETE',
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4ZnJ1eGhja3Vyc3dkY2JkeHdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMzM0OTksImV4cCI6MjA2NTgwOTQ5OX0.OztdaAYi3kRHhXmPwhmQCH7emQAkyYk-2R5io6M-8es',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4ZnJ1eGhja3Vyc3dkY2JkeHdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMzM0OTksImV4cCI6MjA2NTgwOTQ5OX0.OztdaAYi3kRHhXmPwhmQCH7emQAkyYk-2R5io6M-8es',
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      showToast('Communauté supprimée avec succès', 'success');
      loadCommunities();
    } else {
      throw new Error('Erreur lors de la suppression');
    }
  } catch (error) {
    showToast('Erreur lors de la suppression: ' + error.message, 'error');
  }
}

function editCommunity(communityId) {
  // TODO: Implémenter la modal d'édition
  showToast('Fonctionnalité d\'édition à implémenter', 'info');
}

function showAddCommunityModal() {
  // TODO: Implémenter la modal d'ajout
  showToast('Fonctionnalité d\'ajout à implémenter', 'info');
}

function showToast(message, type = 'success') {
  const existingToasts = document.querySelectorAll('.toast');
  existingToasts.forEach(toast => toast.remove());
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
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
}

// Exposer les fonctions globalement
window.deleteCommunity = deleteCommunity;
window.editCommunity = editCommunity;

// Initialisation
AdminCommunautes.postRender = function() {
  setTimeout(() => {
    loadCommunities();
  }, 100);
}; 