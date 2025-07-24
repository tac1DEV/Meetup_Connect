// Service pour gérer l'état global de l'application
class StateService {
	constructor() {
		this.listeners = new Map();
		this.state = {};
	}

	// Définir une valeur dans l'état
	setState(key, value) {
		const oldValue = this.state[key];
		this.state[key] = value;

		// Notifier les écouteurs
		if (this.listeners.has(key)) {
			this.listeners.get(key).forEach((callback) => {
				callback(value, oldValue);
			});
		}
	}

	// Récupérer une valeur de l'état
	getState(key, defaultValue = null) {
		return this.state[key] ?? defaultValue;
	}

	// Écouter les changements d'une clé d'état
	subscribe(key, callback) {
		if (!this.listeners.has(key)) {
			this.listeners.set(key, new Set());
		}

		this.listeners.get(key).add(callback);

		// Retourner une fonction de désabonnement
		return () => {
			if (this.listeners.has(key)) {
				this.listeners.get(key).delete(callback);
			}
		};
	}

	// Réinitialiser l'état
	resetState(key = null) {
		if (key) {
			delete this.state[key];
		} else {
			this.state = {};
		}
	}

	// Mettre à jour partiellement un objet dans l'état
	updateState(key, updates) {
		const currentValue = this.getState(key, {});
		this.setState(key, { ...currentValue, ...updates });
	}
}

export default new StateService();
