import { BrowserLink } from "../components/BrowserRouter.js";

export default function AdminUtilisateurs() {
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
            children: ["👤 Gestion des Utilisateurs"]
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
                attributes: [["id", "add-user-btn"], ["style", {
                  backgroundColor: "#28a745",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  padding: "0.5rem 1rem",
                  cursor: "pointer",
                  fontSize: "0.9rem"
                }]],
                events: {
                  click: [showAddUserModal]
                },
                children: ["➕ Ajouter Utilisateur"]
              }
            ]
          }
        ]
      },
      {
        tag: "div",
        attributes: [["id", "users-table-container"], ["style", {
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
                      { tag: "th", attributes: [["style", { padding: "1rem", textAlign: "left" }]], children: ["Prénom"] },
                      { tag: "th", attributes: [["style", { padding: "1rem", textAlign: "left" }]], children: ["Pseudo"] },
                      { tag: "th", attributes: [["style", { padding: "1rem", textAlign: "left" }]], children: ["Téléphone"] },
                      { tag: "th", attributes: [["style", { padding: "1rem", textAlign: "left" }]], children: ["Rôle"] },
                      { tag: "th", attributes: [["style", { padding: "1rem", textAlign: "left" }]], children: ["Créé le"] },
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
  };
}

// Fonctions CRUD
async function loadUsers() {
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
      displayUsers(users);
    } else {
      throw new Error('Erreur lors du chargement des utilisateurs');
    }
  } catch (error) {
    showToast('Erreur lors du chargement des utilisateurs: ' + error.message, 'error');
  }
}

function displayUsers(users) {
  const tbody = document.getElementById('users-tbody');
  if (!tbody) return;

  // Stocker les utilisateurs globalement pour l'édition
  window.currentUsers = users;

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
      <td style="padding: 1rem;">${user.nom || '-'}</td>
      <td style="padding: 1rem;">${user.prenom || '-'}</td>
      <td style="padding: 1rem;">${user.pseudo || '-'}</td>
      <td style="padding: 1rem;">${user.telephone || '-'}</td>
      <td style="padding: 1rem;">
        <select 
          onchange="changeUserRole('${user.id}', this.value)"
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
          onclick="editUser('${user.id}')"
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
          onclick="deleteUser('${user.id}')"
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

async function changeUserRole(userId, roleId) {
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
      showToast('Rôle mis à jour avec succès', 'success');
      loadUsers();
    } else {
      throw new Error('Erreur lors du changement de rôle');
    }
  } catch (error) {
    showToast('Erreur lors du changement de rôle: ' + error.message, 'error');
  }
}

async function deleteUser(userId) {
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
      showToast('Utilisateur supprimé avec succès', 'success');
      loadUsers();
    } else {
      throw new Error('Erreur lors de la suppression');
    }
  } catch (error) {
    showToast('Erreur lors de la suppression: ' + error.message, 'error');
  }
}

function editUser(userId) {
  // Récupérer les données de l'utilisateur
  const user = window.currentUsers?.find(u => u.id === userId);
  if (!user) {
    showToast('Utilisateur non trouvé', 'error');
    return;
  }
  
  showUserModal(user, true);
}

function showAddUserModal() {
  showUserModal(null, false);
}

function showUserModal(user = null, isEdit = false) {
  const modal = document.createElement('div');
  modal.id = 'user-modal';
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
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
    ">
      <h2 style="margin: 0 0 1.5rem 0; color: #5A3FF3;">
        ${isEdit ? '✏️ Modifier Utilisateur' : '➕ Ajouter Utilisateur'}
      </h2>
      
      <form id="user-form">
        <div style="margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Nom:</label>
          <input type="text" id="user-nom" value="${user?.nom || ''}" style="
            width: 100%;
            padding: 0.5rem;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 0.9rem;
          " required>
        </div>
        
        <div style="margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Prénom:</label>
          <input type="text" id="user-prenom" value="${user?.prenom || ''}" style="
            width: 100%;
            padding: 0.5rem;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 0.9rem;
          " required>
        </div>
        
        <div style="margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Pseudo:</label>
          <input type="text" id="user-pseudo" value="${user?.pseudo || ''}" style="
            width: 100%;
            padding: 0.5rem;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 0.9rem;
          ">
        </div>
        
        <div style="margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Téléphone:</label>
          <input type="tel" id="user-telephone" value="${user?.telephone || ''}" style="
            width: 100%;
            padding: 0.5rem;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 0.9rem;
          ">
        </div>
        
        <div style="margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Bio:</label>
          <textarea id="user-bio" rows="3" style="
            width: 100%;
            padding: 0.5rem;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 0.9rem;
            resize: vertical;
          ">${user?.bio || ''}</textarea>
        </div>
        
        <div style="margin-bottom: 1.5rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Rôle:</label>
          <select id="user-role" style="
            width: 100%;
            padding: 0.5rem;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 0.9rem;
          ">
            <option value="1" ${user?.id_role === 1 ? 'selected' : ''}>Utilisateur</option>
            <option value="2" ${user?.id_role === 2 ? 'selected' : ''}>Administrateur</option>
          </select>
        </div>
        
        <div style="display: flex; gap: 1rem; justify-content: flex-end;">
          <button type="button" onclick="closeUserModal()" style="
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
  const form = document.getElementById('user-form');
  form.onsubmit = (e) => {
    e.preventDefault();
    handleUserSubmit(user?.id, isEdit);
  };
  
  // Fermer la modal en cliquant à l'extérieur
  modal.onclick = (e) => {
    if (e.target === modal) {
      closeUserModal();
    }
  };
}

function closeUserModal() {
  const modal = document.getElementById('user-modal');
  if (modal) {
    modal.remove();
  }
}

async function handleUserSubmit(userId = null, isEdit = false) {
  const formData = {
    nom: document.getElementById('user-nom').value,
    prenom: document.getElementById('user-prenom').value,
    pseudo: document.getElementById('user-pseudo').value,
    telephone: document.getElementById('user-telephone').value,
    bio: document.getElementById('user-bio').value,
    id_role: parseInt(document.getElementById('user-role').value)
  };
  
  try {
    let response;
    if (isEdit) {
      // Modification
      response = await fetch(`https://wxfruxhckurswdcbdxwq.supabase.co/rest/v1/utilisateur?id=eq.${userId}`, {
        method: 'PATCH',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4ZnJ1eGhja3Vyc3dkY2JkeHdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMzM0OTksImV4cCI6MjA2NTgwOTQ5OX0.OztdaAYi3kRHhXmPwhmQCH7emQAkyYk-2R5io6M-8es',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4ZnJ1eGhja3Vyc3dkY2JkeHdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMzM0OTksImV4cCI6MjA2NTgwOTQ5OX0.OztdaAYi3kRHhXmPwhmQCH7emQAkyYk-2R5io6M-8es',
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(formData)
      });
    } else {
      // Ajout - Note: Pour un vrai ajout, il faudrait d'abord créer l'utilisateur dans auth.users
      showToast('Pour ajouter un utilisateur, il faut d\'abord créer un compte dans l\'authentification', 'info');
      closeUserModal();
      return;
    }
    
    if (response.ok) {
      showToast(`Utilisateur ${isEdit ? 'modifié' : 'ajouté'} avec succès`, 'success');
      closeUserModal();
      loadUsers();
    } else {
      throw new Error(`Erreur lors de ${isEdit ? 'la modification' : 'l\'ajout'}`);
    }
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
window.changeUserRole = changeUserRole;
window.deleteUser = deleteUser;
window.editUser = editUser;
window.closeUserModal = closeUserModal;

// Initialisation
AdminUtilisateurs.postRender = function() {
  setTimeout(() => {
    loadUsers();
  }, 100);
}; 