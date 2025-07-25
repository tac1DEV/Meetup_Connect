import { BrowserLink } from "../components/BrowserRouter.js";
import supabase from "../config.js";

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
    // Utiliser directement l'API fetch pour éviter les problèmes de configuration
    const response = await fetch('https://wxfruxhckurswdcbdxwq.supabase.co/rest/v1/communaute?select=*&order=date_creation.desc', {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4ZnJ1eGhja3Vyc3dkY2JkeHdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMzM0OTksImV4cCI6MjA2NTgwOTQ5OX0.OztdaAYi3kRHhXmPwhmQCH7emQAkyYk-2R5io6M-8es',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4ZnJ1eGhja3Vyc3dkY2JkeHdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMzM0OTksImV4cCI6MjA2NTgwOTQ5OX0.OztdaAYi3kRHhXmPwhmQCH7emQAkyYk-2R5io6M-8es',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP ${response.status}: ${await response.text()}`);
    }

    const communities = await response.json();
    console.log('Communautés récupérées:', communities);

    // Enrichir les données avec des valeurs par défaut pour éviter les erreurs
    const communitiesWithDetails = communities.map(communaute => ({
      ...communaute,
      memberCount: 0, // On ne compte pas les membres pour l'instant
      categorie: { nom: 'Catégorie ' + communaute.id_categorie },
      utilisateur: { nom: 'Utilisateur', prenom: 'ID: ' + communaute.id_createur?.substring(0, 8) }
    }));

    displayCommunities(communitiesWithDetails);
  } catch (error) {
    console.error('Erreur loadCommunities:', error);
    showToast('Erreur lors du chargement des communautés : ' + error.message, 'error');
    
    // Afficher un message d'erreur dans le tableau
    const tbody = document.getElementById('communities-tbody');
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="padding: 2rem; text-align: center; color: #dc3545;">
            Erreur de chargement : ${error.message}
          </td>
        </tr>
      `;
    }
  }
}
  




function displayCommunities(communities) {
  const tbody = document.getElementById('communities-tbody');
  if (!tbody) return;

  // Stocker les communautés globalement pour l'édition
  window.currentCommunities = communities;

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

    if (!response.ok) {
      throw new Error(`Erreur HTTP ${response.status}: ${await response.text()}`);
    }

    showToast('Communauté supprimée avec succès', 'success');
    loadCommunities();
  } catch (error) {
    showToast('Erreur lors de la suppression: ' + error.message, 'error');
  }
}

function editCommunity(communityId) {
  // Récupérer les données de la communauté
  const community = window.currentCommunities?.find(c => c.id === communityId);
  if (!community) {
    showToast('Communauté non trouvée', 'error');
    return;
  }
  
  showCommunityModal(community, true);
}

function showAddCommunityModal() {
  showCommunityModal(null, false);
}

function showCommunityModal(community = null, isEdit = false) {
  const modal = document.createElement('div');
  modal.id = 'community-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
  `;
  
  modal.innerHTML = `
    <div style="
      background: white;
      padding: 2rem;
      border-radius: 10px;
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
    ">
     
      <form id="community-form">
        <div style="margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Nom *:</label>
          <input type="text" id="community-nom" value="${community?.nom || ''}" style="
            width: 100%;
            padding: 0.5rem;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 0.9rem;
          " required>
        </div>
        
        <div style="margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Description *:</label>
          <textarea id="community-description" rows="4" style="
            width: 100%;
            padding: 0.5rem;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 0.9rem;
            resize: vertical;
          " required>${community?.description || ''}</textarea>
        </div>
        
        <div style="margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Catégorie *:</label>
          <select id="community-categorie" style="
            width: 100%;
            padding: 0.5rem;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 0.9rem;
          " required>
            <option value="">Sélectionner une catégorie</option>
            <option value="1" ${community?.id_categorie === 1 ? 'selected' : ''}>Technologie</option>
            <option value="2" ${community?.id_categorie === 2 ? 'selected' : ''}>Sport</option>
            <option value="3" ${community?.id_categorie === 3 ? 'selected' : ''}>Culture</option>
            <option value="4" ${community?.id_categorie === 4 ? 'selected' : ''}>Business</option>
            <option value="5" ${community?.id_categorie === 5 ? 'selected' : ''}>Loisirs</option>
          </select>
        </div>
        
        <div style="margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Nombre max de membres:</label>
          <input type="number" min="1" id="community-max-membres" value="${community?.nombre_max_membres || ''}" style="
            width: 100%;
            padding: 0.5rem;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 0.9rem;
          " placeholder="Illimité si vide">
        </div>
        
        <div style="margin-bottom: 1.5rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Image URL:</label>
          <input type="url" id="community-image" value="${community?.image || ''}" style="
            width: 100%;
            padding: 0.5rem;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 0.9rem;
          " placeholder="https://...">
        </div>
        
        <div style="display: flex; gap: 1rem; justify-content: flex-end;">
          <button type="button" onclick="closeCommunityModal()" style="
            background: #6c757d;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.9rem;
          ">Annuler</button>
          <button type="submit" style="
            background: #28a745;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.9rem;
          ">${isEdit ? 'Modifier' : 'Ajouter'}</button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Gérer la soumission du formulaire
  const form = document.getElementById('community-form');
  form.onsubmit = (e) => {
    e.preventDefault();
    handleCommunitySubmit(community?.id, isEdit);
  };
  
  // Fermer la modal en cliquant à l'extérieur
  modal.onclick = (e) => {
    if (e.target === modal) {
      closeCommunityModal();
    }
  };
}

function closeCommunityModal() {
  const modal = document.getElementById('community-modal');
  if (modal) {
    modal.remove();
  }
}

async function handleCommunitySubmit(communityId = null, isEdit = false) {
  const formData = {
    nom: document.getElementById('community-nom').value,
    description: document.getElementById('community-description').value,
    id_categorie: parseInt(document.getElementById('community-categorie').value),
    nombre_max_membres: document.getElementById('community-max-membres').value ? parseInt(document.getElementById('community-max-membres').value) : null,
    image: document.getElementById('community-image').value || null
  };
  
  try {
    if (isEdit) {
      // Modification
      const response = await fetch(`https://wxfruxhckurswdcbdxwq.supabase.co/rest/v1/communaute?id=eq.${communityId}`, {
        method: 'PATCH',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4ZnJ1eGhja3Vyc3dkY2JkeHdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMzM0OTksImV4cCI6MjA2NTgwOTQ5OX0.OztdaAYi3kRHhXmPwhmQCH7emQAkyYk-2R5io6M-8es',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4ZnJ1eGhja3Vyc3dkY2JkeHdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMzM0OTksImV4cCI6MjA2NTgwOTQ5OX0.OztdaAYi3kRHhXmPwhmQCH7emQAkyYk-2R5io6M-8es',
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}: ${await response.text()}`);
      }

      showToast('Communauté modifiée avec succès', 'success');
    } else {
      // Ajout - utiliser un ID créateur par défaut
      formData.id_createur = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"; // ID par défaut
      
      const response = await fetch('https://wxfruxhckurswdcbdxwq.supabase.co/rest/v1/communaute', {
        method: 'POST',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4ZnJ1eGhja3Vyc3dkY2JkeHdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMzM0OTksImV4cCI6MjA2NTgwOTQ5OX0.OztdaAYi3kRHhXmPwhmQCH7emQAkyYk-2R5io6M-8es',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4ZnJ1eGhja3Vyc3dkY2JkeHdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMzM0OTksImV4cCI6MjA2NTgwOTQ5OX0.OztdaAYi3kRHhXmPwhmQCH7emQAkyYk-2R5io6M-8es',
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}: ${await response.text()}`);
      }

      showToast('Communauté ajoutée avec succès', 'success');
    }
    
    closeCommunityModal();
    loadCommunities();
  } catch (error) {
    showToast(`Erreur: ${error.message}`, 'error');
  }
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
window.closeCommunityModal = closeCommunityModal;

// Initialisation
AdminCommunautes.postRender = function() {
  setTimeout(() => {
    loadCommunities();
  }, 100);
}; 