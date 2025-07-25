// Système d'initialisation du stockage Supabase
import supabase from "../config.js";

export async function initializeStorageSystem() {
	try {
		console.log("Initialisation du système de stockage...");
		
		// Vérifier la connexion à Supabase
		const testQuery = await supabase.query('communaute', { limit: 1 });
		
		console.log("Système de stockage initialisé avec succès");
		return { success: true };
	} catch (error) {
		console.error("Erreur lors de l'initialisation du stockage:", error);
		return { error: error.message };
	}
}

export default {
	initializeStorageSystem
};
