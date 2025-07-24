import supabase from "../../config.js";

// Service pour gérer les opérations liées aux communautés
class CommunauteService {
	// Récupérer toutes les communautés avec pagination
	async getCommunautes(limit = 6, offset = 0) {
		try {
			return await supabase.getCommunautes(limit, offset);
		} catch (error) {
			console.error("Erreur lors du chargement des communautés:", error);
			throw new Error(
				`Impossible de charger les communautés: ${error.message}`
			);
		}
	}

	// Récupérer une communauté par son ID
	async getCommunauteById(communauteId) {
		try {
			if (!communauteId) {
				throw new Error("ID de communauté requis");
			}
			return await supabase.getCommunauteById(communauteId);
		} catch (error) {
			console.error("Erreur lors du chargement de la communauté:", error);
			throw new Error(`Impossible de charger la communauté: ${error.message}`);
		}
	}

	// Créer une nouvelle communauté
	async createCommunaute(communauteData) {
		try {
			this._validateCommunauteData(communauteData);

			// Ajouter l'utilisateur actuel comme créateur si non spécifié
			if (!communauteData.id_createur) {
				communauteData.id_createur = window.AuthUtils
					? window.AuthUtils.getCurrentUserId()
					: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
			}

			return await supabase.createCommunaute(communauteData);
		} catch (error) {
			console.error("Erreur lors de la création de la communauté:", error);
			throw error;
		}
	}

	// Supprimer une communauté
	async deleteCommunaute(communauteId, preserveEvents = true) {
		try {
			if (!communauteId) {
				throw new Error("ID de communauté requis");
			}
			return await supabase.deleteCommunaute(communauteId, preserveEvents);
		} catch (error) {
			console.error("Erreur lors de la suppression de la communauté:", error);
			throw new Error(
				`Impossible de supprimer la communauté: ${error.message}`
			);
		}
	}

	// Compter les événements d'une communauté
	async countEvenementsByCommunaute(communauteId) {
		try {
			return await supabase.countEvenementsByCommunaute(communauteId);
		} catch (error) {
			console.error("Erreur lors du comptage des événements:", error);
			return 0;
		}
	}

	// S'inscrire à une communauté
	async joinCommunaute(communauteId, userId = null) {
		try {
			if (!communauteId) {
				throw new Error("ID de communauté requis");
			}

			// Si l'ID utilisateur n'est pas fourni, utiliser l'utilisateur actuel
			if (!userId) {
				if (window.AuthUtils && window.AuthUtils.getCurrentUserId) {
					userId = window.AuthUtils.getCurrentUserId();
				} else {
					throw new Error("ID utilisateur requis - utilisateur non connecté");
				}
			}

			if (!userId) {
				throw new Error("ID utilisateur requis - utilisateur non connecté");
			}

			return await supabase.joinCommunaute(communauteId, userId);
		} catch (error) {
			console.error("Erreur lors de l'inscription à la communauté:", error);
			throw error;
		}
	}

	// Quiter une communauté
	async leaveCommunaute(communauteId, userId = null) {
		try {
			if (!communauteId) {
				throw new Error("ID de communauté requis");
			}

			// Si l'ID utilisateur n'est pas fourni, utiliser l'utilisateur actuel
			if (!userId) {
				if (window.AuthUtils && window.AuthUtils.getCurrentUserId) {
					userId = window.AuthUtils.getCurrentUserId();
				} else {
					throw new Error("ID utilisateur requis - utilisateur non connecté");
				}
			}

			if (!userId) {
				throw new Error("ID utilisateur requis - utilisateur non connecté");
			}

			return await supabase.leaveCommunaute(communauteId, userId);
		} catch (error) {
			console.error(
				"Erreur lors de la désinscription de la communauté:",
				error
			);
			throw error;
		}
	}

	// Vérifier si un utilisateur est inscrit à une communauté
	async isUserSubscribed(communauteId, userId = null) {
		try {
			if (!communauteId) {
				return false;
			}

			// Si l'ID utilisateur n'est pas fourni, utiliser l'utilisateur actuel
			if (!userId) {
				if (window.AuthUtils && window.AuthUtils.getCurrentUserId) {
					userId = window.AuthUtils.getCurrentUserId();
				} else {
					return false; // Pas d'utilisateur connecté = pas inscrit
				}
			}

			if (!userId) {
				return false;
			}

			return await supabase.isUserSubscribedToCommunaute(communauteId, userId);
		} catch (error) {
			console.error("Erreur lors de la vérification d'inscription:", error);
			return false;
		}
	}

	// Obtenir les membres d'une communauté
	async getCommunauteMembers(communauteId) {
		try {
			if (!communauteId) {
				throw new Error("ID de communauté requis");
			}
			return await supabase.getCommunauteMembers(communauteId);
		} catch (error) {
			console.error("Erreur lors du chargement des membres:", error);
			return [];
		}
	}

	// Mettre à jour une communauté
	async updateCommunaute(communauteId, communauteData) {
		try {
			if (!communauteId) {
				throw new Error("ID de communauté requis");
			}

			console.log("CommunauteService.updateCommunaute - ID:", communauteId);
			console.log("CommunauteService.updateCommunaute - Data:", communauteData);

			// Valider les données partiellement (seuls les champs fournis)
			this._validatePartialCommunauteData(communauteData);

			const result = await supabase.updateCommunaute(
				communauteId,
				communauteData
			);
			console.log("CommunauteService.updateCommunaute - Résultat:", result);

			return result;
		} catch (error) {
			console.error("Erreur lors de la mise à jour de la communauté:", error);
			throw error;
		}
	}

	// Mettre à jour l'image d'une communauté
	async updateCommunityImage(communauteId, imageUrl) {
		try {
			if (!communauteId) {
				throw new Error("ID de communauté requis");
			}

			return await supabase.updateCommunaute(communauteId, { image: imageUrl });
		} catch (error) {
			console.error("Erreur lors de la mise à jour de l'image:", error);
			throw new Error(`Impossible de mettre à jour l'image: ${error.message}`);
		}
	}

	// Supprimer l'image d'une communauté
	async removeCommunityImage(communauteId) {
		try {
			if (!communauteId) {
				throw new Error("ID de communauté requis");
			}

			return await supabase.updateCommunaute(communauteId, { image: null });
		} catch (error) {
			console.error("Erreur lors de la suppression de l'image:", error);
			throw new Error(`Impossible de supprimer l'image: ${error.message}`);
		}
	}

	// Valider partiellement les données d'une communauté (pour les mises à jour)
	_validatePartialCommunauteData(data) {
		// Valider seulement les champs fournis
		if (data.nom !== undefined && (!data.nom || data.nom.trim().length < 3)) {
			throw new Error("Le nom doit contenir au moins 3 caractères");
		}

		if (
			data.description !== undefined &&
			(!data.description || data.description.trim().length < 10)
		) {
			throw new Error("La description doit contenir au moins 10 caractères");
		}

		if (data.id_categorie !== undefined && !data.id_categorie) {
			throw new Error("La catégorie est obligatoire");
		}

		if (
			data.nombre_max_membres !== undefined &&
			data.nombre_max_membres !== "" &&
			data.nombre_max_membres !== null
		) {
			const nombreMax = parseInt(data.nombre_max_membres);
			if (isNaN(nombreMax) || nombreMax < 1) {
				throw new Error(
					"Le nombre maximal de membres doit être un nombre positif"
				);
			}
		}

		// Valider l'URL de l'image si fournie
		if (data.image !== undefined && data.image !== null && data.image !== "") {
			try {
				new URL(data.image);
			} catch {
				throw new Error("URL d'image invalide");
			}
		}
	}

	// Valider les données d'une communauté
	_validateCommunauteData(data) {
		if (!data.nom || data.nom.trim().length < 3) {
			throw new Error("Le nom doit contenir au moins 3 caractères");
		}

		if (!data.description || data.description.trim().length < 10) {
			throw new Error("La description doit contenir au moins 10 caractères");
		}

		if (!data.id_categorie) {
			throw new Error("La catégorie est obligatoire");
		}

		if (data.nombre_max_membres && data.nombre_max_membres !== "") {
			const nombreMax = parseInt(data.nombre_max_membres);
			if (isNaN(nombreMax) || nombreMax < 1) {
				throw new Error(
					"Le nombre maximal de membres doit être un nombre positif"
				);
			}
		}

		// Valider l'URL de l'image si fournie
		if (data.image) {
			try {
				new URL(data.image);
			} catch {
				throw new Error("URL d'image invalide");
			}
		}
	}
}

export default new CommunauteService();
