import { BrowserLink as Link } from "../components/BrowserRouter.js";
import supabase from "../config.js";
import Layout from "../components/Layout.js";

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

export default function ProfilePage() {
  const token = localStorage.getItem("sb_token");
  const user = parseJwt(token);
  console.log(user);
  
  if (!user) {
    window.location.href = "/web_api/login";
    return { tag: "div", children: ["Redirection..."] };
  }

  ProfilePage.loadUserData();
  
  const content = [
    {
      tag: "div",
      attributes: [["style", {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        backgroundColor: "#fff",
        padding: "20px",
        fontFamily: "sans-serif",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
      }]],
      children: [
        {
          tag: "div",
          attributes: [["style", {
            width: "100%",
            maxWidth: "500px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }]],
          children: [
            
            {
              tag: "div",
              attributes: [["style", {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }]],
              children: [
                { tag: "h1", attributes: [["style", {color: "#5A3FF3", fontSize: "24px", fontWeight: "bold", margin: 0}]], children: ["Mon Profil"] },
              ]
            },

            
            {
              tag: "div",
              attributes: [["style", {
                background: "#f8f9ff",
                borderRadius: "16px",
                padding: "32px",
                boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
              }]],
              children: [
                
                {
                  tag: "div",
                  attributes: [["style", {
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    marginBottom: "32px",
                  }]],
                  children: [
                    { 
                      tag: "img", 
                      attributes: [
                        ["src", "https://api.dicebear.com/7.x/identicon/svg?seed=" + encodeURIComponent(user.email)], 
                        ["alt", "Avatar"], 
                        ["style", {
                          width: "100px", 
                          height: "100px", 
                          borderRadius: "50%", 
                          border: "4px solid #5A3FF3",
                          marginBottom: "16px"
                        }]
                      ]
                    },
                    { 
                      tag: "h2", 
                      attributes: [["style", {
                        fontSize: "24px", 
                        fontWeight: "bold", 
                        color: "#333",
                        margin: "0 0 8px 0"
                      }]], 
                      children: ["Chargement..."] 
                    },
                    { 
                      tag: "p", 
                      attributes: [["style", {
                        color: "#666", 
                        fontSize: "16px",
                        margin: 0
                      }]], 
                      children: [user.email] 
                    }
                  ]
                },

                
                {
                  tag: "div",
                  attributes: [["style", {
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }]],
                  children: [
                    { tag: "h3", attributes: [["style", {color: "#5A3FF3", fontSize: "18px", fontWeight: "bold", margin: "0 0 16px 0"}]], children: ["Informations personnelles"] },
                    
                    
                    createEditableField("Nom", "nom", "Chargement..."),
                    createEditableField("Prénom", "prenom", "Chargement..."),
                    createEditableField("Pseudo", "pseudo", "Chargement..."),
                    createEditableField("Téléphone", "telephone", "Chargement..."),
                    createEditableTextAreaField("Bio", "bio", "Chargement..."),
                  ]
                },

                
                {
                  tag: "div",
                  attributes: [["style", {
                    display: "flex",
                    gap: "12px",
                    marginTop: "24px",
                  }]],
                  children: [
                    {
                      tag: "button",
                      attributes: [["style", {
                        flex: 1,
                        backgroundColor: "#5A3FF3",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        padding: "12px",
                        fontWeight: "bold",
                        cursor: "pointer",
                      }]],
                      events: {
                        click: [async function() {
                          await ProfilePage.saveUserData();
                        }]
                      },
                      children: ["Sauvegarder"]
                    },
                    {
                      tag: "button",
                      attributes: [["style", {
                        flex: 1,
                        backgroundColor: "#fff",
                        color: "#5A3FF3",
                        border: "2px solid #5A3FF3",
                        borderRadius: "8px",
                        padding: "12px",
                        fontWeight: "bold",
                        cursor: "pointer",
                      }]],
                      events: {
                        click: [function() { 
                          localStorage.removeItem("sb_token"); 
                          window.location.href = "/web_api/login"; 
                        }]
                      },
                      children: ["Se déconnecter"]
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

function createInfoField(label, value) {
  return {
    tag: "div",
    attributes: [["style", {
      display: "flex",
      flexDirection: "column",
      gap: "4px",
    }]],
    children: [
      { 
        tag: "label", 
        attributes: [["style", {
          fontSize: "14px", 
          fontWeight: "bold", 
          color: "#666"
        }]], 
        children: [label] 
      },
      { 
        tag: "div", 
        attributes: [
          ["class", "info-field"],
          ["style", {
            padding: "12px",
            backgroundColor: "#fff",
            borderRadius: "8px",
            border: "1px solid #e0e0e0",
            fontSize: "16px",
            color: "#333"
          }]
        ], 
        children: [value] 
      }
    ]
  };
}

function createEditableField(label, name, value) {
  return {
    tag: "div",
    attributes: [["style", {
      display: "flex",
      flexDirection: "column",
      gap: "4px",
    }]],
    children: [
      { 
        tag: "label", 
        attributes: [["style", {
          fontSize: "14px", 
          fontWeight: "bold", 
          color: "#666"
        }]], 
        children: [label] 
      },
      { 
        tag: "input", 
        attributes: [
          ["type", "text"],
          ["name", name],
          ["style", {
            padding: "12px",
            backgroundColor: "#fff",
            borderRadius: "8px",
            border: "1px solid #e0e0e0",
            fontSize: "16px",
            color: "#333"
          }],
          ["value", value]
        ]
      }
    ]
  };
}

function createEditableTextAreaField(label, name, value) {
  return {
    tag: "div",
    attributes: [["style", {
      display: "flex",
      flexDirection: "column",
      gap: "4px",
    }]],
    children: [
      { 
        tag: "label", 
        attributes: [["style", {
          fontSize: "14px", 
          fontWeight: "bold", 
          color: "#666"
        }]], 
        children: [label] 
      },
      { 
        tag: "textarea", 
        attributes: [
          ["name", name],
          ["style", {
            padding: "12px",
            backgroundColor: "#fff",
            borderRadius: "8px",
            border: "1px solid #e0e0e0",
            fontSize: "16px",
            color: "#333",
            minHeight: "100px",
            resize: "vertical"
          }],
          ["value", value]
        ]
      }
    ]
  };
}


ProfilePage.showToast = function(message, type = 'success') {
  
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


ProfilePage.saveUserData = async function() {
  const token = localStorage.getItem("sb_token");
  const user = parseJwt(token);
  if (!user || !user.sub) {
    ProfilePage.showToast('Erreur: utilisateur non connecté', 'error');
    return;
  }
  
  try {
    const nom = document.querySelector('input[name="nom"]').value;
    const prenom = document.querySelector('input[name="prenom"]').value;
    const pseudo = document.querySelector('input[name="pseudo"]').value;
    const telephone = document.querySelector('input[name="telephone"]').value;
    const bio = document.querySelector('textarea[name="bio"]').value;
    
    const result = await supabase.updateUtilisateur(user.sub, {
      nom, prenom, pseudo, telephone, bio
    });
    
    if (result.error) {
      ProfilePage.showToast('Erreur lors de la sauvegarde: ' + result.error, 'error');
    } else {
      ProfilePage.showToast('Profil mis à jour avec succès !', 'success');
      ProfilePage.loadUserData();
    }
  } catch (error) {
    ProfilePage.showToast('Erreur lors de la sauvegarde: ' + error.message, 'error');
  }
};


ProfilePage.loadUserData = async function() {
  const token = localStorage.getItem("sb_token");
  const user = parseJwt(token);
  
  if (user && user.sub) {
    try {
      const userData = await supabase.getUtilisateur(user.sub);
      if (userData) {
        
        const nameElement = document.querySelector('h2');
        if (nameElement) {
          nameElement.textContent = `${userData.prenom || ''} ${userData.nom || ''}`.trim() || 'Utilisateur';
        }
        
        
        const nomInput = document.querySelector('input[name="nom"]');
        const prenomInput = document.querySelector('input[name="prenom"]');
        const pseudoInput = document.querySelector('input[name="pseudo"]');
        const telephoneInput = document.querySelector('input[name="telephone"]');
        const bioTextarea = document.querySelector('textarea[name="bio"]');
        
        if (nomInput) nomInput.value = userData.nom || '';
        if (prenomInput) prenomInput.value = userData.prenom || '';
        if (pseudoInput) pseudoInput.value = userData.pseudo || '';
        if (telephoneInput) telephoneInput.value = userData.telephone || '';
        if (bioTextarea) bioTextarea.value = userData.bio || '';
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données utilisateur:', error);
    }
  }
};


ProfilePage.show = function() {
  setTimeout(() => {
    ProfilePage.loadUserData();
  }, 100);
}; 