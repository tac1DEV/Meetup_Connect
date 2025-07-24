import supabase from "../../config.js";

// Service pour gérer les opérations liées aux événements
class EventService {
	// Récupérer tous les événements
	async getEvents(options = {}) {
		try {
			const {
				limit = 50,
				where = {},
				orderBy = "date_evenement.asc",
			} = options;
			return await supabase.query("evenements", {
				select: "*,communautes(*),utilisateurs(*)",
				limit,
				where,
				orderBy,
			});
		} catch (error) {
			console.error("Erreur lors du chargement des événements:", error);
			throw new Error(`Impossible de charger les événements: ${error.message}`);
		}
	}

	// Récupérer les événements d'une communauté
	async getEventsByCommunaute(communauteId) {
		try {
			if (!communauteId) {
				throw new Error("ID de communauté requis");
			}
			return await this.getEvents({
				where: { id_communaute: communauteId },
				orderBy: "date_evenement.asc",
			});
		} catch (error) {
			console.error(
				"Erreur lors du chargement des événements de la communauté:",
				error
			);
			throw error;
		}
	}

	// Récupérer un événement par son ID
	async getEventById(eventId) {
		try {
			if (!eventId) {
				throw new Error("ID d'événement requis");
			}
			const events = await supabase.query("evenements", {
				select: "*,communautes(*),utilisateurs(*)",
				where: { id: eventId },
				limit: 1,
			});

			if (events.length === 0) {
				throw new Error("Événement non trouvé");
			}

			return events[0];
		} catch (error) {
			console.error("Erreur lors du chargement de l'événement:", error);
			throw new Error(`Impossible de charger l'événement: ${error.message}`);
		}
	}

	// Créer un nouvel événement
	async createEvent(eventData) {
		try {
			this._validateEventData(eventData);
			return await supabase.insert("evenements", eventData);
		} catch (error) {
			console.error("Erreur lors de la création de l'événement:", error);
			throw error;
		}
	}

	// Mettre à jour un événement
	async updateEvent(eventId, updateData) {
		try {
			if (!eventId) {
				throw new Error("ID d'événement requis");
			}
			return await supabase.update("evenements", updateData, { id: eventId });
		} catch (error) {
			console.error("Erreur lors de la mise à jour de l'événement:", error);
			throw new Error(
				`Impossible de mettre à jour l'événement: ${error.message}`
			);
		}
	}

	// Supprimer un événement
	async deleteEvent(eventId) {
		try {
			if (!eventId) {
				throw new Error("ID d'événement requis");
			}
			return await supabase.delete("evenements", { id: eventId });
		} catch (error) {
			console.error("Erreur lors de la suppression de l'événement:", error);
			throw new Error(`Impossible de supprimer l'événement: ${error.message}`);
		}
	}

	// S'inscrire à un événement
	async joinEvent(eventId, userId = null) {
		try {
			if (!eventId) {
				throw new Error("ID d'événement requis");
			}

			// Si pas d'ID utilisateur fourni, essayer de récupérer l'utilisateur actuel
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

			// Vérifier si l'utilisateur n'est pas déjà inscrit
			const existingInscription = await supabase.query(
				"inscriptions_evenements",
				{
					where: { id_evenement: eventId, id_utilisateur: userId },
					limit: 1,
				}
			);

			if (existingInscription.length > 0) {
				throw new Error("Vous êtes déjà inscrit à cet événement");
			}

			// Vérifier la capacité de l'événement
			const event = await this.getEventById(eventId);
			if (event.nombre_max_participants) {
				const inscriptions = await supabase.query("inscriptions_evenements", {
					where: { id_evenement: eventId },
				});

				if (inscriptions.length >= event.nombre_max_participants) {
					throw new Error("Cet événement est complet");
				}
			}

			// Créer l'inscription
			return await supabase.insert("inscriptions_evenements", {
				id_evenement: eventId,
				id_utilisateur: userId,
				date_inscription: new Date().toISOString(),
			});
		} catch (error) {
			console.error("Erreur lors de l'inscription à l'événement:", error);
			throw error;
		}
	}

	// Se désinscrire d'un événement
	async leaveEvent(eventId, userId = null) {
		try {
			if (!eventId) {
				throw new Error("ID d'événement requis");
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

			return await supabase.delete("inscriptions_evenements", {
				id_evenement: eventId,
				id_utilisateur: userId,
			});
		} catch (error) {
			console.error("Erreur lors de la désinscription de l'événement:", error);
			throw new Error(
				`Impossible de se désinscrire de l'événement: ${error.message}`
			);
		}
	}

	// Récupérer les participants d'un événement
	async getEventParticipants(eventId) {
		try {
			if (!eventId) {
				throw new Error("ID d'événement requis");
			}

			return await supabase.query("inscriptions_evenements", {
				select: "*,utilisateurs(*)",
				where: { id_evenement: eventId },
			});
		} catch (error) {
			console.error("Erreur lors du chargement des participants:", error);
			throw new Error(
				`Impossible de charger les participants: ${error.message}`
			);
		}
	}

	// Valider les données d'un événement
	_validateEventData(data) {
		if (!data.titre || data.titre.trim().length < 3) {
			throw new Error("Le titre doit contenir au moins 3 caractères");
		}

		if (!data.description || data.description.trim().length < 10) {
			throw new Error("La description doit contenir au moins 10 caractères");
		}

		if (!data.date_evenement) {
			throw new Error("La date de l'événement est obligatoire");
		}

		if (!data.id_communaute) {
			throw new Error("La communauté est obligatoire");
		}

		// Valider la date (doit être dans le futur)
		const eventDate = new Date(data.date_evenement);
		const now = new Date();
		if (eventDate <= now) {
			throw new Error("La date de l'événement doit être dans le futur");
		}

		// Valider le nombre de participants
		if (data.nombre_max_participants && data.nombre_max_participants !== "") {
			const nombreMax = parseInt(data.nombre_max_participants);
			if (isNaN(nombreMax) || nombreMax < 1) {
				throw new Error(
					"Le nombre maximal de participants doit être un nombre positif"
				);
			}
		}
	}
}

export default new EventService();
