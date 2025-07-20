const SUPABASE_URL = "https://wxfruxhckurswdcbdxwq.supabase.co";
const SUPABASE_ANON_KEY =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4ZnJ1eGhja3Vyc3dkY2JkeHdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMzM0OTksImV4cCI6MjA2NTgwOTQ5OX0.OztdaAYi3kRHhXmPwhmQCH7emQAkyYk-2R5io6M-8es";

class SupabaseClient {
	constructor(url, key) {
		this.url = url;
		this.key = key;
		this.baseURL = `${url}/rest/v1`;

		// client Storage
		this.storage = new SupabaseStorage(url, key);
	}

    // SELECT
	async query(table, options = {}) {
		const { select = "*", limit, where, orderBy } = options;

		let url = `${this.baseURL}/${table}?select=${select}`;

		if (where) {
			Object.keys(where).forEach((key) => {
				const value = where[key];

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
				const errorText = await response.text();
				console.error(`HTTP error! status: ${response.status} - ${errorText}`);
				throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
			}

			return await response.json();
		} catch (error) {
			console.error("Erreur Supabase:", error);
			return [];
		}
	}

	// INSERT
	async insert(table, data) {
		try {
			const url = `${this.baseURL}/${table}`;
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
				throw new Error(
					`HTTP error! status: ${response.status} - ${errorText}`
				);
			}

			const result = await response.json();
			return Array.isArray(result) ? result[0] : result;
		} catch (error) {
			console.error(`Erreur insertion ${table}:`, error);
			throw error;
		}
	}

	// UPDATE
	async update(table, data, where) {
		try {
			let url = `${this.baseURL}/${table}`;

			if (where) {
				const whereParams = new URLSearchParams();
				Object.keys(where).forEach((key) => {
					const value = where[key];
					if (
						typeof value === "object" &&
						value !== null &&
						!Array.isArray(value)
					) {
						const operator = Object.keys(value)[0];
						const operatorValue = value[operator];
						whereParams.append(key, `${operator}.${operatorValue}`);
					} else {
						whereParams.append(key, `eq.${value}`);
					}
				});
				url += `?${whereParams.toString()}`;
			}

			const response = await fetch(url, {
				method: "PATCH",
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
				throw new Error(
					`HTTP error! status: ${response.status} - ${errorText}`
				);
			}

			const result = await response.json();
			return Array.isArray(result) ? result[0] : result;
		} catch (error) {
			console.error(`Erreur mise à jour ${table}:`, error);
			throw error;
		}
	}

	// DELETE
	async delete(table, where) {
		try {
			let url = `${this.baseURL}/${table}`;

			if (where) {
				const whereParams = new URLSearchParams();
				Object.keys(where).forEach((key) => {
					const value = where[key];
					if (
						typeof value === "object" &&
						value !== null &&
						!Array.isArray(value)
					) {
						const operator = Object.keys(value)[0];
						const operatorValue = value[operator];
						whereParams.append(key, `${operator}.${operatorValue}`);
					} else {
						whereParams.append(key, `eq.${value}`);
					}
				});
				url += `?${whereParams.toString()}`;
			}

			const response = await fetch(url, {
				method: "DELETE",
				headers: {
					apikey: this.key,
					Authorization: `Bearer ${this.key}`,
					"Content-Type": "application/json",
					Prefer: "return=representation",
				},
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(
					`HTTP error! status: ${response.status} - ${errorText}`
				);
			}

			const result = await response.json();
			return Array.isArray(result) ? result : [result];
		} catch (error) {
			console.error(`Erreur suppression ${table}:`, error);
			throw error;
		}
	}

	// Obtenir les communautés avec leurs catégories
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

	// Obtenir une communauté spécifique par son ID
	async getCommunauteById(id) {
		try {
			const result = await this.query("communaute", {
				select: `
					*,
					categorie:id_categorie(nom, description),
					utilisateur:id_createur(nom, prenom, pseudo)
				`,
				where: { id: id }
			});
			return result[0] || null;
		} catch (error) {
			console.error("Erreur récupération communauté:", error);
			throw error;
		}
	}

	// Obtenir les catégories par ordre alphabétique
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

	// INSERT une nouvelle communauté
	async createCommunaute(communauteData) {
		try {
			if (!communauteData.nom || !communauteData.description) {
				throw new Error("Le nom et la description sont obligatoires");
			}

			const id_createur = communauteData.id_createur || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

			const result = await this.insert("communaute", {
				nom: communauteData.nom,
				description: communauteData.description,
				id_categorie: communauteData.id_categorie,
				id_createur: id_createur,
				image: communauteData.image || null,
				nombre_max_membres: communauteData.nombre_max_membres ? parseInt(communauteData.nombre_max_membres) : null,
				created_at: new Date().toISOString()
			});

			console.log('📝 Communauté créée, résultat:', result);

			if (result && result.id) {
				try {
					console.log(`🔍 Tentative de récupération de la communauté ID: ${result.id}`);
					const nouvelleCommunaute = await this.getCommunauteById(result.id);
					console.log('🔄 Communauté récupérée avec relations:', nouvelleCommunaute);
					
					if (nouvelleCommunaute) {
						return nouvelleCommunaute;
					} else {
						console.warn('⚠️ getCommunauteById a retourné null, utilisation du résultat de base');
						return result;
					}
				} catch (error) {
					console.error('❌ Erreur lors de la récupération de la communauté avec relations:', error);
					return result;
				}
			}

			return result;
		} catch (error) {
			console.error("Erreur création communauté:", error);
			throw error;
		}
	}

	// UPDATE une communauté
	async updateCommunaute(id, updates) {
		try {
			const result = await this.update("communaute", updates, { id });
			return Array.isArray(result) ? result[0] : result;
		} catch (error) {
			console.error('Erreur mise à jour communauté:', error);
			throw error;
		}
	}

	// DELETE une communauté
	async deleteCommunaute(communauteId, preserveEvents = false) {
		try {
			const events = await this.query("evenement", {
				select: "id",
				where: { id_communaute: communauteId }
			});
			
			for (const event of events) {
				await this.delete("participe", { id_evenement: event.id });
			}
			
			await this.delete("inscrit", { id_communaute: communauteId });
			
			if (!preserveEvents) {
				await this.delete("evenement", { id_communaute: communauteId });
			}
			
			const result = await this.delete("communaute", { id: communauteId });
			return result;
		} catch (error) {
			console.error('Erreur suppression communauté:', error);
			throw error;
		}
	}

	// Compter les événements d'une communauté
	async countEvenementsByCommunaute(communauteId) {
		try {
			const events = await this.query("evenement", {
				select: "id",
				where: { id_communaute: communauteId }
			});
			return events.length;
		} catch (error) {
			console.error('Erreur comptage événements:', error);
			return 0;
		}
	}

	// Rejoindre une communauté
	async joinCommunaute(communauteId, userId) {
		try {
			if (!communauteId) {
				throw new Error('ID de communauté requis');
			}
			
			if (!userId) {
				throw new Error('Utilisateur non connecté. Veuillez vous connecter pour rejoindre une communauté.');
			}

			// Vérifier si l'utilisateur est déjà inscrit
			const existingSubscription = await this.query("inscrit", {
				select: "id_utilisateur",
				where: {
					id_utilisateur: userId,
					id_communaute: communauteId
				}
			});

			if (existingSubscription.length > 0) {
				throw new Error('Vous êtes déjà inscrit à cette communauté');
			}

			const result = await this.insert("inscrit", {
				id_utilisateur: userId,
				id_communaute: communauteId,
				date_inscription: new Date().toISOString(),
				statut: 'membre'
			});
			return result;
		} catch (error) {
			console.error('Erreur rejoindre communauté:', error);
			throw error;
		}
	}

	// Quitter une communauté
	async leaveCommunaute(communauteId, userId) {
		try {
			const result = await this.delete("inscrit", {
				id_utilisateur: userId,
				id_communaute: communauteId
			});
			return result;
		} catch (error) {
			console.error('Erreur quitter communauté:', error);
			throw error;
		}
	}

	// Vérifier si un utilisateur est abonné à une communauté
	async isUserSubscribedToCommunaute(communauteId, userId) {
		try {
			const subscriptions = await this.query("inscrit", {
				select: "id_utilisateur,id_communaute",
				where: {
					id_utilisateur: userId,
					id_communaute: communauteId
				}
			});
			return subscriptions.length > 0;
		} catch (error) {
			console.error('Erreur vérification abonnement:', error);
			return false;
		}
	}

	// Obtenir les membres d'une communauté
	async getCommunauteMembers(communauteId) {
		try {
			return await this.query("inscrit", {
				select: `
					utilisateur:id_utilisateur(nom, prenom, pseudo),
					created_at
				`,
				where: { id_communaute: communauteId }
			});
		} catch (error) {
			console.error('Erreur récupération membres:', error);
			return [];
		}
	}

	// Obtenir une catégorie par  ID
	async getCategorieById(categorieId) {
		try {
			const result = await this.query("categorie", {
				select: "*",
				where: { id: categorieId }
			});
			return result[0] || null;
		} catch (error) {
			console.error("Erreur récupération catégorie:", error);
			throw error;
		}
	}

	// Créer une nouvelle catégorie
	async createCategorie(categorieData) {
		try {
			if (!categorieData.nom) {
				throw new Error("Le nom de la catégorie est obligatoire");
			}

			const result = await this.insert("categorie", {
				nom: categorieData.nom,
				description: categorieData.description || null,
				created_at: new Date().toISOString()
			});

			return result;
		} catch (error) {
			console.error("Erreur création catégorie:", error);
			throw error;
		}
	}
}

// Classe pour gérer Supabase Storage
class SupabaseStorage {
	constructor(url, key) {
		this.url = url;
		this.key = key;
		this.storageURL = `${url}/storage/v1/object`;
	}


// Obtenir une référence à un bucket
	from(bucketName) {
		return new SupabaseBucket(this.url, this.key, bucketName);
	}


// Lister tous les buckets
	async listBuckets() {
		try {
			const response = await fetch(`${this.url}/storage/v1/bucket`, {
				headers: {
					'Authorization': `Bearer ${this.key}`,
					'apikey': this.key
				}
			});

			if (!response.ok) {
				const errorText = await response.text();
				return { data: null, error: { message: errorText } };
			}

			const data = await response.json();
			return { data, error: null };
		} catch (error) {
			return { data: null, error };
		}
	}

	
//  Créer un nouveau bucket
	async createBucket(bucketName, options = {}) {
		try {
			const response = await fetch(`${this.url}/storage/v1/bucket`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${this.key}`,
					'apikey': this.key,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					name: bucketName,
					public: options.public || false,
					allowed_mime_types: options.allowedMimeTypes || null,
					file_size_limit: options.fileSizeLimit || null
				})
			});

			if (!response.ok) {
				const errorText = await response.text();
				return { data: null, error: { message: errorText } };
			}

			const data = await response.json();
			return { data, error: null };
		} catch (error) {
			return { data: null, error };
		}
	}
}

// Classe pour gérer un bucket spécifique
class SupabaseBucket {
	constructor(url, key, bucketName) {
		this.url = url;
		this.key = key;
		this.bucketName = bucketName;
		this.storageURL = `${url}/storage/v1/object`;
	}

// Uploader un fichier
	async upload(path, file, options = {}) {
		try {
			const formData = new FormData();
			formData.append('', file);

			const response = await fetch(`${this.storageURL}/${this.bucketName}/${path}`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${this.key}`,
					'apikey': this.key,
					...(options.cacheControl && { 'cache-control': options.cacheControl })
				},
				body: formData
			});

			if (!response.ok) {
				const errorText = await response.text();
				return { data: null, error: { message: errorText } };
			}

			const data = await response.json();
			return { data, error: null };
		} catch (error) {
			return { data: null, error };
		}
	}

	//Supprimer des fichiers
	async remove(paths) {
		try {
			const response = await fetch(`${this.storageURL}/${this.bucketName}`, {
				method: 'DELETE',
				headers: {
					'Authorization': `Bearer ${this.key}`,
					'apikey': this.key,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ prefixes: paths })
			});

			if (!response.ok) {
				const errorText = await response.text();
				return { data: null, error: { message: errorText } };
			}

			const data = await response.json();
			return { data, error: null };
		} catch (error) {
			return { data: null, error };
		}
	}


// Lister les fichiers dans le bucket
	async list(path = '', options = {}) {
		try {
			const params = new URLSearchParams();
			if (options.limit) params.append('limit', options.limit);
			if (options.offset) params.append('offset', options.offset);

			const response = await fetch(`${this.storageURL}/list/${this.bucketName}/${path}?${params}`, {
				headers: {
					'Authorization': `Bearer ${this.key}`,
					'apikey': this.key
				}
			});

			if (!response.ok) {
				const errorText = await response.text();
				return { data: null, error: { message: errorText } };
			}

			const data = await response.json();
			return { data, error: null };
		} catch (error) {
			return { data: null, error };
		}
	}

// Obtenir l'URL publique d'un fichier
	getPublicUrl(path) {
		return {
			data: {
				publicUrl: `${this.url}/storage/v1/object/public/${this.bucketName}/${path}`
			}
		};
	}
}

export const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabase;
