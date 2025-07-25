import { BrowserLink as Link } from "../components/BrowserRouter.js";
import CommunauteService from "../services/CommunauteService.js";
import CategorieService from "../services/CategorieService.js";
import StateService from "../services/StateService.js";
import {
	ErrorHandler,
	UIUtils,
	DateUtils,
	NavigationUtils,
} from "../utils/index.js";
import {
	Button,
	Card,
	LoadingSpinner,
	Badge,
	CommunityJoinButton,
} from "../components/UIComponents.js";
import { SupabaseImageUploader } from "../components/SupabaseImageUploader.js";
import { getCommunityImageUrl } from "../utils/ImageUtils.js";
import { createCommunityCardImage } from "../utils/CommunityImageUtils.js";
import createElement from "../lib/createElement.js";
import generateStructure from "../lib/generateStructure.js";
import Layout from "../components/Layout.js";

// Charger les styles pour la création de communauté
function loadCreateCommunityStyles() {
	if (!document.getElementById("create-community-styles")) {
		const link = document.createElement("link");
		link.id = "create-community-styles";
		link.rel = "stylesheet";
		link.href = "/web_api/styles/create-community.css";
		document.head.appendChild(link);
	}
}

// Initialiser le système de stockage Supabase
async function initializeStorage() {
	try {
		const { initializeStorageSystem } = await import("../storage-init.js");
		await initializeStorageSystem();
	} catch (error) {
		console.warn("Erreur lors de l'initialisation du stockage:", error);
	}
}

// Charger les styles et initialiser le stockage au chargement du module
loadCreateCommunityStyles();
initializeStorage();

// Initialisation de l'état global
StateService.setState("communautes", {
	communautes: [],
	categories: [],
	loading: true,
	error: null,
	subscriptions: {}, // État des inscriptions pour chaque communauté
	loadingSubscriptions: {}, // État du chargement des inscriptions
	selectedCategoryId: null, // Catégorie sélectionnée pour le filtrage
});

// Fonction pour charger les données depuis les services
export async function loadCommunautesData() {
	try {
		StateService.updateState("communautes", { loading: true, error: null });

		// Chargement parallèle des données via les services
		const [communautes, categories] = await Promise.all([
			CommunauteService.getCommunautes(6),
			CategorieService.getCategories(),
		]);

		// Récupérer le nombre de membres pour chaque communauté
		const communautesWithMemberCount = await Promise.all(
			communautes.map(async (communaute) => {
				try {
					const members = await CommunauteService.getCommunauteMembers(
						communaute.id
					);
					return {
						...communaute,
						memberCount: members.length,
					};
				} catch (error) {
					console.warn(
						`Erreur lors du chargement des membres pour la communauté ${communaute.id}:`,
						error
					);
					return {
						...communaute,
						memberCount: 0,
					};
				}
			})
		);

		StateService.updateState("communautes", {
			communautes: communautesWithMemberCount,
			categories,
			loading: false,
		});

		// Rafraîchir l'affichage seulement si on est sur la page des communautés
		const currentPath = window.location.pathname;
		const isCommunautesPage =
			currentPath === "/web_api/" ||
			currentPath === "/web_api/communautes" ||
			currentPath === "/web_api";

		if (isCommunautesPage) {
			renderCommunautesPage();
		}

		return { communautes, categories };
	} catch (error) {
		ErrorHandler.logError(error, "Communautes.loadCommunautesData");
		StateService.updateState("communautes", {
			loading: false,
			error: error.message,
		});

		const currentPath = window.location.pathname;
		const isCommunautesPage =
			currentPath === "/web_api/" ||
			currentPath === "/web_api/communautes" ||
			currentPath === "/web_api";

		if (isCommunautesPage) {
			await renderCommunautesPage();
			UIUtils.showToast(ErrorHandler.formatUserMessage(error), "error");
		}

		throw error;
	}
}

// Fonction pour gérer l'inscription à une communauté
window.handleJoinCommunauteFromHome = async function (communauteId) {
	try {
		// Obtenir l'ID utilisateur (utilisateur existant en base)
		const userId = window.AuthUtils
			? window.AuthUtils.getCurrentUserId()
			: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

		// Marquer comme en cours de chargement
		const currentState = StateService.getState("communautes");
		StateService.updateState("communautes", {
			loadingSubscriptions: {
				...currentState.loadingSubscriptions,
				[communauteId]: true,
			},
		});

		// Rafraîchir l'affichage pour montrer le bouton de chargement
		renderCommunautesPage();

		// Faire l'inscription avec l'ID utilisateur existant
		await CommunauteService.joinCommunaute(communauteId, userId);

		// Recharger le nombre de membres pour cette communauté
		const members = await CommunauteService.getCommunauteMembers(communauteId);

		// Mettre à jour l'état avec les nouvelles données
		const updatedCommunautes = currentState.communautes.map((communaute) =>
			communaute.id === communauteId
				? { ...communaute, memberCount: members.length }
				: communaute
		);

		// Mettre à jour l'état
		StateService.updateState("communautes", {
			communautes: updatedCommunautes,
			subscriptions: {
				...currentState.subscriptions,
				[communauteId]: true,
			},
			loadingSubscriptions: {
				...currentState.loadingSubscriptions,
				[communauteId]: false,
			},
		});

		// Rafraîchir l'affichage
		renderCommunautesPage();

		UIUtils.showToast("Inscription à la communauté réussie !", "success");
	} catch (error) {
		ErrorHandler.logError(error, "Communautes.handleJoinCommunaute");

		// Retirer le loading
		const currentState = StateService.getState("communautes");
		StateService.updateState("communautes", {
			loadingSubscriptions: {
				...currentState.loadingSubscriptions,
				[communauteId]: false,
			},
		});

		renderCommunautesPage();
		UIUtils.showToast(`Erreur d'inscription: ${error.message}`, "error");
	}
};

// Fonction pour gérer la désinscription d'une communauté
window.handleLeaveCommunauteFromHome = async function (communauteId) {
	try {
		// Obtenir l'ID utilisateur (utilisateur existant en base)
		const userId = window.AuthUtils
			? window.AuthUtils.getCurrentUserId()
			: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

		// Marquer comme en cours de chargement
		const currentState = StateService.getState("communautes");
		StateService.updateState("communautes", {
			loadingSubscriptions: {
				...currentState.loadingSubscriptions,
				[communauteId]: true,
			},
		});

		// Rafraîchir l'affichage pour montrer le bouton de chargement
		renderCommunautesPage();

		// Faire la désinscription
		await CommunauteService.leaveCommunaute(communauteId, userId);

		// Recharger le nombre de membres pour cette communauté
		const members = await CommunauteService.getCommunauteMembers(communauteId);

		// Mettre à jour l'état avec les nouvelles données
		const updatedCommunautes = currentState.communautes.map((communaute) =>
			communaute.id === communauteId
				? { ...communaute, memberCount: members.length }
				: communaute
		);

		// Mettre à jour l'état
		StateService.updateState("communautes", {
			communautes: updatedCommunautes,
			subscriptions: {
				...currentState.subscriptions,
				[communauteId]: false,
			},
			loadingSubscriptions: {
				...currentState.loadingSubscriptions,
				[communauteId]: false,
			},
		});

		// Rafraîchir l'affichage
		renderCommunautesPage();

		UIUtils.showToast("Désinscription de la communauté réussie !", "success");
	} catch (error) {
		ErrorHandler.logError(error, "Communautes.handleLeaveCommunaute");

		// Retirer le loading
		const currentState = StateService.getState("communautes");
		StateService.updateState("communautes", {
			loadingSubscriptions: {
				...currentState.loadingSubscriptions,
				[communauteId]: false,
			},
		});

		renderCommunautesPage();
		UIUtils.showToast(`Erreur de désinscription: ${error.message}`, "error");
	}
};

// Fonction pour charger l'état d'inscription pour toutes les communautés
async function loadSubscriptionStates() {
	try {
		const state = StateService.getState("communautes");
		const subscriptions = {};
		// Obtenir l'ID utilisateur (utilisateur existant en base)
		const userId = window.AuthUtils
			? window.AuthUtils.getCurrentUserId()
			: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

		// Charger l'état d'inscription pour chaque communauté
		for (const communaute of state.communautes) {
			try {
				subscriptions[communaute.id] = await CommunauteService.isUserSubscribed(
					communaute.id,
					userId
				);
			} catch (error) {
				console.warn(
					`Erreur vérification inscription communauté ${communaute.id}:`,
					error
				);
				subscriptions[communaute.id] = false;
			}
		}

		// Mettre à jour l'état
		StateService.updateState("communautes", { subscriptions });

		// Rafraîchir l'affichage
		renderCommunautesPage();
	} catch (error) {
		console.error("Erreur chargement états d'inscription:", error);
	}
}

// Fonction pour filtrer les communautés par catégorie
async function filterCommunautesByCategory(categoryId) {
	const currentState = StateService.getState("communautes");
	StateService.updateState("communautes", {
		selectedCategoryId: categoryId,
	});
	await renderCommunautesPage();
}

// Fonction pour obtenir les communautés filtrées
function getFilteredCommunautes() {
	const state = StateService.getState("communautes");
	if (!state.selectedCategoryId) {
		return state.communautes; // Retourner toutes les communautés si aucun filtre
	}
	return state.communautes.filter(
		(communaute) => communaute.id_categorie === state.selectedCategoryId
	);
}

// Fonction interne pour charger les données (pour la compatibilité)
async function loadData() {
	console.log("Chargement des données Communautes...");
	const result = await loadCommunautesData();
	// Charger également les états d'inscription
	console.log("Chargement des états d'inscription...");
	setTimeout(() => loadSubscriptionStates(), 500);
	UIUtils.showToast("Données chargées avec succès", "success");
	return result;
}

// Fonction pour créer une nouvelle communauté
async function createCommunaute(formData, imageUrl = null) {
	try {
		const submitButton = document.querySelector(
			'#createCommunauteForm button[type="submit"]'
		);
		UIUtils.setButtonLoading(submitButton, true, "Création...");

		try {
			// Ajouter l'URL de l'image si elle existe
			if (imageUrl) {
				formData.image = imageUrl;
			}
			// Si aucune image n'est uploadée, on laisse le champ vide
			// L'image par défaut sera gérée côté affichage via ImageUtils

			// Créer la communauté via le service
			const nouvelleCommunaute = await CommunauteService.createCommunaute(
				formData
			);

			console.log("Communautes - Communauté créée:", nouvelleCommunaute);

			// Vérifier que la communauté a été créée correctement
			if (!nouvelleCommunaute) {
				throw new Error("Erreur lors de la création de la communauté");
			}

			// Ajouter la nouvelle communauté à l'état local
			const currentState = StateService.getState("communautes");
			StateService.updateState("communautes", {
				communautes: [nouvelleCommunaute, ...currentState.communautes],
			});

			// Rafraîchir l'affichage
			renderCommunautesPage();

			// Message de succès avec mention de l'image
			const imageStatus = imageUrl
				? "avec image personnalisée"
				: "avec image par défaut";
			const nomCommunaute = nouvelleCommunaute.nom || "la communauté";
			UIUtils.showToast(
				`La communauté "${nomCommunaute}" a été créée avec succès ${imageStatus} !`,
				"success"
			);
		} finally {
			// Restaurer le bouton
			UIUtils.setButtonLoading(submitButton, false);
		}
	} catch (error) {
		ErrorHandler.logError(error, "Communautes.createCommunaute");
		UIUtils.showToast(ErrorHandler.formatUserMessage(error), "error");
	}
}

// Fonction pour afficher le formulaire de création
function showCreateForm() {
	// Vérifier que les catégories sont chargées
	const state = StateService.getState("communautes");
	if (state.categories.length === 0) {
		UIUtils.showToast(
			"Les catégories ne sont pas encore chargées. Veuillez attendre le chargement complet de la page ou cliquer sur 'Actualiser'.",
			"error"
		);
		return;
	}

	// Variable pour stocker l'URL de l'image uploadée
	let uploadedImageUrl = null;

	const modal = UIUtils.createModal(
		"Créer une nouvelle communauté",
		`
      <form id="createCommunauteForm">
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 8px; font-weight: bold;">Image de la communauté (optionnel)</label>
          
          <div id="imageUploaderContainer"></div>
          <small style="color: #666; font-size: 12px; display: block; margin-top: 5px;">
            Ajoutez une image pour rendre votre communauté plus attractive. JPG, PNG, GIF, WEBP (max 5MB)
            <br><span style="color: #10b981; font-weight: 500;">� Stockage permanent avec Supabase Storage</span>
          </small>
        </div>

        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold;">Nom de la communauté *</label>
          <input type="text" id="nom" name="nom" required 
                 style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;"
                 placeholder="Ex: Développeurs JavaScript Paris">
        </div>
        
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold;">Description *</label>
          <textarea id="description" name="description" required rows="4"
                    style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; resize: vertical;"
                    placeholder="Décrivez votre communauté, ses objectifs et activités..."></textarea>
        </div>
        
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold;">Catégorie *</label>
          <select id="id_categorie" name="id_categorie" required
                  style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
            <option value="">Sélectionner une catégorie</option>
            ${state.categories
							.map((cat) => `<option value="${cat.id}">${cat.nom}</option>`)
							.join("")}
          </select>
        </div>
        
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold;">Nombre maximal de membres (optionnel)</label>
          <input type="number" id="nombre_max_membres" name="nombre_max_membres" min="1" max="10000"
                 style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;"
                 placeholder="Ex: 50 (laissez vide pour aucune limite)">
          <small style="color: #666; font-size: 12px;">Si vous ne définissez pas de limite, n'importe qui pourra rejoindre votre communauté</small>
        </div>
        
        <div style="display: flex; gap: 10px; justify-content: flex-end;">
          <button type="button" onclick="this.closest('.modal').remove()" 
                  style="padding: 10px 20px; background: #ccc; color: #333; border: none; border-radius: 4px; cursor: pointer;">
            Annuler
          </button>
          <button type="submit" 
                  style="padding: 10px 20px; background: #4730DC; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Créer
          </button>
        </div>
      </form>
    `
	);

	// Fonction pour créer l'uploader Supabase
	function createUploader() {
		const container = document.getElementById("imageUploaderContainer");
		if (!container) return;

		// Vider le container
		container.innerHTML = "";

		try {
			const uploader = SupabaseImageUploader({
				onImageUploaded: (imageUrl, result) => {
					uploadedImageUrl = imageUrl;
					console.log("Image uploadée avec Supabase Storage:", imageUrl);
					if (result && result.notice) {
						console.info("Info:", result.notice);
					}
				},
				className: "create-community-uploader",
				bucketName: "community-images",
			});

			container.appendChild(uploader);
			console.log("Composant Supabase Storage ajouté au formulaire");
		} catch (error) {
			console.error("Erreur lors de l'ajout de l'uploader Supabase:", error);
			const errorDiv = createElement({
				tag: "div",
				attributes: [
					[
						"style",
						{
							padding: "20px",
							background: "#ffebee",
							border: "1px solid #f44336",
							borderRadius: "4px",
							color: "#d32f2f",
						},
					],
				],
				children: [
					`Erreur lors du chargement de Supabase Storage: ${error.message}`,
					createElement({ tag: "br" }),
					createElement({ tag: "br" }),
					createElement({
						tag: "strong",
						children: ["Configuration requise :"],
					}),
					createElement({ tag: "br" }),
					'1. Créer le bucket "community-images" dans le dashboard Supabase',
					createElement({ tag: "br" }),
					"2. Configurer les politiques RLS pour l'upload public",
					createElement({ tag: "br" }),
					"3. Consulter le guide SUPABASE_BUCKET_SETUP.md",
				],
			});
			container.appendChild(errorDiv);
		}
	}

	// Initialiser l'uploader Supabase
	setTimeout(() => {
		createUploader();
	}, 100);

	// Gérer la soumission du formulaire
	document.getElementById("createCommunauteForm").onsubmit = async (e) => {
		e.preventDefault();

		const formData = {
			nom: document.getElementById("nom").value,
			description: document.getElementById("description").value,
			id_categorie: document.getElementById("id_categorie").value,
			nombre_max_membres: document.getElementById("nombre_max_membres").value,
		};

		await createCommunaute(formData, uploadedImageUrl);
		modal.remove();
	};

	// Focus sur le premier champ
	setTimeout(() => document.getElementById("nom").focus(), 200);
}

// Fonction pour éditer une communauté
async function editCommunaute(communaute) {
	try {
		// Vérifier que les catégories sont chargées
		const state = StateService.getState("communautes");
		if (state.categories.length === 0) {
			UIUtils.showToast(
				"Les catégories ne sont pas encore chargées. Veuillez attendre le chargement complet de la page.",
				"error"
			);
			return;
		}

		// Variable pour stocker l'URL de l'image uploadée
		let uploadedImageUrl = communaute.image || null;

		const modal = UIUtils.createModal(
			`Éditer la communauté "${communaute.nom}"`,
			`
        <form id="editCommunauteForm">
          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; font-weight: bold;">Image de la communauté (optionnel)</label>
            
            <div id="editImageUploaderContainer"></div>
            <small style="color: #666; font-size: 12px; display: block; margin-top: 5px;">
              Changez l'image de votre communauté. JPG, PNG, GIF, WEBP (max 5MB)
              <br><span style="color: #10b981; font-weight: 500;">Stockage permanent avec Supabase Storage</span>
            </small>
            ${
							communaute.image
								? `
              <div style="margin-top: 10px; padding: 10px; background: #f0f8ff; border-radius: 4px; border: 1px solid #4730DC;">
                <strong>Image actuelle :</strong><br>
                <img src="${communaute.image}" alt="Image actuelle" style="max-width: 100px; max-height: 100px; border-radius: 4px; margin-top: 5px;">
              </div>
            `
								: ""
						}
          </div>

          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Nom de la communauté *</label>
            <input type="text" id="editNom" name="nom" required 
                   value="${communaute.nom || ""}"
                   style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;"
                   placeholder="Ex: Développeurs JavaScript Paris">
          </div>
          
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Description *</label>
            <textarea id="editDescription" name="description" required rows="4"
                      style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; resize: vertical;"
                      placeholder="Décrivez votre communauté, ses objectifs et activités...">${
												communaute.description || ""
											}</textarea>
          </div>
          
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Catégorie *</label>
            <select id="editIdCategorie" name="id_categorie" required
                    style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
              <option value="">Sélectionner une catégorie</option>
              ${state.categories
								.map(
									(cat) =>
										`<option value="${cat.id}" ${
											cat.id === communaute.id_categorie ? "selected" : ""
										}>${cat.nom}</option>`
								)
								.join("")}
            </select>
          </div>
          
          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Nombre maximal de membres (optionnel)</label>
            <input type="number" id="editNombreMaxMembres" name="nombre_max_membres" min="1" max="10000"
                   value="${communaute.nombre_max_membres || ""}"
                   style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;"
                   placeholder="Ex: 50 (laissez vide pour aucune limite)">
            <small style="color: #666; font-size: 12px;">Si vous ne définissez pas de limite, n'importe qui pourra rejoindre votre communauté</small>
          </div>
          
          <div style="display: flex; gap: 10px; justify-content: flex-end;">
            <button type="button" onclick="this.closest('.modal').remove()" 
                    style="padding: 10px 20px; background: #ccc; color: #333; border: none; border-radius: 4px; cursor: pointer;">
              Annuler
            </button>
            <button type="submit" 
                    style="padding: 10px 20px; background: #4730DC; color: white; border: none; border-radius: 4px; cursor: pointer;">
              Sauvegarder
            </button>
          </div>
        </form>
      `
		);

		// Fonction pour créer l'uploader Supabase
		function createEditUploader() {
			const container = document.getElementById("editImageUploaderContainer");
			if (!container) return;

			// Vider le container
			container.innerHTML = "";

			try {
				const uploader = SupabaseImageUploader({
					onImageUploaded: (imageUrl, result) => {
						uploadedImageUrl = imageUrl;
						console.log("Image mise à jour avec Supabase Storage:", imageUrl);
						if (result && result.notice) {
							console.info("Info:", result.notice);
						}
					},
					className: "edit-community-uploader",
					bucketName: "community-images",
				});

				container.appendChild(uploader);
				console.log(
					"Composant Supabase Storage ajouté au formulaire d'édition"
				);
			} catch (error) {
				console.error("Erreur lors de l'ajout de l'uploader Supabase:", error);
				const errorDiv = createElement({
					tag: "div",
					attributes: [
						[
							"style",
							{
								padding: "20px",
								background: "#ffebee",
								border: "1px solid #f44336",
								borderRadius: "4px",
								color: "#d32f2f",
							},
						],
					],
					children: [
						`Erreur lors du chargement de Supabase Storage: ${error.message}`,
					],
				});
				container.appendChild(errorDiv);
			}
		}

		// Initialiser l'uploader Supabase
		setTimeout(() => {
			createEditUploader();
		}, 100);

		// Gérer la soumission du formulaire d'édition
		document.getElementById("editCommunauteForm").onsubmit = async (e) => {
			e.preventDefault();

			const formData = {
				nom: document.getElementById("editNom").value,
				description: document.getElementById("editDescription").value,
				id_categorie: document.getElementById("editIdCategorie").value,
				nombre_max_membres: document.getElementById("editNombreMaxMembres")
					.value,
			};

			// Ajouter l'image si elle a été modifiée
			if (uploadedImageUrl && uploadedImageUrl !== communaute.image) {
				formData.image = uploadedImageUrl;
			}

			await updateCommunaute(communaute.id, formData);
			modal.remove();
		};

		// Focus sur le premier champ
		setTimeout(() => document.getElementById("editNom").focus(), 200);
	} catch (error) {
		ErrorHandler.logError(error, "Communautes.editCommunaute");
		UIUtils.showToast(
			`Erreur lors de l'ouverture du formulaire d'édition: ${error.message}`,
			"error"
		);
	}
}

// Fonction pour mettre à jour une communauté
async function updateCommunaute(communauteId, formData) {
	try {
		const submitButton = document.querySelector(
			'#editCommunauteForm button[type="submit"]'
		);
		UIUtils.setButtonLoading(submitButton, true, "Mise à jour...");

		try {
			console.log("Mise à jour communauté - ID:", communauteId);
			console.log("Données à mettre à jour:", formData);

			// Nettoyer les données avant envoi
			const cleanedData = {};
			Object.keys(formData).forEach((key) => {
				const value = formData[key];
				if (value !== undefined && value !== null && value !== "") {
					// Convertir nombre_max_membres en entier si fourni
					if (key === "nombre_max_membres" && value) {
						cleanedData[key] = parseInt(value);
					} else {
						cleanedData[key] = value;
					}
				}
			});

			console.log("Données nettoyées:", cleanedData);

			// Mettre à jour la communauté via le service
			const communauteMiseAJour = await CommunauteService.updateCommunaute(
				communauteId,
				cleanedData
			);

			console.log("Communautes - Communauté mise à jour:", communauteMiseAJour);

			// Vérifier que la communauté a été mise à jour correctement
			if (!communauteMiseAJour) {
				throw new Error(
					"Aucune donnée retournée par le service de mise à jour"
				);
			}

			// Mettre à jour la communauté dans l'état local
			const currentState = StateService.getState("communautes");
			const updatedCommunautes = currentState.communautes.map((communaute) =>
				communaute.id === communauteId
					? { ...communaute, ...communauteMiseAJour }
					: communaute
			);

			StateService.updateState("communautes", {
				communautes: updatedCommunautes,
			});

			// Rafraîchir l'affichage
			renderCommunautesPage();

			// Message de succès
			const nomCommunaute = communauteMiseAJour.nom || "la communauté";
			UIUtils.showToast(
				`La communauté "${nomCommunaute}" a été mise à jour avec succès !`,
				"success"
			);
		} finally {
			// Restaurer le bouton
			UIUtils.setButtonLoading(submitButton, false);
		}
	} catch (error) {
		ErrorHandler.logError(error, "Communautes.updateCommunaute");
		UIUtils.showToast(ErrorHandler.formatUserMessage(error), "error");
	}
}

// Fonction pour supprimer une communauté
async function deleteCommunaute(communauteId, communauteNom) {
	try {
		// Vérifier s'il y a des événements associés pour informer l'utilisateur
		const nombreEvenements =
			await CommunauteService.countEvenementsByCommunaute(communauteId);

		let message;
		if (nombreEvenements > 0) {
			message =
				`Êtes-vous sûr de vouloir supprimer la communauté "${communauteNom}" ?\n\n` +
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

		// Retirer la communauté de l'état local
		const currentState = StateService.getState("communautes");
		StateService.updateState("communautes", {
			communautes: currentState.communautes.filter(
				(c) => c.id !== communauteId
			),
		});

		// Rafraîchir l'affichage
		renderCommunautesPage();

		// Message de succès
		const successMsg =
			nombreEvenements > 0
				? `La communauté "${communauteNom}" a été supprimée avec succès.\n\n` +
				  `Les ${nombreEvenements} événement(s) ont été conservés dans l'historique.`
				: `La communauté "${communauteNom}" a été supprimée avec succès.`;

		UIUtils.showToast(successMsg, "success");
	} catch (error) {
		ErrorHandler.logError(error, "Communautes.deleteCommunaute");
		UIUtils.showToast(
			`Erreur lors de la suppression de la communauté: ${error.message}`,
			"error"
		);
	}
}

// Fonction pour rendre la page d'accueil
async function renderCommunautesPage() {
	const rootElement = document.getElementById("root");
	if (!rootElement) return;

	const CommunautesPageStructure = CommunautesPage();
	const newPage = await generateStructure(CommunautesPageStructure);

	if (rootElement.firstChild) {
		rootElement.replaceChild(newPage, rootElement.firstChild);
	} else {
		rootElement.appendChild(newPage);
	}
}

// Composant pour les filtres de catégories
function CategoryFilters() {
	const state = StateService.getState("communautes");

	if (state.categories.length === 0) {
		return {
			tag: "div",
			attributes: [["style", { display: "none" }]],
			children: [],
		};
	}

	return {
		tag: "div",
		attributes: [
			[
				"style",
				{
					marginBottom: "20px",
					padding: "15px",
				},
			],
		],
		children: [
			{
				tag: "h3",
				attributes: [
					[
						"style",
						{
							margin: "0 0 15px 0",
							fontSize: "16px",
							color: "#333",
						},
					],
				],
				children: ["Filtrer par catégorie"],
			},
			{
				tag: "div",
				attributes: [
					[
						"style",
						{
							display: "flex",
							flexWrap: "wrap",
							gap: "8px",
						},
					],
				],
				children: [
					// Bouton "Toutes"
					{
						tag: "button",
						attributes: [
							[
								"style",
								{
									padding: "8px 16px",
									border: "1px solid #787373",
									borderRadius: "8px",
									cursor: "pointer",
									fontSize: "14px",
									backgroundColor: !state.selectedCategoryId
										? "#787373"
										: "white",
									color: !state.selectedCategoryId ? "white" : "#787373",
									transition: "all 0.2s ease",
								},
							],
						],
						events: {
							click: [() => filterCommunautesByCategory(null)],
							mouseenter: [
								(e) => {
									if (state.selectedCategoryId) {
										e.currentTarget.style.backgroundColor = "#e3f2fd";
									}
								},
							],
							mouseleave: [
								(e) => {
									if (state.selectedCategoryId) {
										e.currentTarget.style.backgroundColor = "white";
									}
								},
							],
						},
						children: [`Toutes (${state.communautes.length})`],
					},
					// Boutons pour chaque catégorie
					...state.categories.map((category) => {
						const communautesCount = state.communautes.filter(
							(c) => c.id_categorie === category.id
						).length;
						const isSelected = state.selectedCategoryId === category.id;

						return {
							tag: "button",
							attributes: [
								[
									"style",
									{
										padding: "8px 16px",
										border: "1px solid #787373",
										borderRadius: "8px",
										cursor: "pointer",
										fontSize: "14px",
										backgroundColor: isSelected ? "#787373" : "white",
										color: isSelected ? "white" : "#787373",
										transition: "all 0.2s ease",
									},
								],
							],
							events: {
								click: [() => filterCommunautesByCategory(category.id)],
								mouseenter: [
									(e) => {
										if (!isSelected) {
											e.currentTarget.style.backgroundColor = "#e3f2fd";
										}
									},
								],
								mouseleave: [
									(e) => {
										if (!isSelected) {
											e.currentTarget.style.backgroundColor = "white";
										}
									},
								],
							},
							children: [`${category.nom} (${communautesCount})`],
						};
					}),
				],
			},
		],
	};
}

// Composant pour une carte de communauté
function CommunauteCard({ communaute }) {
	// Vérification de sécurité
	if (!communaute) {
		console.error("CommunauteCard: communaute est undefined");
		return {
			tag: "div",
			attributes: [["class", "error-card"]],
			children: ["Erreur: Communauté non trouvée"],
		};
	}

	const state = StateService.getState("communautes");
	const categorie = communaute.categorie?.nom || "Sans catégorie";
	const createur = communaute.utilisateur
		? `${communaute.utilisateur.prenom} ${communaute.utilisateur.nom}`
		: "Créateur inconnu";

	// Assurer que les états existent avec des valeurs par défaut
	const isSubscribed = state.subscriptions?.[communaute.id] || false;
	const isLoadingSubscription =
		state.loadingSubscriptions?.[communaute.id] || false;

	console.log(
		`CommunauteCard ${communaute.id}: inscrit=${isSubscribed}, loading=${isLoadingSubscription}`
	);

	// Créer le bouton d'inscription directement dans la structure
	const joinButton = {
		tag: "div",
		attributes: [
			[
				"style",
				{
					margin: "12px auto 0 auto",
					textAlign: "center",
					width: "100%",
				},
			],
		],
		children: [
			{
				tag: "button",
				attributes: [
					["type", "button"],
					[
						"style",
						{
							backgroundColor: isSubscribed
								? "#ccc"
								: communaute.nombre_max_membres &&
								  (communaute.memberCount || 0) >= communaute.nombre_max_membres
								? "#ff9800"
								: "#4730DC",
							color: isSubscribed ? "#333" : "white",
							border: "none",
							borderRadius: "12px",
							padding: "10px 20px",
							fontSize: "14px",
							cursor: isLoadingSubscription ? "not-allowed" : "pointer",
							opacity: isLoadingSubscription ? "0.6" : "1",
							minWidth: "120px",
							transition: "all 0.2s ease",
							display: "inline-flex",
							alignItems: "center",
							gap: "8px",
						},
					],
				],
				events: {
					click: [
						(e) => {
							e.stopPropagation(); // Empêche le clic de se propager à la carte
							if (isLoadingSubscription) return;

							if (isSubscribed) {
								window.handleLeaveCommunauteFromHome(communaute.id);
							} else {
								window.handleJoinCommunauteFromHome(communaute.id);
							}
						},
					],
				},
				children: [
					isLoadingSubscription
						? "..."
						: isSubscribed
						? "Quitter la communauté"
						: communaute.nombre_max_membres &&
						  (communaute.memberCount || 0) >= communaute.nombre_max_membres
						? "Complet"
						: "Rejoindre la communauté",
				],
			},
		],
	};

	return {
		tag: "div",
		attributes: [
			["class", "communaute-card"],
			[
				"style",
				{
					border: "1px solid #e1e1e1",
					borderRadius: "8px",
					margin: "16px 0",
					backgroundColor: "#fff",
					boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
					cursor: "pointer",
					transition: "transform 0.2s, box-shadow 0.2s",
					display: "flex",
					flexDirection: "column",
					height: "100%", // Permet aux cartes d'avoir la même hauteur dans la grille
				},
			],
		],
		events: {
			click: [
				(e) => {
					// Si ce n'est pas le bouton de suppression ou d'inscription qui a été cliqué
					if (!e.target.closest("button")) {
						// Naviguer vers la page communauté avec l'ID en paramètre
						NavigationUtils.goToCommunaute(communaute.id);
					}
				},
			],
			mouseenter: [
				(e) => {
					e.currentTarget.style.transform = "translateY(-2px)";
					e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
				},
			],
			mouseleave: [
				(e) => {
					e.currentTarget.style.transform = "translateY(0)";
					e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
				},
			],
		},
		children: [
			// Image de la communauté
			createCommunityCardImage(communaute),

			// Conteneur pour toutes les informations de la communauté
			{
				tag: "div",
				attributes: [
					[
						"style",
						{
							padding: "12px",
							backgroundColor: "#ffffff",
							borderRadius: "6px",
							margin: "12px 0",
							display: "flex",
							flexDirection: "column",
							flex: "1", // Prend tout l'espace disponible
						},
					],
				],
				children: [
					{
						tag: "div",
						attributes: [
							[
								"style",
								{
									display: "flex",
									justifyContent: "space-between",
									alignItems: "flex-start",
									marginBottom: "12px",
								},
							],
						],
						children: [
							{
								tag: "h3",
								attributes: [
									[
										"style",
										{ margin: "0", color: "#333", fontSize: "18px", flex: "1" },
									],
								],
								children: [communaute.nom],
							},
							{
								tag: "div",
								attributes: [
									[
										"style",
										{ display: "flex", alignItems: "center", gap: "8px" },
									],
								],
								children: [
									{
										tag: "span",
										attributes: [
											[
												"style",
												{
													backgroundColor: "#e3f2fd",
													color: "#1976d2",
													padding: "4px 8px",
													borderRadius: "12px",
													fontSize: "12px",
													fontWeight: "bold",
												},
											],
										],
										children: [categorie],
									},
									{
										tag: "button",
										attributes: [
											["title", "Éditer cette communauté"],
											[
												"style",
												{
													backgroundColor: "#ff9800",
													color: "white",
													border: "none",
													borderRadius: "4px",
													cursor: "pointer",
													padding: "4px 8px",
													fontSize: "12px",
													display: "flex",
													alignItems: "center",
													justifyContent: "center",
													marginRight: "4px",
												},
											],
										],
										events: {
											click: [
												(e) => {
													e.stopPropagation(); // Empêche le clic de se propager à la carte
													editCommunaute(communaute);
												},
											],
											mouseenter: [
												(e) =>
													(e.currentTarget.style.backgroundColor = "#f57c00"),
											],
											mouseleave: [
												(e) =>
													(e.currentTarget.style.backgroundColor = "#ff9800"),
											],
										},
										children: ["Éditer"],
									},
									{
										tag: "button",
										attributes: [
											["title", "Supprimer cette communauté"],
											[
												"style",
												{
													backgroundColor: "#f44336",
													color: "white",
													border: "none",
													borderRadius: "4px",
													cursor: "pointer",
													padding: "4px",
													fontSize: "12px",
													display: "flex",
													alignItems: "center",
													justifyContent: "center",
												},
											],
										],
										events: {
											click: [
												(e) => {
													e.stopPropagation(); // Empêche le clic de se propager à la carte
													deleteCommunaute(communaute.id, communaute.nom);
												},
											],
											mouseenter: [
												(e) =>
													(e.currentTarget.style.backgroundColor = "#d32f2f"),
											],
											mouseleave: [
												(e) =>
													(e.currentTarget.style.backgroundColor = "#f44336"),
											],
										},
										children: ["Supprimer"],
									},
								],
							},
						],
					},
					{
						tag: "p",
						attributes: [
							[
								"style",
								{
									color: "#666",
									margin: "0 0 12px 0",
									fontSize: "14px",
									lineHeight: "1.4",
								},
							],
						],
						children: [
							communaute.description || "Aucune description disponible",
						],
					},
					{
						tag: "div",
						attributes: [
							[
								"style",
								{
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									marginBottom: "12px",
									fontSize: "12px",
									color: "#888",
								},
							],
						],
						children: [
							{
								tag: "div",
								attributes: [
									[
										"style",
										{ display: "flex", flexDirection: "column", gap: "2px" },
									],
								],
								children: [
									{
										tag: "span",
										children: [`Créé par ${createur}`],
									},
									{
										tag: "span",
										children: [DateUtils.formatDate(communaute.date_creation)],
									},
								],
							},
							{
								tag: "span",
								attributes: [
									[
										"style",
										{
											backgroundColor: "#e8f5e8",
											color: "#2e7d32",
											padding: "4px 8px",
											borderRadius: "12px",
											fontSize: "12px",
											fontWeight: "bold",
										},
									],
								],
								children: [`${communaute.memberCount || 0} membre(s)`],
							},
						],
					},
					// Spacer pour pousser le bouton vers le bas
					{
						tag: "div",
						attributes: [["style", { flex: "1" }]], // Prend tout l'espace restant
						children: [],
					},
					// Bouton d'inscription
					joinButton,
				],
			},
		],
	};
}

// Composant principal de la page d'accueil
export default function CommunautesPage() {
	// Récupérer l'état actuel
	const state = StateService.getState("communautes");

	// Vérifier si on doit recharger les données (après suppression par exemple)
	const shouldReload = sessionStorage.getItem("shouldReloadCommunautesPage");
	if (shouldReload === "true") {
		sessionStorage.removeItem("shouldReloadCommunautesPage");
		console.log("Rechargement forcé des données CommunautesPage après suppression");
		setTimeout(() => loadData(), 100);
	} else {
		// Charger les données au premier rendu normal
		if (state.loading && state.communautes.length === 0) {
			setTimeout(loadData, 100);
		}
	}

	const content = [
		{
		tag: "div",
		attributes: [
			[
				"style",
				{
					fontFamily: "Arial, sans-serif",
					maxWidth: "1200px",
					margin: "0 auto",
					padding: "20px",
					backgroundColor: "#f5f5f5",
					minHeight: "100vh",
				},
			],
		],
		children: [
			// Header
			{
				tag: "header",
				attributes: [
					[
						"style",
						{
							backgroundColor: "#4730DC",
							color: "white",
							padding: "20px",
							borderRadius: "8px",
							marginBottom: "30px",
							textAlign: "center",
						},
					],
				],
				children: [
					{
						tag: "h1",
						attributes: [["style", { margin: "0", fontSize: "32px" }]],
						children: ["Bienvenue sur votre plateforme communautaire"],
					},
					{
						tag: "p",
						attributes: [
							[
								"style",
								{ margin: "10px 0 0", fontSize: "16px", opacity: "0.9" },
							],
						],
						children: [
							"Découvrez des communautés passionnantes et participez à des événements uniques",
						],
					},
				],
			},

			// Navigation
			{
				tag: "nav",
				attributes: [
					[
						"style",
						{
							display: "flex",
							gap: "10px",
							marginBottom: "30px",
							flexWrap: "wrap",
						},
					],
				],
				children: [
					{
						tag: "a",
						attributes: [
							["href", "/web_api/gallery"],
							[
								"style",
								{
									display: "inline-block",
									padding: "10px 15px",
									backgroundColor: "#ff9800",
									color: "white",
									textDecoration: "none",
									borderRadius: "5px",
									fontSize: "14px",
								},
							],
						],
						events: {
							click: [
								(e) => {
									e.preventDefault();
									window.history.pushState({}, "", `/web_api/gallery`);
									window.dispatchEvent(new Event("pushstate"));
								},
							],
						},
						children: ["Galerie"],
					},
					{
						tag: "button",
						attributes: [
							[
								"style",
								{
									padding: "10px 15px",
									backgroundColor: "#4caf50",
									color: "white",
									border: "none",
									borderRadius: "5px",
									cursor: "pointer",
									fontSize: "14px",
								},
							],
						],
						events: {
							click: [loadData],
							mouseenter: [
								(e) => (e.currentTarget.style.backgroundColor = "#45a049"),
							],
							mouseleave: [
								(e) => (e.currentTarget.style.backgroundColor = "#4caf50"),
							],
						},
						children: ["Actualiser"],
					},
					{
						tag: "button",
						attributes: [
							[
								"style",
								{
									padding: "10px 15px",
									backgroundColor: "#4730DC",
									color: "white",
									border: "none",
									borderRadius: "5px",
									cursor: "pointer",
									fontSize: "14px",
								},
							],
						],
						events: {
							click: [showCreateForm],
							mouseenter: [
								(e) => (e.currentTarget.style.backgroundColor = "#1976d2"),
							],
							mouseleave: [
								(e) => (e.currentTarget.style.backgroundColor = "#4730DC"),
							],
						},
						children: ["Créer une communauté"],
					},
				],
			},

			// Contenu principal
			state.loading
				? {
						tag: "div",
						attributes: [
							[
								"style",
								{
									textAlign: "center",
									padding: "50px",
									backgroundColor: "white",
									borderRadius: "8px",
								},
							],
						],
						children: [
							{
								tag: "p",
								attributes: [["style", { fontSize: "18px", color: "#666" }]],
								children: ["Chargement des données..."],
							},
						],
				  }
				: state.error
				? {
						tag: "div",
						attributes: [
							[
								"style",
								{
									textAlign: "center",
									padding: "50px",
									backgroundColor: "#ffebee",
									borderRadius: "8px",
									border: "1px solid #f44336",
								},
							],
						],
						children: [
							{
								tag: "p",
								attributes: [["style", { fontSize: "18px", color: "#d32f2f" }]],
								children: [`Erreur: ${state.error}`],
							},
							{
								tag: "p",
								attributes: [
									[
										"style",
										{ fontSize: "14px", color: "#666", marginTop: "10px" },
									],
								],
								children: [
									"Vérifiez votre configuration Supabase dans config.js",
								],
							},
						],
				  }
				: {
						tag: "div",
						children: [
							// Filtres de catégories
							CategoryFilters(),

							// Section Communautés
							{
								tag: "section",
								attributes: [["style", { marginBottom: "40px" }]],
								children: [
									{
										tag: "h2",
										attributes: [
											[
												"style",
												{
													color: "#333",
													paddingBottom: "10px",
													marginBottom: "20px",
												},
											],
										],
										children: [
											state.selectedCategoryId
												? `Communautés - ${
														state.categories.find(
															(c) => c.id === state.selectedCategoryId
														)?.nom || "Catégorie"
												  }`
												: "Toutes les communautés",
										],
									},
									{
										tag: "div",
										attributes: [
											[
												"style",
												{
													display: "grid",
													gridTemplateColumns:
														"repeat(auto-fit, minmax(300px, 1fr))",
													gap: "16px",
												},
											],
										],
										children: (() => {
											const filteredCommunautes = getFilteredCommunautes();
											return filteredCommunautes.length > 0
												? filteredCommunautes.map((communaute) =>
														CommunauteCard({ communaute })
												  )
												: [
														{
															tag: "p",
															attributes: [
																[
																	"style",
																	{
																		textAlign: "center",
																		color: "#666",
																		gridColumn: "1 / -1",
																		padding: "20px",
																		backgroundColor: "#f9f9f9",
																		borderRadius: "8px",
																		border: "1px solid #ddd",
																	},
																],
															],
															children: [
																state.selectedCategoryId
																	? `Aucune communauté trouvée pour cette catégorie`
																	: "Aucune communauté trouvée",
															],
														},
												  ];
										})(),
									},
								],
							},
						],
				  },
		],
	},
];

return Layout(content);
}

// Exporter les fonctions pour les tests et usage externe
export { showCreateForm, renderCommunautesPage };
