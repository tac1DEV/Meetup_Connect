import supabase from "../config.js";

// Service pour gérer les opérations liées aux catégories
class CategorieService {
	// Récupérer toutes les catégories
	async getCategories() {
		try {
			return await supabase.getCategories();
		} catch (error) {
			console.error("Erreur lors du chargement des catégories:", error);
			throw new Error(`Impossible de charger les catégories: ${error.message}`);
		}
	}

	// Récupérer une catégorie par son ID
	async getCategorieById(categorieId) {
		try {
			if (!categorieId) {
				throw new Error("ID de catégorie requis");
			}
			return await supabase.getCategorieById(categorieId);
		} catch (error) {
			console.error("Erreur lors du chargement de la catégorie:", error);
			throw new Error(`Impossible de charger la catégorie: ${error.message}`);
		}
	}

	// Créer une nouvelle catégorie
	async createCategorie(categorieData) {
		try {
			this._validateCategorieData(categorieData);
			return await supabase.createCategorie(categorieData);
		} catch (error) {
			console.error("Erreur lors de la création de la catégorie:", error);
			throw error;
		}
	}

	// Valider les données d'une catégorie
	_validateCategorieData(data) {
		if (!data.nom || data.nom.trim().length < 2) {
			throw new Error(
				"Le nom de la catégorie doit contenir au moins 2 caractères"
			);
		}
	}
}

export default new CategorieService();
