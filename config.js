const SUPABASE_URL = "https://wxfruxhckurswdcbdxwq.supabase.co";
const SUPABASE_ANON_KEY =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4ZnJ1eGhja3Vyc3dkY2JkeHdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMzM0OTksImV4cCI6MjA2NTgwOTQ5OX0.OztdaAYi3kRHhXmPwhmQCH7emQAkyYk-2R5io6M-8es";

class SupabaseClient {
	constructor(url, key) {
		this.url = url;
		this.key = key;
		this.baseURL = `${url}/rest/v1`;
	}

	async query(table, options = {}) {
		const { select = "*", limit, where, orderBy } = options;

		let url = `${this.baseURL}/${table}?select=${select}`;

		if (where) {
			Object.keys(where).forEach((key) => {
				const value = where[key];
				
				// Si la valeur est un objet avec un opérateur
				if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
					const operator = Object.keys(value)[0];
					const operatorValue = value[operator];
					
					switch (operator) {
						case 'eq':
							url += `&${key}=eq.${operatorValue}`;
							break;
						case 'neq':
							url += `&${key}=neq.${operatorValue}`;
							break;
						case 'gt':
							url += `&${key}=gt.${operatorValue}`;
							break;
						case 'gte':
							url += `&${key}=gte.${operatorValue}`;
							break;
						case 'lt':
							url += `&${key}=lt.${operatorValue}`;
							break;
						case 'lte':
							url += `&${key}=lte.${operatorValue}`;
							break;
						case 'like':
							url += `&${key}=like.${operatorValue}`;
							break;
						case 'ilike':
							url += `&${key}=ilike.${operatorValue}`;
							break;
						case 'in':
							if (Array.isArray(operatorValue)) {
								url += `&${key}=in.(${operatorValue.join(',')})`;
							}
							break;
						case 'is':
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

	// Méthode d'authentification
	async login(email, password) {
		try {
			const response = await fetch(`${this.url}/auth/v1/token?grant_type=password`, {
				method: 'POST',
				headers: {
					'apikey': this.key,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					email: email,
					password: password,
				}),
			});

			const data = await response.json();

			if (data.error) {
				return { error: data.error_description || data.error };
			}

			return {
				access_token: data.access_token,
				refresh_token: data.refresh_token,
				user: data.user
			};
		} catch (error) {
			return { error: error.message };
		}
	}

	// Méthode pour obtenir les données utilisateur
	async getUtilisateur(userId) {
		try {
			const result = await this.query('utilisateur', {
				where: { id: { eq: userId } },
				limit: 1
			});
			return result[0] || null;
		} catch (error) {
			console.error('Erreur lors de la récupération de l\'utilisateur:', error);
			return null;
		}
	}

	// Méthode pour mettre à jour les données utilisateur
	async updateUtilisateur(userId, userData) {
		try {
			const response = await fetch(`${this.baseURL}/utilisateur?id=eq.${userId}`, {
				method: 'PATCH',
				headers: {
					'apikey': this.key,
					'Authorization': `Bearer ${this.key}`,
					'Content-Type': 'application/json',
					'Prefer': 'return=minimal'
				},
				body: JSON.stringify(userData)
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			return { success: true };
		} catch (error) {
			return { error: error.message };
		}
	}

	// Méthode pour vérifier le rôle de l'utilisateur
	async getUserRole(userId) {
		try {
			const result = await this.query('utilisateur', {
				select: 'id_role',
				where: { id: { eq: userId } },
				limit: 1
			});
			return result[0]?.id_role || 1; // Par défaut rôle utilisateur (1)
		} catch (error) {
			console.error('Erreur lors de la vérification du rôle:', error);
			return 1;
		}
	}

	// Méthode pour obtenir tous les utilisateurs (admin seulement)
	async getAllUsers() {
		try {
			return await this.query('utilisateur', {
				select: '*',
				orderBy: 'created_at.desc'
			});
		} catch (error) {
			console.error('Erreur lors de la récupération des utilisateurs:', error);
			return [];
		}
	}

	// Méthode pour supprimer un utilisateur (admin seulement)
	async deleteUser(userId) {
		try {
			const response = await fetch(`${this.baseURL}/utilisateur?id=eq.${userId}`, {
				method: 'DELETE',
				headers: {
					'apikey': this.key,
					'Authorization': `Bearer ${this.key}`,
					'Content-Type': 'application/json'
				}
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			return { success: true };
		} catch (error) {
			return { error: error.message };
		}
	}

	// Méthode pour changer le rôle d'un utilisateur (admin seulement)
	async updateUserRole(userId, roleId) {
		try {
			const response = await fetch(`${this.baseURL}/utilisateur?id=eq.${userId}`, {
				method: 'PATCH',
				headers: {
					'apikey': this.key,
					'Authorization': `Bearer ${this.key}`,
					'Content-Type': 'application/json',
					'Prefer': 'return=minimal'
				},
				body: JSON.stringify({ id_role: roleId })
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			return { success: true };
		} catch (error) {
			return { error: error.message };
		}
	}
}

export const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabase;
