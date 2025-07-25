const SUPABASE_URL = "https://wxfruxhckurswdcbdxwq.supabase.co";
const SUPABASE_ANON_KEY =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4ZnJ1eGhja3Vyc3dkY2JkeHdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMzM0OTksImV4cCI6MjA2NTgwOTQ5OX0.OztdaAYi3kRHhXmPwhmQCH7emQAkyYk-2R5io6M-8es";

class SupabaseClient {
	constructor(url, key) {
		this.url = url;
		this.key = key;
		this.baseURL = `${url}/rest/v1`;
	}
	// Méthode pour obtenir les communautés avec leurs catégories
	async getCommunautes(limit = 10) {
		return this.query("communaute", {
			select: `
				*,
				categorie:id_categorie(nom, description),
				utilisateur:id_createur(nom, prenom, pseudo)
			`,
			limit,
			orderBy: "created_at.desc",
		});
	}

	// Méthode pour obtenir une communauté spécifique par son ID
	async getCommunauteById(id) {
		try {
			const result = await this.query("communaute", {
				select: `
					*,
					categorie:id_categorie(nom, description),
					utilisateur:id_createur(nom, prenom, pseudo)
				`,
				where: { id: id },
			});
			return result[0] || null;
		} catch (error) {
			console.error("Erreur récupération communauté:", error);
			throw error;
		}
	}

	// Méthode pour obtenir les catégories populaires
	async getCategories() {
		try {
			return await this.query("categorie", {
				select: "*",
				orderBy: "nom.asc",
			});
		} catch (error) {
			console.error("Erreur récupération catégories:", error);
			return [];
		}
	}

	// Méthode pour créer une nouvelle communauté
	async createCommunaute(communauteData) {
		try {
			// Validation des données requises
			if (!communauteData.nom || !communauteData.description) {
				throw new Error("Le nom et la description sont obligatoires");
			}

			// Si aucun créateur n'est spécifié, utiliser l'utilisateur actuel
			const id_createur =
				communauteData.id_createur || "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

			const result = await this.insert("communaute", {
				nom: communauteData.nom,
				description: communauteData.description,
				id_categorie: communauteData.id_categorie,
				id_createur: id_createur,
				image: communauteData.image || null,
				nombre_max_membres: communauteData.nombre_max_membres
					? parseInt(communauteData.nombre_max_membres)
					: null,
				created_at: new Date().toISOString(),
			});

			console.log("Communauté créée, résultat:", result);

			// Récupérer la communauté créée avec ses relations
			if (result && result.id) {
				try {
					console.log(
						`Tentative de récupération de la communauté ID: ${result.id}`
					);
					const nouvelleCommunaute = await this.getCommunauteById(result.id);
					console.log(
						"🔄 Communauté récupérée avec relations:",
						nouvelleCommunaute
					);

					if (nouvelleCommunaute) {
						return nouvelleCommunaute;
					} else {
						console.warn(
							"getCommunauteById a retourné null, utilisation du résultat de base"
						);
						return result;
					}
				} catch (error) {
					console.error(
						"Erreur lors de la récupération de la communauté avec relations:",
						error
					);
					return result;
				}
			}

			return result;
		} catch (error) {
			console.error("Erreur création communauté:", error);
			throw error;
		}
	}

	// Méthode pour mettre à jour une communauté
	async updateCommunaute(id, updates) {
		try {
			console.log("🔄 updateCommunaute - ID:", id, "Updates:", updates);
			const result = await this.update("communaute", updates, { id });
			console.log("updateCommunaute - Résultat:", result);

			// Récupérer la communauté avec ses relations après mise à jour
			try {
				const communauteMiseAJour = await this.getCommunauteById(id);
				if (communauteMiseAJour) {
					console.log(
						"Communauté récupérée avec relations:",
						communauteMiseAJour
					);
					return communauteMiseAJour;
				}
			} catch (error) {
				console.warn(
					"Erreur récupération avec relations, retour du résultat de base:",
					error
				);
			}

			return result;
		} catch (error) {
			console.error("Erreur mise à jour communauté:", error);
			throw error;
		}
	}

	// Méthode pour supprimer une communauté
	async deleteCommunaute(communauteId, preserveEvents = false) {
		try {
			// Supprimer dans l'ordre des dépendances pour éviter les violations de contraintes

			// Supprimer les participations aux événements de cette communauté
			const events = await this.query("evenement", {
				select: "id",
				where: { id_communaute: communauteId },
			});

			for (const event of events) {
				await this.delete("participe", { id_evenement: event.id });
			}

			// Supprimer les inscriptions à la communauté (table inscrit)
			await this.delete("inscrit", { id_communaute: communauteId });

			// Supprimer les événements si demandé
			if (!preserveEvents) {
				await this.delete("evenement", { id_communaute: communauteId });
			}

			// Supprimer la communauté
			const result = await this.delete("communaute", { id: communauteId });
			return result[0];
		} catch (error) {
			console.error("Erreur suppression communauté:", error);
			throw error;
		}
	}

	// Méthode pour compter les événements d'une communauté
	async countEvenementsByCommunaute(communauteId) {
		try {
			const events = await this.query("evenement", {
				select: "id",
				where: { id_communaute: communauteId },
			});
			return events.length;
		} catch (error) {
			console.error("Erreur comptage événements:", error);
			return 0;
		}
	}

	// Méthode pour rejoindre une communauté
	async joinCommunaute(communauteId, userId) {
		try {
			// Validation des paramètres requis
			if (!communauteId) {
				throw new Error("ID de communauté requis");
			}

			if (!userId) {
				throw new Error(
					"Utilisateur non connecté. Veuillez vous connecter pour rejoindre une communauté."
				);
			}

			// Vérifier si l'utilisateur n'est pas déjà inscrit
			const existingSubscription = await this.query("inscrit", {
				select: "id_utilisateur",
				where: {
					id_utilisateur: userId,
					id_communaute: communauteId,
				},
			});

			if (existingSubscription.length > 0) {
				throw new Error("Vous êtes déjà inscrit à cette communauté");
			}

			const result = await this.insert("inscrit", {
				id_utilisateur: userId,
				id_communaute: communauteId,
				date_inscription: new Date().toISOString(),
				statut: "membre",
			});
			return result[0];
		} catch (error) {
			console.error("Erreur rejoindre communauté:", error);
			throw error;
		}
	}

	// Méthode pour quitter une communauté
	async leaveCommunaute(communauteId, userId) {
		try {
			const result = await this.delete("inscrit", {
				id_utilisateur: userId,
				id_communaute: communauteId,
			});
			return result[0];
		} catch (error) {
			console.error("Erreur quitter communauté:", error);
			throw error;
		}
	}

	// Méthode pour vérifier si un utilisateur est abonné à une communauté
	async isUserSubscribedToCommunaute(communauteId, userId) {
		try {
			const subscriptions = await this.query("inscrit", {
				select: "id_utilisateur,id_communaute",
				where: {
					id_utilisateur: userId,
					id_communaute: communauteId,
				},
			});
			return subscriptions.length > 0;
		} catch (error) {
			console.error("Erreur vérification abonnement:", error);
			// En cas d'erreur, retourner false pour ne pas bloquer l'interface
			return false;
		}
	}

	// Méthode pour obtenir les membres d'une communauté
	async getCommunauteMembers(communauteId) {
		try {
			return await this.query("inscrit", {
				select: `
					utilisateur:id_utilisateur(nom, prenom, pseudo),
					created_at
				`,
				where: { id_communaute: communauteId },
			});
		} catch (error) {
			console.error("Erreur récupération membres:", error);
			return [];
		}
	}

	// Méthode pour obtenir une catégorie par son ID
	async getCategorieById(categorieId) {
		try {
			const result = await this.query("categorie", {
				select: "*",
				where: { id: categorieId },
			});
			return result[0] || null;
		} catch (error) {
			console.error("Erreur récupération catégorie:", error);
			throw error;
		}
	}

	// Méthode pour créer une nouvelle catégorie
	async createCategorie(categorieData) {
		try {
			if (!categorieData.nom) {
				throw new Error("Le nom de la catégorie est obligatoire");
			}

			const result = await this.insert("categorie", {
				nom: categorieData.nom,
				description: categorieData.description || null,
				created_at: new Date().toISOString(),
			});

			return result[0];
		} catch (error) {
			console.error("Erreur création catégorie:", error);
			throw error;
		}
	}

	// Méthodes de gestion des événements
	async getEvenements(limit = 10) {
		try {
			return await this.query("evenement", {
				select: `
					*,
					communaute:id_communaute(nom, description)
				`,
				limit,
				orderBy: "created_at.desc",
			});
		} catch (error) {
			console.error("Erreur récupération événements:", error);
			return [];
		}
	}

	async getEvenementById(id) {
		try {
			const result = await this.query("evenement", {
				select: `
					*,
					communaute:id_communaute(nom, description)
				`,
				where: { id: id },
			});
			return result[0] || null;
		} catch (error) {
			console.error("Erreur récupération événement:", error);
			throw error;
		}
	}

	async createEvenement(evenementData) {
		try {
			// Validation des données requises
			if (!evenementData.nom || !evenementData.description) {
				throw new Error("Le nom et la description sont obligatoires");
			}

			const result = await this.insert("evenement", {
				nom: evenementData.nom,
				description: evenementData.description,
				date: evenementData.date,
				lieu: evenementData.lieu,
				adresse_complete: evenementData.adresse_complete,
				latitude: evenementData.latitude,
				longitude: evenementData.longitude,
				visibilite: evenementData.visibilite !== undefined ? evenementData.visibilite : true,
				id_communaute: evenementData.id_communaute,
				nombre_max_participants: evenementData.nombre_max_participants
					? parseInt(evenementData.nombre_max_participants)
					: null,
				prix: evenementData.prix ? parseFloat(evenementData.prix) : 0,
				image: evenementData.image || null,
				created_at: new Date().toISOString(),
			});

			console.log("Événement créé, résultat:", result);

			// Récupérer l'événement créé avec ses relations
			if (result && result.id) {
				try {
					const nouvelEvenement = await this.getEvenementById(result.id);
					if (nouvelEvenement) {
						return nouvelEvenement;
					} else {
						return result;
					}
				} catch (error) {
					console.error(
						"Erreur lors de la récupération de l'événement avec relations:",
						error
					);
					return result;
				}
			}

			return result;
		} catch (error) {
			console.error("Erreur création événement:", error);
			throw error;
		}
	}

	async updateEvenement(id, updates) {
		try {
			console.log("🔄 updateEvenement - ID:", id, "Updates:", updates);
			
			// Nettoyer et formater les données
			const cleanedUpdates = { ...updates };
			
			// Convertir id_communaute en nombre si présent
			if (cleanedUpdates.id_communaute) {
				cleanedUpdates.id_communaute = parseInt(cleanedUpdates.id_communaute);
			}
			
			// Convertir nombre_max_participants en nombre si présent et non null
			if (cleanedUpdates.nombre_max_participants !== null && cleanedUpdates.nombre_max_participants !== undefined) {
				cleanedUpdates.nombre_max_participants = cleanedUpdates.nombre_max_participants ? parseInt(cleanedUpdates.nombre_max_participants) : null;
			}
			
			// Convertir prix en nombre si présent
			if (cleanedUpdates.prix !== null && cleanedUpdates.prix !== undefined) {
				cleanedUpdates.prix = parseFloat(cleanedUpdates.prix);
			}
			
			console.log("🔄 Données nettoyées:", cleanedUpdates);
			
			const result = await this.update("evenement", cleanedUpdates, { id });
			console.log("updateEvenement - Résultat:", result);

			// Récupérer l'événement avec ses relations après mise à jour
			try {
				const evenementMisAJour = await this.getEvenementById(id);
				if (evenementMisAJour) {
					console.log(
						"Événement récupéré avec relations:",
						evenementMisAJour
					);
					return evenementMisAJour;
				}
			} catch (error) {
				console.warn(
					"Erreur récupération avec relations, retour du résultat de base:",
					error
				);
			}

			return result;
		} catch (error) {
			console.error("Erreur mise à jour événement:", error);
			throw error;
		}
	}

	async deleteEvenement(evenementId) {
		try {
			// Supprimer d'abord les participations à cet événement
			await this.delete("participe", { id_evenement: evenementId });

			// Supprimer l'événement
			const result = await this.delete("evenement", { id: evenementId });
			return result[0];
		} catch (error) {
			console.error("Erreur suppression événement:", error);
			throw error;
		}
	}

	async getEvenementsByCommunaute(communauteId, limit = 10) {
		try {
			return await this.query("evenement", {
				select: `
					*,
					communaute:id_communaute(nom, description)
				`,
				where: { id_communaute: communauteId },
				limit,
				orderBy: "date.asc",
			});
		} catch (error) {
			console.error("Erreur récupération événements par communauté:", error);
			return [];
		}
	}

	// Méthodes utilitaires pour CRUD génériques
	async insert(table, data) {
		const url = `${this.baseURL}/${table}`;
		try {
			const response = await fetch(url, {
				method: "POST",
				headers: {
					apikey: this.key,
					Authorization: `Bearer ${this.key}`,
					"Content-Type": "application/json",
					Prefer: "return=representation",
				},
				body: JSON.stringify(data),
			});
			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(`HTTP ${response.status}: ${errorText}`);
			}
			const result = await response.json();
			return result[0];
		} catch (error) {
			console.error("Erreur insert:", error);
			throw error;
		}
	}

	async update(table, updates, where) {
		let url = `${this.baseURL}/${table}`;
		
		if (where) {
			const whereParams = Object.keys(where).map(key => `${key}=eq.${where[key]}`).join('&');
			url += `?${whereParams}`;
		}

		console.log("🔧 URL de mise à jour:", url);
		console.log("🔧 Données à envoyer:", updates);

		try {
			const response = await fetch(url, {
				method: "PATCH",
				headers: {
					apikey: this.key,
					Authorization: `Bearer ${this.key}`,
					"Content-Type": "application/json",
					Prefer: "return=representation",
				},
				body: JSON.stringify(updates),
			});
			
			console.log("🔧 Statut de la réponse:", response.status);
			console.log("🔧 Headers de la réponse:", Object.fromEntries(response.headers.entries()));
			
			if (!response.ok) {
				const errorText = await response.text();
				console.error("🔧 Erreur réponse:", errorText);
				throw new Error(`HTTP ${response.status}: ${errorText}`);
			}
			
			const result = await response.json();
			console.log("🔧 Résultat brut de la mise à jour:", result);
			console.log("🔧 Nombre de lignes affectées:", result.length);
			
			// Si aucune ligne n'est retournée, vérifier si l'enregistrement existe
			if (result.length === 0) {
				console.warn("🔧 Aucune ligne mise à jour - vérification de l'existence de l'enregistrement");
				
				// Tenter de récupérer l'enregistrement pour vérifier s'il existe
				try {
					const checkUrl = `${this.baseURL}/${table}?${Object.keys(where).map(key => `${key}=eq.${where[key]}`).join('&')}`;
					console.log("🔧 URL de vérification:", checkUrl);
					
					const checkResponse = await fetch(checkUrl, {
						headers: {
							apikey: this.key,
							Authorization: `Bearer ${this.key}`,
							"Content-Type": "application/json",
						},
					});
					
					if (checkResponse.ok) {
						const existingData = await checkResponse.json();
						console.log("🔧 Données existantes trouvées:", existingData);
						
						if (existingData.length > 0) {
							console.warn("🔧 L'enregistrement existe mais n'a pas été mis à jour");
							console.log("🔧 Comparaison des données:");
							console.log("🔧 Données existantes:", existingData[0]);
							console.log("🔧 Updates envoyés:", updates);
							
							// Tenter une mise à jour alternative avec les données exactes
							console.log("🔧 Tentative de mise à jour alternative...");
							
							// Essayer de mettre à jour avec seulement le nom pour tester
							const simpleUpdateUrl = `${this.baseURL}/${table}?${Object.keys(where).map(key => `${key}=eq.${where[key]}`).join('&')}`;
							const simpleUpdate = { nom: updates.nom };
							
							console.log("🔧 Test avec mise à jour simple - URL:", simpleUpdateUrl);
							console.log("🔧 Test avec mise à jour simple - Data:", simpleUpdate);
							
							const simpleResponse = await fetch(simpleUpdateUrl, {
								method: "PATCH",
								headers: {
									apikey: this.key,
									Authorization: `Bearer ${this.key}`,
									"Content-Type": "application/json",
									Prefer: "return=representation",
								},
								body: JSON.stringify(simpleUpdate),
							});
							
							console.log("🔧 Test simple - Statut:", simpleResponse.status);
							console.log("🔧 Test simple - Headers:", Object.fromEntries(simpleResponse.headers.entries()));
							
							if (simpleResponse.ok) {
								const simpleResult = await simpleResponse.json();
								console.log("🔧 Test simple - Résultat:", simpleResult);
								
								if (simpleResult.length > 0) {
									console.log("🔧 ✅ La mise à jour simple a fonctionné!");
									// Retourner les données mises à jour
									return { ...existingData[0], ...updates };
								} else {
									console.error("🔧 ❌ Même la mise à jour simple a échoué");
								}
							} else {
								const simpleError = await simpleResponse.text();
								console.error("🔧 Erreur mise à jour simple:", simpleError);
							}
							
							// Retourner les données existantes fusionnées avec les updates
							return { ...existingData[0], ...updates };
						} else {
							console.error("🔧 L'enregistrement avec ces critères n'existe pas");
							throw new Error(`Aucun enregistrement trouvé avec les critères: ${JSON.stringify(where)}`);
						}
					}
				} catch (checkError) {
					console.error("🔧 Erreur lors de la vérification:", checkError);
				}
			}
			
			return result[0];
		} catch (error) {
			console.error("Erreur update:", error);
			throw error;
		}
	}

	async delete(table, where) {
		let url = `${this.baseURL}/${table}`;
		
		if (where) {
			const whereParams = Object.keys(where).map(key => `${key}=eq.${where[key]}`).join('&');
			url += `?${whereParams}`;
		}

		try {
			const response = await fetch(url, {
				method: "DELETE",
				headers: {
					apikey: this.key,
					Authorization: `Bearer ${this.key}`,
					Prefer: "return=representation",
				},
			});
			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(`HTTP ${response.status}: ${errorText}`);
			}
			const result = await response.json();
			return result;
		} catch (error) {
			console.error("Erreur delete:", error);
			throw error;
		}
	}

	// Méthodes d'authentification
	async register(email, password) {
		const url = `${this.url}/auth/v1/signup`;
		try {
			const response = await fetch(url, {
				method: "POST",
				headers: {
					apikey: this.key,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email, password }),
			});
			const data = await response.json();
			if (!response.ok)
				throw new Error(data.error?.message || "Erreur d'inscription");
			return data;
		} catch (error) {
			console.error("Erreur register:", error);
			return { error: error.message };
		}
	}

	async login(email, password) {
		const url = `${this.url}/auth/v1/token?grant_type=password`;
		try {
			const response = await fetch(url, {
				method: "POST",
				headers: {
					apikey: this.key,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email, password }),
			});
			const data = await response.json();
			if (!response.ok)
				throw new Error(data.error?.description || "Erreur de connexion");
			return data;
		} catch (error) {
			console.error("Erreur login:", error);
			return { error: error.message };
		}
	}

	// Méthodes de gestion des utilisateurs
	async createUtilisateur({
		id,
		nom,
		prenom,
		pseudo,
		telephone = null,
		avatar = null,
		bio = null,
	}) {
		const url = `${this.baseURL}/utilisateur`;
		try {
			const response = await fetch(url, {
				method: "POST",
				headers: {
					apikey: this.key,
					Authorization: `Bearer ${this.key}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					id,
					nom,
					prenom,
					pseudo,
					telephone,
					avatar,
					bio,
				}),
			});
			const data = await response.json();
			if (!response.ok)
				throw new Error(data.message || "Erreur création utilisateur");
			return data;
		} catch (error) {
			console.error("Erreur createUtilisateur:", error);
			return { error: error.message };
		}
	}

	async getUtilisateur(userId) {
		const url = `${this.baseURL}/utilisateur?id=eq.${userId}`;
		try {
			const response = await fetch(url, {
				headers: {
					apikey: this.key,
					Authorization: `Bearer ${this.key}`,
					"Content-Type": "application/json",
				},
			});
			const data = await response.json();
			if (!response.ok) throw new Error("Erreur récupération utilisateur");
			return data[0] || null;
		} catch (error) {
			console.error("Erreur getUtilisateur:", error);
			return null;
		}
	}

	async updateUtilisateur(userId, updates) {
		const url = `${this.baseURL}/utilisateur?id=eq.${userId}`;
		try {
			const response = await fetch(url, {
				method: "PATCH",
				headers: {
					apikey: this.key,
					Authorization: `Bearer ${this.key}`,
					"Content-Type": "application/json",
					Prefer: "return=minimal",
				},
				body: JSON.stringify(updates),
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(`HTTP ${response.status}: ${errorText}`);
			}

			// Pour PATCH, on peut ne pas avoir de contenu de réponse
			const contentType = response.headers.get("content-type");
			if (contentType && contentType.includes("application/json")) {
				return await response.json();
			} else {
				return { success: true };
			}
		} catch (error) {
			console.error("Erreur updateUtilisateur:", error);
			return { error: error.message };
		}
	}

	// Propriété storage pour la compatibilité
	get storage() {
		return {
			listBuckets: () => this.listBuckets(),
			createBucket: (bucketName, options) => this.createBucket(bucketName, options),
			from: (bucketName) => ({
				upload: (path, file, options) => this.uploadFile(bucketName, path, file, options),
				remove: (paths) => this.removeFiles(bucketName, paths),
				getPublicUrl: (path) => this.getPublicUrl(bucketName, path),
				list: (path, options) => this.listFiles(bucketName, path, options)
			})
		};
	}

	// Méthodes de gestion du stockage Supabase
	async listBuckets() {
		const url = `${this.url}/storage/v1/bucket`;
		try {
			const response = await fetch(url, {
				headers: {
					apikey: this.key,
					Authorization: `Bearer ${this.key}`,
				},
			});
			if (!response.ok) {
				const errorText = await response.text();
				return { data: null, error: { message: errorText } };
			}
			const data = await response.json();
			return { data, error: null };
		} catch (error) {
			console.error("Erreur listBuckets:", error);
			return { data: null, error: { message: error.message } };
		}
	}

	async createBucket(bucketName, options = {}) {
		const url = `${this.url}/storage/v1/bucket`;
		try {
			const response = await fetch(url, {
				method: "POST",
				headers: {
					apikey: this.key,
					Authorization: `Bearer ${this.key}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					name: bucketName,
					...options
				}),
			});
			if (!response.ok) {
				const errorText = await response.text();
				return { data: null, error: { message: errorText } };
			}
			const data = await response.json();
			return { data, error: null };
		} catch (error) {
			console.error("Erreur createBucket:", error);
			return { data: null, error: { message: error.message } };
		}
	}

	async uploadFile(bucketName, path, file, options = {}) {
		const url = `${this.url}/storage/v1/object/${bucketName}/${path}`;
		try {
			const response = await fetch(url, {
				method: "POST",
				headers: {
					apikey: this.key,
					Authorization: `Bearer ${this.key}`,
					...(options.contentType && { "Content-Type": options.contentType })
				},
				body: file,
			});
			if (!response.ok) {
				const errorText = await response.text();
				return { data: null, error: { message: errorText } };
			}
			const data = await response.json();
			return { data, error: null };
		} catch (error) {
			console.error("Erreur uploadFile:", error);
			return { data: null, error: { message: error.message } };
		}
	}

	async removeFiles(bucketName, paths) {
		const url = `${this.url}/storage/v1/object/${bucketName}`;
		try {
			const response = await fetch(url, {
				method: "DELETE",
				headers: {
					apikey: this.key,
					Authorization: `Bearer ${this.key}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ prefixes: paths }),
			});
			if (!response.ok) {
				const errorText = await response.text();
				return { data: null, error: { message: errorText } };
			}
			const data = await response.json();
			return { data, error: null };
		} catch (error) {
			console.error("Erreur removeFiles:", error);
			return { data: null, error: { message: error.message } };
		}
	}

	getPublicUrl(bucketName, path) {
		const publicURL = `${this.url}/storage/v1/object/public/${bucketName}/${path}`;
		return { data: { publicUrl: publicURL } };
	}

	async listFiles(bucketName, path = '', options = {}) {
		const url = `${this.url}/storage/v1/object/list/${bucketName}`;
		try {
			const response = await fetch(url, {
				method: "POST",
				headers: {
					apikey: this.key,
					Authorization: `Bearer ${this.key}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					prefix: path,
					...options
				}),
			});
			if (!response.ok) {
				const errorText = await response.text();
				return { data: null, error: { message: errorText } };
			}
			const data = await response.json();
			return { data, error: null };
		} catch (error) {
			console.error("Erreur listFiles:", error);
			return { data: null, error: { message: error.message } };
		}
	}

  async query(table, options = {}) {
    const { select = "*", limit, where, orderBy } = options;

    let url = `${this.baseURL}/${table}?select=${select}`;

    if (where) {
      Object.keys(where).forEach((key) => {
        const value = where[key];

        // Si la valeur est un objet avec un opérateur
        if (
          typeof value === "object" &&
          value !== null &&
          !Array.isArray(value)
        ) {
          const operator = Object.keys(value)[0];
          const operatorValue = value[operator];

          switch (operator) {
            case "eq":
              url += `&${key}=eq.${operatorValue}`;
              break;
            case "neq":
              url += `&${key}=neq.${operatorValue}`;
              break;
            case "gt":
              url += `&${key}=gt.${operatorValue}`;
              break;
            case "gte":
              url += `&${key}=gte.${operatorValue}`;
              break;
            case "lt":
              url += `&${key}=lt.${operatorValue}`;
              break;
            case "lte":
              url += `&${key}=lte.${operatorValue}`;
              break;
            case "like":
              url += `&${key}=like.${operatorValue}`;
              break;
            case "ilike":
              url += `&${key}=ilike.${operatorValue}`;
              break;
            case "in":
              if (Array.isArray(operatorValue)) {
                url += `&${key}=in.(${operatorValue.join(",")})`;
              }
              break;
            case "is":
              url += `&${key}=is.${operatorValue}`;
              break;
            default:
              url += `&${key}=eq.${operatorValue}`;
          }
        } else {
          url += `&${key}=eq.${value}`;
        }
      });
    }

    if (orderBy) {
      url += `&order=${orderBy}`;
    }

    if (limit) {
      url += `&limit=${limit}`;
    }

    try {
      const response = await fetch(url, {
        headers: {
          apikey: this.key,
          Authorization: `Bearer ${this.key}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur Supabase:", error);
      return [];
    }
  }



  async create(table, data) {
    const url = `${this.baseURL}/${table}`;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          apikey: this.key,
          Authorization: `Bearer ${this.key}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(`Erreur ${response.status}`);
      return await response.json();
    } catch (err) {
      console.error("Erreur create:", err);
      return null;
    }
  }



}

export const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabase;
