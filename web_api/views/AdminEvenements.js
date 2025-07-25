import { BrowserLink } from "../components/BrowserRouter.js";
import supabase from "../config.js";

export default function AdminEvenements() {
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
            children: ["📅 Gestion des Événements"]
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
                attributes: [["id", "add-event-btn"], ["style", {
                  backgroundColor: "#28a745",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  padding: "0.5rem 1rem",
                  cursor: "pointer",
                  fontSize: "0.9rem"
                }]],
                events: {
                  click: [showAddEventModal]
                },
                children: ["➕ Ajouter Événement"]
              }
            ]
          }
        ]
      },
      {
        tag: "div",
        attributes: [["id", "events-table-container"], ["style", {
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
                      { tag: "th", attributes: [["style", { padding: "1rem", textAlign: "left" }]], children: ["Date"] },
                      { tag: "th", attributes: [["style", { padding: "1rem", textAlign: "left" }]], children: ["Lieu"] },
                      { tag: "th", attributes: [["style", { padding: "1rem", textAlign: "left" }]], children: ["Prix"] },
                      { tag: "th", attributes: [["style", { padding: "1rem", textAlign: "left" }]], children: ["Statut"] },
                      { tag: "th", attributes: [["style", { padding: "1rem", textAlign: "left" }]], children: ["Visibilité"] },
                      { tag: "th", attributes: [["style", { padding: "1rem", textAlign: "left" }]], children: ["Actions"] }
                    ]
                  }
                ]
              },
              {
                tag: "tbody",
                attributes: [["id", "events-tbody"]],
                children: [
                  {
                    tag: "tr",
                    children: [
                      {
                        tag: "td",
                        attributes: [["colspan", "8"], ["style", { padding: "2rem", textAlign: "center", color: "#666" }]],
                        children: ["Chargement des événements..."]
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
async function loadEvents() {
  try {
    const events = await supabase.query("evenement", {
      select: "*",
      orderBy: "date.desc"
    });
    
    displayEvents(events);
  } catch (error) {
    console.error('Erreur loadEvents:', error);
    showToast('Erreur lors du chargement des événements: ' + error.message, 'error');
    
    // Afficher un message d'erreur dans le tableau
    const tbody = document.getElementById('events-tbody');
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

function displayEvents(events) {
  const tbody = document.getElementById('events-tbody');
  if (!tbody) return;

  // Stocker les événements globalement pour l'édition
  window.currentEvents = events;

  if (events.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="padding: 2rem; text-align: center; color: #666;">
          Aucun événement trouvé
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = events.map(event => `
    <tr style="border-bottom: 1px solid #dee2e6;">
      <td style="padding: 1rem; font-family: monospace; font-size: 0.8rem;">${event.id}</td>
      <td style="padding: 1rem; font-weight: 500;">${event.nom}</td>
      <td style="padding: 1rem; font-size: 0.8rem;">
        ${new Date(event.date).toLocaleDateString('fr-FR')} ${new Date(event.date).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
      </td>
      <td style="padding: 1rem;">${event.lieu}</td>
      <td style="padding: 1rem;">${event.prix ? event.prix + '€' : 'Gratuit'}</td>
      <td style="padding: 1rem;">
        <select 
          onchange="changeEventStatus(${event.id}, this.value)"
          style="padding: 0.25rem; border: 1px solid #ddd; border-radius: 4px; font-size: 0.8rem;"
        >
          <option value="planifie" ${event.statut === 'planifie' ? 'selected' : ''}>Planifié</option>
          <option value="en_cours" ${event.statut === 'en_cours' ? 'selected' : ''}>En cours</option>
          <option value="termine" ${event.statut === 'termine' ? 'selected' : ''}>Terminé</option>
          <option value="annule" ${event.statut === 'annule' ? 'selected' : ''}>Annulé</option>
        </select>
      </td>
      <td style="padding: 1rem;">
        <select 
          onchange="changeEventVisibility(${event.id}, this.value)"
          style="padding: 0.25rem; border: 1px solid #ddd; border-radius: 4px; font-size: 0.8rem;"
        >
          <option value="true" ${event.visibilite === true ? 'selected' : ''}>Visible</option>
          <option value="false" ${event.visibilite === false ? 'selected' : ''}>Masqué</option>
        </select>
      </td>
      <td style="padding: 1rem;">
        <button 
          onclick="editEvent(${event.id})"
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
          onclick="deleteEvent(${event.id})"
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

async function changeEventStatus(eventId, status) {
  try {
    await supabase.update("evenement", { statut: status }, { id: eventId });
    showToast('Statut mis à jour avec succès', 'success');
    loadEvents();
  } catch (error) {
    showToast('Erreur lors du changement de statut: ' + error.message, 'error');
  }
}

async function changeEventVisibility(eventId, visibility) {
  try {
    await supabase.update("evenement", { visibilite: visibility === 'true' }, { id: eventId });
    showToast('Visibilité mise à jour avec succès', 'success');
    loadEvents();
  } catch (error) {
    showToast('Erreur lors du changement de visibilité: ' + error.message, 'error');
  }
}

async function deleteEvent(eventId) {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ? Cette action est irréversible.')) {
    return;
  }

  try {
    await supabase.delete("evenement", { id: eventId });
    showToast('Événement supprimé avec succès', 'success');
    loadEvents();
  } catch (error) {
    showToast('Erreur lors de la suppression: ' + error.message, 'error');
  }
}

function editEvent(eventId) {
  // Récupérer les données de l'événement
  const event = window.currentEvents?.find(e => e.id === eventId);
  if (!event) {
    showToast('Événement non trouvé', 'error');
    return;
  }
  
  showEventModal(event, true);
}

function showAddEventModal() {
  showEventModal(null, false);
}

function showEventModal(event = null, isEdit = false) {
  const modal = document.createElement('div');
  modal.id = 'event-modal';
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
  
  // Formater la date pour l'input datetime-local
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };
  
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
      <h2 style="margin: 0 0 1.5rem 0; color: #5A3FF3;">
        ${isEdit ? '✏️ Modifier Événement' : '➕ Ajouter Événement'}
      </h2>
      
      <form id="event-form">
        <div style="margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Nom *:</label>
          <input type="text" id="event-nom" value="${event?.nom || ''}" style="
            width: 100%;
            padding: 0.5rem;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 0.9rem;
          " required>
        </div>
        
        <div style="margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Date et heure *:</label>
          <input type="datetime-local" id="event-date" value="${formatDateForInput(event?.date)}" style="
            width: 100%;
            padding: 0.5rem;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 0.9rem;
          " required>
        </div>
        
        <div style="margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Lieu *:</label>
          <input type="text" id="event-lieu" value="${event?.lieu || ''}" style="
            width: 100%;
            padding: 0.5rem;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 0.9rem;
          " required>
        </div>
        
        <div style="margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Adresse complète:</label>
          <textarea id="event-adresse" rows="2" style="
            width: 100%;
            padding: 0.5rem;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 0.9rem;
            resize: vertical;
          ">${event?.adresse_complete || ''}</textarea>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
          <div>
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Latitude:</label>
            <input type="number" step="0.00000001" id="event-latitude" value="${event?.latitude || ''}" style="
              width: 100%;
              padding: 0.5rem;
              border: 1px solid #ddd;
              border-radius: 4px;
              font-size: 0.9rem;
            ">
          </div>
          <div>
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Longitude:</label>
            <input type="number" step="0.00000001" id="event-longitude" value="${event?.longitude || ''}" style="
              width: 100%;
              padding: 0.5rem;
              border: 1px solid #ddd;
              border-radius: 4px;
              font-size: 0.9rem;
            ">
          </div>
        </div>
        
        <div style="margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Description *:</label>
          <textarea id="event-description" rows="4" style="
            width: 100%;
            padding: 0.5rem;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 0.9rem;
            resize: vertical;
          " required>${event?.description || ''}</textarea>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
          <div>
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Prix (€):</label>
            <input type="number" step="0.01" min="0" id="event-prix" value="${event?.prix || '0.00'}" style="
              width: 100%;
              padding: 0.5rem;
              border: 1px solid #ddd;
              border-radius: 4px;
              font-size: 0.9rem;
            ">
          </div>
          <div>
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Max participants:</label>
            <input type="number" min="1" id="event-max-participants" value="${event?.nombre_max_participants || ''}" style="
              width: 100%;
              padding: 0.5rem;
              border: 1px solid #ddd;
              border-radius: 4px;
              font-size: 0.9rem;
            ">
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
          <div>
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Statut:</label>
            <select id="event-statut" style="
              width: 100%;
              padding: 0.5rem;
              border: 1px solid #ddd;
              border-radius: 4px;
              font-size: 0.9rem;
            ">
              <option value="planifie" ${event?.statut === 'planifie' ? 'selected' : ''}>Planifié</option>
              <option value="en_cours" ${event?.statut === 'en_cours' ? 'selected' : ''}>En cours</option>
              <option value="termine" ${event?.statut === 'termine' ? 'selected' : ''}>Terminé</option>
              <option value="annule" ${event?.statut === 'annule' ? 'selected' : ''}>Annulé</option>
            </select>
          </div>
          <div>
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Visibilité:</label>
            <select id="event-visibilite" style="
              width: 100%;
              padding: 0.5rem;
              border: 1px solid #ddd;
              border-radius: 4px;
              font-size: 0.9rem;
            ">
              <option value="true" ${event?.visibilite !== false ? 'selected' : ''}>Visible</option>
              <option value="false" ${event?.visibilite === false ? 'selected' : ''}>Masqué</option>
            </select>
          </div>
        </div>
        
        <div style="display: flex; gap: 1rem; justify-content: flex-end;">
          <button type="button" onclick="closeEventModal()" style="
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
  const form = document.getElementById('event-form');
  form.onsubmit = (e) => {
    e.preventDefault();
    handleEventSubmit(event?.id, isEdit);
  };
  
  // Fermer la modal en cliquant à l'extérieur
  modal.onclick = (e) => {
    if (e.target === modal) {
      closeEventModal();
    }
  };
}

function closeEventModal() {
  const modal = document.getElementById('event-modal');
  if (modal) {
    modal.remove();
  }
}

async function handleEventSubmit(eventId = null, isEdit = false) {
  const formData = {
    nom: document.getElementById('event-nom').value,
    date: document.getElementById('event-date').value,
    lieu: document.getElementById('event-lieu').value,
    adresse_complete: document.getElementById('event-adresse').value || null,
    latitude: document.getElementById('event-latitude').value ? parseFloat(document.getElementById('event-latitude').value) : null,
    longitude: document.getElementById('event-longitude').value ? parseFloat(document.getElementById('event-longitude').value) : null,
    description: document.getElementById('event-description').value,
    prix: parseFloat(document.getElementById('event-prix').value) || 0.00,
    nombre_max_participants: document.getElementById('event-max-participants').value ? parseInt(document.getElementById('event-max-participants').value) : null,
    statut: document.getElementById('event-statut').value,
    visibilite: document.getElementById('event-visibilite').value === 'true'
  };
  
  try {
    if (isEdit) {
      // Modification
      await supabase.update("evenement", formData, { id: eventId });
      showToast('Événement modifié avec succès', 'success');
    } else {
      // Ajout
      await supabase.insert("evenement", formData);
      showToast('Événement ajouté avec succès', 'success');
    }
    
    closeEventModal();
    loadEvents();
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
window.changeEventStatus = changeEventStatus;
window.changeEventVisibility = changeEventVisibility;
window.deleteEvent = deleteEvent;
window.editEvent = editEvent;
window.closeEventModal = closeEventModal;

// Initialisation
AdminEvenements.postRender = function() {
  setTimeout(() => {
    loadEvents();
  }, 100);
}; 