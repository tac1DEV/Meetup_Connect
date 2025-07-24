import { BrowserLink as Link } from "../components/BrowserRouter.js";
import CommunauteService from "../services/CommunauteService.js";
import StateService from "../services/StateService.js";
import { ErrorHandler, UIUtils, DateUtils, NavigationUtils } from "../utils/index.js";
import { Button, Card, LoadingSpinner, Badge, CommunityJoinButton } from "../components/UIComponents.js";
import { createCommunityHeaderImage } from "../utils/CommunityImageUtils.js";
import createElement from "../lib/createElement.js";
import generateStructure from "../lib/generateStructure.js";
import { loadCommunautesData } from "./Communautes.js";

// Initialisation de l'état global pour la page communauté
StateService.setState('communautePage', {
  communaute: null,
  loading: true,
  error: null,
  communauteId: null,
  isSubscribed: false,
  loadingSubscription: false,
  memberCount: 0
});

// Fonction pour extraire l'ID de communauté depuis les paramètres d'URL, sessionStorage ou query params
function getCommunauteIdFromUrl() {
  let communauteId = null;
  
  // D'abord, essayer de récupérer depuis les paramètres d'URL (route dynamique)
  if (window.routeParams && window.routeParams.id) {
    console.log('ID depuis paramètres de route:', window.routeParams.id);
    communauteId = window.routeParams.id;
  }
  
  // Ensuite, essayer de récupérer depuis sessionStorage (fallback)
  if (!communauteId) {
    const sessionId = sessionStorage.getItem('selectedCommunauteId');
    console.log('ID depuis sessionStorage:', sessionId);
    communauteId = sessionId;
  }
  
  // Sinon, essayer les paramètres de requête (pour compatibilité)
  if (!communauteId) {
    const params = new URLSearchParams(window.location.search);
    const urlId = params.get('id');
    console.log('ID depuis URL query:', urlId);
    communauteId = urlId;
  }
  
  // Validation: s'assurer que l'ID est valide (nombre ou chaîne non vide)
  if (communauteId && (isNaN(communauteId) || communauteId.toString().trim() === '')) {
    console.warn('ID de communauté invalide détecté:', communauteId);
    return null;
  }
  
  return communauteId;
}

// Fonction pour charger les données d'une communauté spécifique
async function loadCommunauteData(communauteId = null) {
  try {
    StateService.updateState('communautePage', { loading: true, error: null });
    
    // Si aucun ID fourni, essayer de l'extraire de l'URL
    if (!communauteId) {
      communauteId = getCommunauteIdFromUrl();
    }
    
    console.log('Tentative de chargement de la communauté avec ID:', communauteId);
    
    if (!communauteId) {
      throw new Error("Aucun ID de communauté spécifié");
    }
    
    StateService.updateState('communautePage', { communauteId });
    
    // Charger la communauté avec ses événements via le service
    const communaute = await CommunauteService.getCommunauteById(communauteId);
    
    // Charger l'état d'inscription et le nombre de membres
    const [isSubscribed, members] = await Promise.all([
      CommunauteService.isUserSubscribed(communauteId),
      CommunauteService.getCommunauteMembers(communauteId)
    ]);
    
    StateService.updateState('communautePage', {
      communaute,
      loading: false,
      isSubscribed,
      memberCount: members.length
    });

    // Rafraîchir l'affichage
    renderCommunautePage();
    UIUtils.showToast('Communauté chargée avec succès', 'success');
  } catch (error) {
    ErrorHandler.logError(error, 'CommunautePage.loadCommunauteData');
    
    // Si la communauté n'existe pas (404, communauté supprimée, etc.)
    const isNotFound = error.message.includes('404') || 
                      error.message.includes('non trouvée') || 
                      error.message.includes('not found') ||
                      error.message.includes('Aucune communauté trouvée');
    
    if (isNotFound) {
      UIUtils.showToast('Cette communauté n\'existe plus. Redirection vers l\'accueil...', 'error');
      
      // Nettoyer et rediriger vers l'accueil après un court délai
      setTimeout(() => {
        window.routeParams = null;
        sessionStorage.removeItem('selectedCommunauteId');
        StateService.setState('communautePage', {
          communaute: null,
          loading: true,
          error: null,
          communauteId: null,
          isSubscribed: false,
          loadingSubscription: false,
          memberCount: 0
        });
        NavigationUtils.goToHome();
      }, 2000);
    } else {
      StateService.updateState('communautePage', {
        loading: false,
        error: error.message
      });
      renderCommunautePage();
      UIUtils.showToast(ErrorHandler.formatUserMessage(error), 'error');
    }
  }
}

// Fonction pour rejoindre un événement
async function joinEvent(eventId, eventTitle) {
  try {
    const confirmation = confirm(`Voulez-vous vous inscrire à l'événement "${eventTitle}" ?`);
    if (!confirmation) return;

    // Afficher un indicateur de chargement sur tous les boutons concernés
    const buttons = document.querySelectorAll(`button[onclick*="${eventId}"]`);
    buttons.forEach(button => {
      UIUtils.setButtonLoading(button, true, "Inscription...");
    });

    try {
      // S'inscrire à l'événement via Supabase (à implémenter dans un service)
      // await EventService.joinEvent(eventId);
      
      UIUtils.showToast(`Vous êtes maintenant inscrit à l'événement "${eventTitle}" !`, 'success');
      
      // Recharger les données pour mettre à jour l'affichage
      const state = StateService.getState('communautePage');
      if (state.communauteId) {
        await loadCommunauteData(state.communauteId);
      }
      
    } finally {
      // Restaurer les boutons
      buttons.forEach(button => {
        UIUtils.setButtonLoading(button, false, "S'inscrire");
      });
    }
    
  } catch (error) {
    ErrorHandler.logError(error, 'CommunautePage.joinEvent');
    UIUtils.showToast(ErrorHandler.formatUserMessage(error), 'error');
  }
}

// Fonction pour gérer l'inscription à la communauté
window.handleJoinCommunaute = async function(communauteId) {
  try {
    // Marquer comme en cours de chargement
    StateService.updateState('communautePage', { loadingSubscription: true });
    renderCommunautePage();

    // Faire l'inscription
    await CommunauteService.joinCommunaute(communauteId);

    // Recharger les membres et mettre à jour l'état
    const members = await CommunauteService.getCommunauteMembers(communauteId);
    
    StateService.updateState('communautePage', {
      isSubscribed: true,
      loadingSubscription: false,
      memberCount: members.length
    });

    // Rafraîchir l'affichage
    renderCommunautePage();
    UIUtils.showToast('Inscription à la communauté réussie !', 'success');

  } catch (error) {
    ErrorHandler.logError(error, 'CommunautePage.handleJoinCommunaute');
    
    StateService.updateState('communautePage', { loadingSubscription: false });
    renderCommunautePage();
    UIUtils.showToast(`Erreur d'inscription: ${error.message}`, 'error');
  }
}

// Fonction pour gérer la désinscription de la communauté
window.handleLeaveCommunaute = async function(communauteId) {
  try {
    // Marquer comme en cours de chargement
    StateService.updateState('communautePage', { loadingSubscription: true });
    renderCommunautePage();

    // Faire la désinscription
    await CommunauteService.leaveCommunaute(communauteId);

    // Recharger les membres et mettre à jour l'état
    const members = await CommunauteService.getCommunauteMembers(communauteId);
    
    StateService.updateState('communautePage', {
      isSubscribed: false,
      loadingSubscription: false,
      memberCount: members.length
    });

    // Rafraîchir l'affichage
    renderCommunautePage();
    UIUtils.showToast('Désinscription de la communauté réussie !', 'success');

  } catch (error) {
    ErrorHandler.logError(error, 'CommunautePage.handleLeaveCommunaute');
    
    StateService.updateState('communautePage', { loadingSubscription: false });
    renderCommunautePage();
    UIUtils.showToast(`Erreur de désinscription: ${error.message}`, 'error');
  }
}

// Fonction pour supprimer une communauté
async function deleteCommunaute(communauteId, communauteNom) {
  try {
    // Vérifier s'il y a des événements associés pour informer l'utilisateur
    const nombreEvenements = await CommunauteService.countEvenementsByCommunaute(communauteId);
    
    let message;
    if (nombreEvenements > 0) {
      message = `Êtes-vous sûr de vouloir supprimer la communauté "${communauteNom}" ?\n\n` +
        `Cette communauté contient ${nombreEvenements} événement(s) associé(s).\n\n` +
        `Les événements seront conservés dans l'historique\n` +
        `La communauté sera définitivement supprimée\n\n` +
        `Cette action est irréversible.`;
    } else {
      message = `Êtes-vous sûr de vouloir supprimer la communauté "${communauteNom}" ?\n\nCette action est irréversible.`;
    }
    
    const confirmation = confirm(message);
    if (!confirmation) return;

    // Effectuer la suppression via le service
    await CommunauteService.deleteCommunaute(communauteId, true);
    
    // Message de succès
    const successMsg = nombreEvenements > 0 ? 
      `La communauté "${communauteNom}" a été supprimée avec succès.\n\n` +
      `Les ${nombreEvenements} événement(s) ont été conservés dans l'historique.` :
      `La communauté "${communauteNom}" a été supprimée avec succès.`;
    
    UIUtils.showToast(successMsg, 'success');
    
    // Nettoyer complètement les données de route et rediriger vers l'accueil
    window.routeParams = null; // Nettoyer les paramètres de route
    sessionStorage.removeItem('selectedCommunauteId');
    
    // Reset l'état de la communauté
    StateService.setState('communautePage', {
      communaute: null,
      loading: true,
      error: null,
      communauteId: null
    });
    
    // Recharger les données de Communautes pour refléter la suppression
    try {
      await loadCommunautesData();
      console.log('Données Communautes rechargées après suppression');
    } catch (reloadError) {
      console.warn('Erreur lors du rechargement des données Communautes:', reloadError);
      // En cas d'erreur, utiliser le flag de rechargement comme fallback
      sessionStorage.setItem('shouldReloadCommunautesPage', 'true');
    }
    
    NavigationUtils.goToHome();
    
  } catch (error) {
    ErrorHandler.logError(error, 'CommunautePage.deleteCommunaute');
    UIUtils.showToast(`Erreur lors de la suppression de la communauté: ${error.message}`, 'error');
  }
}

// Fonction pour rendre la page de communauté
function renderCommunautePage() {
  const rootElement = document.getElementById('root');
  if (!rootElement) return;

  const communautePageStructure = CommunautePage();
  const newPage = generateStructure(communautePageStructure);
  
  if (rootElement.firstChild) {
    rootElement.replaceChild(newPage, rootElement.firstChild);
  } else {
    rootElement.appendChild(newPage);
  }
}

// Composant pour une carte d'événement
function EventCard({ event }) {
  const dateDebut = new Date(event.date_debut);
  const dateFin = new Date(event.date_fin);
  const participants = event.evenement_participant ? event.evenement_participant.length : 0;
  const maxParticipants = event.nombre_max_participants;
  
  const statut = event.statut || 'planifie';
  const statutColors = {
    'planifie': { bg: '#e3f2fd', color: '#1976d2', text: 'Planifié' },
    'en_cours': { bg: '#e8f5e8', color: '#2e7d32', text: 'En cours' },
    'termine': { bg: '#f3e5f5', color: '#7b1fa2', text: 'Terminé' },
    'annule': { bg: '#ffebee', color: '#d32f2f', text: 'Annulé' }
  };

  const eventPassed = dateDebut < new Date();
  const canJoin = !eventPassed && statut === 'planifie' && (!maxParticipants || participants < maxParticipants);

  return {
    tag: "div",
    attributes: [
      ["class", "event-card"],
      ["style", {
        border: "1px solid #e1e1e1",
        borderRadius: "8px",
        padding: "20px",
        margin: "16px 0",
        backgroundColor: "#fff",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
      }]
    ],
    children: [
      {
        tag: "div",
        attributes: [["style", { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }]],
        children: [
          {
            tag: "h3",
            attributes: [["style", { margin: "0", color: "#333", fontSize: "20px", flex: "1" }]],
            children: [event.titre]
          },
          {
            tag: "span",
            attributes: [["style", { 
              backgroundColor: statutColors[statut].bg, 
              color: statutColors[statut].color, 
              padding: "6px 12px", 
              borderRadius: "16px", 
              fontSize: "14px",
              fontWeight: "bold"
            }]],
            children: [statutColors[statut].text]
          }
        ]
      },
      {
        tag: "p",
        attributes: [["style", { 
          color: "#666", 
          margin: "12px 0", 
          fontSize: "14px",
          lineHeight: "1.5"
        }]],
        children: [event.description || "Aucune description disponible"]
      },
      {
        tag: "div",
        attributes: [["style", { 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "16px"
        }]],
        children: [
          {
            tag: "div",
            children: [
              {
                tag: "strong",
                attributes: [["style", { color: "#333", display: "block", marginBottom: "4px" }]],
                children: ["Date de début"]
              },
              {
                tag: "span",
                attributes: [["style", { color: "#666", fontSize: "14px" }]],
                children: [dateDebut.toLocaleString('fr-FR')]
              }
            ]
          },
          {
            tag: "div",
            children: [
              {
                tag: "strong",
                attributes: [["style", { color: "#333", display: "block", marginBottom: "4px" }]],
                children: ["Date de fin"]
              },
              {
                tag: "span",
                attributes: [["style", { color: "#666", fontSize: "14px" }]],
                children: [dateFin.toLocaleString('fr-FR')]
              }
            ]
          },
          event.lieu ? {
            tag: "div",
            children: [
              {
                tag: "strong",
                attributes: [["style", { color: "#333", display: "block", marginBottom: "4px" }]],
                children: ["Lieu"]
              },
              {
                tag: "span",
                attributes: [["style", { color: "#666", fontSize: "14px" }]],
                children: [event.lieu]
              }
            ]
          } : null,
          {
            tag: "div",
            children: [
              {
                tag: "strong",
                attributes: [["style", { color: "#333", display: "block", marginBottom: "4px" }]],
                children: ["Participants"]
              },
              {
                tag: "span",
                attributes: [["style", { color: "#666", fontSize: "14px" }]],
                children: [maxParticipants ? `${participants}/${maxParticipants}` : `${participants} inscrits`]
              }
            ]
          }
        ].filter(Boolean)
      },
      canJoin ? {
        tag: "div",
        attributes: [["style", { display: "flex", justifyContent: "flex-end" }]],
        children: [
          {
            tag: "button",
            attributes: [["style", {
              padding: "10px 20px",
              backgroundColor: "#4caf50",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "bold"
            }]],
            events: {
              click: [() => joinEvent(event.id, event.titre)],
              mouseenter: [
                (e) => e.currentTarget.style.backgroundColor = "#45a049"
              ],
              mouseleave: [
                (e) => e.currentTarget.style.backgroundColor = "#4caf50"
              ]
            },
            children: ["S'inscrire"]
          }
        ]
      } : eventPassed ? {
        tag: "div",
        attributes: [["style", { 
          textAlign: "center", 
          padding: "10px", 
          backgroundColor: "#f5f5f5", 
          borderRadius: "4px",
          color: "#666",
          fontSize: "14px"
        }]],
        children: ["Cet événement est terminé"]
      } : !canJoin && maxParticipants && participants >= maxParticipants ? {
        tag: "div",
        attributes: [["style", { 
          textAlign: "center", 
          padding: "10px", 
          backgroundColor: "#ffebee", 
          borderRadius: "4px",
          color: "#d32f2f",
          fontSize: "14px"
        }]],
        children: ["Événement complet"]
      } : null
    ].filter(Boolean)
  };
}

// Composant principal de la page communauté
export default function CommunautePage() {
  const communauteState = StateService.getState('communautePage');
  
  // Charger les données au premier rendu si un ID est présent
  if (communauteState.loading && !communauteState.communaute) {
    const communauteId = getCommunauteIdFromUrl();
    if (communauteId) {
      setTimeout(() => loadCommunauteData(communauteId), 100);
    } else {
      StateService.updateState('communautePage', {
        loading: false,
        error: "Aucun ID de communauté spécifié"
      });
    }
  }

  // Nettoyer le sessionStorage quand on revient à l'accueil
  const cleanupAndGoHome = () => {
    // Nettoyer complètement les données de route
    window.routeParams = null;
    sessionStorage.removeItem('selectedCommunauteId');
    
    // Reset l'état de la communauté
    StateService.setState('communautePage', {
      communaute: null,
      loading: true,
      error: null,
      communauteId: null,
      isSubscribed: false,
      loadingSubscription: false,
      memberCount: 0
    });
  };
  return {
    tag: "div",
    attributes: [
      ["style", {
        fontFamily: "Arial, sans-serif",
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "20px",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh"
      }]
    ],
    children: [
      // Navigation retour
      {
        tag: "nav",
        attributes: [["style", {
          marginBottom: "20px"
        }]],
        children: [
          {
            tag: "button",
            attributes: [
              ["type", "button"],
              ["style", {
                display: "inline-flex",
                alignItems: "center",
                padding: "10px 15px",
                backgroundColor: "#4730dc",
                color: "white",
                border: "none",
                borderRadius: "5px",
                fontSize: "14px",
                cursor: "pointer",
                textDecoration: "none"
              }]
            ],
            events: {
              click: [
                (e) => {
                  console.log('Clic sur retour à l\'accueil');
                  cleanupAndGoHome();
                  console.log('cleanupAndGoHome() terminé');
                  NavigationUtils.goToHome();
                  console.log('NavigationUtils.goToHome() appelé');
                }
              ],
              mouseenter: [
                (e) => e.currentTarget.style.backgroundColor = "#1976d2"
              ],
              mouseleave: [
                (e) => e.currentTarget.style.backgroundColor = "#4730dc"
              ]
            },
            children: ["← Retour à l'accueil"]
          }
        ]
      },

      // Contenu principal
      communauteState.loading ? {
        tag: "div",
        attributes: [["style", {
          textAlign: "center",
          padding: "50px",
          backgroundColor: "white",
          borderRadius: "8px"
        }]],
        children: [
          {
            tag: "p",
            attributes: [["style", { fontSize: "18px", color: "#666" }]],
            children: ["Chargement de la communauté..."]
          }
        ]
      } : communauteState.error ? {
        tag: "div",
        attributes: [["style", {
          textAlign: "center",
          padding: "50px",
          backgroundColor: "#ffebee",
          borderRadius: "8px",
          border: "1px solid #f44336"
        }]],
        children: [
          {
            tag: "p",
            attributes: [["style", { fontSize: "18px", color: "#d32f2f" }]],
            children: [`Erreur: ${communauteState.error}`]
          }
        ]
      } : communauteState.communaute ? {
        tag: "div",
        children: [
          // En-tête de la communauté
          {
            tag: "header",
            attributes: [["style", {
              backgroundColor: "white",
              padding: "30px",
              borderRadius: "8px",
              marginBottom: "30px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }]],
            children: [
              {
                tag: "div",
                attributes: [["style", { display: "flex", gap: "30px", alignItems: "flex-start", marginBottom: "20px" }]],
                children: [
                  // Image de la communauté
                  createCommunityHeaderImage(communauteState.communaute),
                  
                  // Informations de la communauté
                  {
                    tag: "div",
                    attributes: [["style", { flex: "1" }]],
                    children: [
                      {
                        tag: "div",
                        attributes: [["style", { display: "flex", alignItems: "center", gap: "15px", marginBottom: "10px" }]],
                        children: [
                          {
                            tag: "h1",
                            attributes: [["style", { margin: "0", color: "#333", fontSize: "32px" }]],
                            children: [communauteState.communaute.nom]
                          },
                          {
                            tag: "button",
                            attributes: [
                              ["title", "Supprimer cette communauté"],
                              ["style", { 
                                backgroundColor: "#f44336", 
                                color: "white", 
                                border: "none", 
                                borderRadius: "6px", 
                                width: "36px", 
                                height: "36px", 
                                cursor: "pointer",
                                fontSize: "16px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                transition: "background-color 0.2s"
                              }]
                            ],
                            events: {
                              click: [
                                () => deleteCommunaute(communauteState.communaute.id, communauteState.communaute.nom)
                              ],
                              mouseenter: [
                                (e) => e.currentTarget.style.backgroundColor = "#d32f2f"
                              ],
                              mouseleave: [
                                (e) => e.currentTarget.style.backgroundColor = "#f44336"
                              ]
                            },
                            children: ["✕"]
                          }
                        ]
                      },
                      {
                        tag: "div",
                        attributes: [["style", { display: "flex", alignItems: "center", gap: "15px", marginBottom: "15px" }]],
                        children: [
                          {
                            tag: "span",
                            attributes: [["style", { 
                              backgroundColor: "#e3f2fd", 
                              color: "#1976d2", 
                              padding: "6px 12px", 
                              borderRadius: "16px", 
                              fontSize: "14px",
                              fontWeight: "bold"
                            }]],
                            children: [communauteState.communaute.categorie?.nom || 'Sans catégorie']
                          },
                          {
                            tag: "span",
                            attributes: [["style", { 
                              backgroundColor: "#e8f5e8", 
                              color: "#2e7d32", 
                              padding: "6px 12px", 
                              borderRadius: "16px", 
                              fontSize: "14px",
                              fontWeight: "bold"
                            }]],
                            children: [`${communauteState.memberCount || 0} membre(s)`]
                          }
                        ]
                      }
                    ]
                  }
                ]
              },
              {
                tag: "p",
                attributes: [["style", { 
                  color: "#666", 
                  fontSize: "16px",
                  lineHeight: "1.5",
                  margin: "0 0 20px 0"
                }]],
                children: [communauteState.communaute.description || "Aucune description disponible"]
              },
              // Bouton d'inscription à la communauté
              {
                tag: "div",
                attributes: [["style", { 
                  display: "flex", 
                  justifyContent: "center",
                  alignItems: "center",
                  margin: "20px 0",
                  padding: "20px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "8px",
                  border: "1px solid #e9ecef"
                }]],
                children: [
                  {
                    tag: "div",
                    attributes: [["style", { 
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "10px"
                    }]],
                    children: [
                      {
                        tag: "div",
                        attributes: [["style", { 
                          fontSize: "14px",
                          color: "#666",
                          textAlign: "center"
                        }]],
                        children: [`${communauteState.memberCount || 0} membre(s) inscrit(s)`]
                      },
                      {
                        tag: "button",
                        attributes: [
                          ["type", "button"],
                          ["style", {
                            backgroundColor: (communauteState.isSubscribed || false) ? "#ccc" : 
                              (communauteState.communaute.nombre_max_membres && 
                               (communauteState.memberCount || 0) >= communauteState.communaute.nombre_max_membres ? "#ff9800" : "#4730dc"),
                            color: (communauteState.isSubscribed || false) ? "#333" : "white",
                            border: "none",
                            borderRadius: "4px",
                            padding: "14px 28px",
                            fontSize: "16px",
                            cursor: (communauteState.loadingSubscription || false) ? "not-allowed" : "pointer",
                            opacity: (communauteState.loadingSubscription || false) ? "0.6" : "1",
                            minWidth: "150px",
                            transition: "all 0.2s ease",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px"
                          }]
                        ],
                        events: {
                          click: [
                            () => {
                              if (communauteState.loadingSubscription) return;
                              
                              if (communauteState.isSubscribed) {
                                window.handleLeaveCommunaute(communauteState.communaute.id);
                              } else {
                                window.handleJoinCommunaute(communauteState.communaute.id);
                              }
                            }
                          ]
                        },
                        children: [
                          (communauteState.loadingSubscription || false) ? "..." : 
                          (communauteState.isSubscribed || false) ? "Se désinscrire" : 
                          (communauteState.communaute.nombre_max_membres && 
                           (communauteState.memberCount || 0) >= communauteState.communaute.nombre_max_membres ? "Complet" : "+ Rejoindre")
                        ]
                      }
                    ]
                  }
                ]
              },
              {
                tag: "div",
                attributes: [["style", { 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center",
                  fontSize: "14px",
                  color: "#888",
                  borderTop: "1px solid #eee",
                  paddingTop: "15px"
                }]],
                children: [
                  {
                    tag: "span",
                    children: [
                      `Créé par ${communauteState.communaute.utilisateur ? 
                        `${communauteState.communaute.utilisateur.prenom} ${communauteState.communaute.utilisateur.nom}` : 
                        'Créateur inconnu'}`
                    ]
                  },
                  {
                    tag: "span",
                    children: [new Date(communauteState.communaute.date_creation).toLocaleDateString('fr-FR')]
                  }
                ]
              }
            ]
          },

          // Section des événements
          {
            tag: "section",
            children: [
              {
                tag: "h2",
                attributes: [["style", { 
                  color: "#333", 
                  borderBottom: "2px solid #4730dc", 
                  paddingBottom: "10px",
                  marginBottom: "20px"
                }]],
                children: [`Événements (${communauteState.communaute.evenement?.length || 0})`]
              },
              {
                tag: "div",
                children: communauteState.communaute.evenement && communauteState.communaute.evenement.length > 0 ? 
                  communauteState.communaute.evenement.map(event => EventCard({ event })) :
                  [{
                    tag: "div",
                    attributes: [["style", { 
                      textAlign: "center", 
                      color: "#666", 
                      padding: "40px",
                      backgroundColor: "white",
                      borderRadius: "8px",
                    }]],
                    children: [
                      {
                        tag: "p",
                        attributes: [["style", { fontSize: "18px", margin: "0 0 10px 0" }]],
                        children: ["Aucun événement prévu"]
                      },
                      {
                        tag: "p",
                        attributes: [["style", { fontSize: "14px", margin: "0" }]],
                        children: ["Cette communauté n'a pas encore organisé d'événements."]
                      }
                    ]
                  }]
              }
            ]
          }
        ]
      } : {
        tag: "div",
        attributes: [["style", {
          textAlign: "center",
          padding: "50px",
          backgroundColor: "white",
          borderRadius: "8px"
        }]],
        children: [
          {
            tag: "p",
            attributes: [["style", { fontSize: "18px", color: "#666" }]],
            children: ["Communauté non trouvée"]
          }
        ]
      }
    ]
  };
}
