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
			if (!response.ok) throw new Error(data.error?.message || "Erreur d'inscription");
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
			if (!response.ok) throw new Error(data.error?.description || "Erreur de connexion");
			return data;
		} catch (error) {
			console.error("Erreur login:", error);
			return { error: error.message };
		}
	}

	async createUtilisateur({ id, nom, prenom, pseudo, telephone = null, avatar = null, bio = null }) {
		const url = `${this.baseURL}/utilisateur`;
		try {
			const response = await fetch(url, {
				method: "POST",
				headers: {
					apikey: this.key,
					Authorization: `Bearer ${this.key}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ id, nom, prenom, pseudo, telephone, avatar, bio }),
			});
			const data = await response.json();
			if (!response.ok) throw new Error(data.message || "Erreur création utilisateur");
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
					"Prefer": "return=minimal"
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

  async update(table, id, data) {
    const url = `${this.baseURL}/${table}?id=eq.${id}`;
    try {
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
      if (!response.ok) throw new Error(`Erreur ${response.status}`);
      return await response.json();
    } catch (err) {
      console.error("Erreur update:", err);
      return null;
    }
  }

  async delete(table, id) {
    const url = `${this.baseURL}/${table}?id=eq.${id}`;
    try {
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          apikey: this.key,
          Authorization: `Bearer ${this.key}`,
        },
      });
      if (!response.ok) throw new Error(`Erreur ${response.status}`);
      return true;
    } catch (err) {
      console.error("Erreur delete:", err);
      return false;
    }
  }
}

export const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabase;
