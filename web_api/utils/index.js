// Utilitaires pour la gestion des erreurs
export class ErrorHandler {
// Formater un message d'erreur pour l'utilisateur
static formatUserMessage(error) {
    const message = error.message || 'Une erreur inconnue s\'est produite';
    
    // Messages spécifiques pour certaines erreurs
    const errorMappings = {
      'La catégorie est obligatoire': 'Veuillez sélectionner une catégorie pour votre communauté.',
      'Aucune catégorie disponible': 'Aucune catégorie n\'est disponible.\n\nVeuillez contacter l\'administrateur pour ajouter des catégories.',
      'Aucun utilisateur disponible': 'Aucun utilisateur n\'est disponible.\n\nVeuillez vous connecter d\'abord pour créer une communauté.',
      'HTTP error! status: 400': 'Erreur de données.\n\nVérifiez que tous les champs sont correctement remplis.',
      'already exists': 'Une communauté avec ce nom existe déjà.\n\nVeuillez choisir un autre nom.',
      'duplicate': 'Une communauté avec ce nom existe déjà.\n\nVeuillez choisir un autre nom.'
    };

    // Rechercher une correspondance exacte ou partielle
    for (const [key, userMessage] of Object.entries(errorMappings)) {
      if (message.includes(key)) {
        return userMessage;
      }
    }

    return `${message}`;
  }

// Logger une erreur de manière standardisée
  static logError(error, context = '') {
    console.error(`[${context}] Erreur:`, {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }

// Créer une erreur standardisée
  static createError(message, type = 'ApplicationError') {
    const error = new Error(message);
    error.type = type;
    return error;
  }
}


// Utilitaires pour la validation
export class ValidationUtils {
// Valider un email
 isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }


// Valider une chaîne de caractères
  static isValidString(str, minLength = 1, maxLength = Infinity) {
    if (typeof str !== 'string') return false;
    const trimmed = str.trim();
    return trimmed.length >= minLength && trimmed.length <= maxLength;
  }

// Valider un nombre
  static isValidNumber(num, min = -Infinity, max = Infinity) {
    const parsed = typeof num === 'string' ? parseInt(num) : num;
    return !isNaN(parsed) && parsed >= min && parsed <= max;
  }

// Nettoyer et valider les données d'entrée
  static sanitizeData(data, schema) {
    const sanitized = {};
    
    for (const [key, rules] of Object.entries(schema)) {
      const value = data[key];
      
      if (rules.required && (value === undefined || value === null || value === '')) {
        throw new Error(`Le champ ${key} est obligatoire`);
      }
      
      if (value !== undefined && value !== null && value !== '') {
        if (rules.type === 'string') {
          sanitized[key] = String(value).trim();
          if (rules.minLength && sanitized[key].length < rules.minLength) {
            throw new Error(`${key} doit contenir au moins ${rules.minLength} caractères`);
          }
          if (rules.maxLength && sanitized[key].length > rules.maxLength) {
            throw new Error(`${key} ne peut pas dépasser ${rules.maxLength} caractères`);
          }
        } else if (rules.type === 'number') {
          sanitized[key] = parseInt(value);
          if (isNaN(sanitized[key])) {
            throw new Error(`${key} doit être un nombre valide`);
          }
          if (rules.min !== undefined && sanitized[key] < rules.min) {
            throw new Error(`${key} doit être supérieur ou égal à ${rules.min}`);
          }
          if (rules.max !== undefined && sanitized[key] > rules.max) {
            throw new Error(`${key} doit être inférieur ou égal à ${rules.max}`);
          }
        }
      } else if (!rules.required) {
        sanitized[key] = rules.default ?? null;
      }
    }
    
    return sanitized;
  }
}


// Utilitaires pour les dates
export class DateUtils {
// Formater une date en français
  static formatDate(date, options = {}) {
    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options
    };
    
    return new Date(date).toLocaleDateString('fr-FR', defaultOptions);
  }

// Formater une date et heure
  static formatDateTime(date) {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }


// Calculer le temps écoulé depuis une date
  static timeAgo(date) {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Aujourd\'hui';
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaine(s)`;
    if (diffDays < 365) return `Il y a ${Math.floor(diffDays / 30)} mois`;
    return `Il y a ${Math.floor(diffDays / 365)} an(s)`;
  }
}

// Utilitaires pour l'interface utilisateur
export class UIUtils {
  // Afficher une notification toast
  static showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#4730dc'};
      color: white;
      padding: 12px 20px;
      border-radius: 4px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      z-index: 10000;
      max-width: 300px;
      word-wrap: break-word;
      font-family: Arial, sans-serif;
      font-size: 14px;
      opacity: 0;
      transform: translateX(100%);
      transition: all 0.3s ease;
    `;
    
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Animation d'entrée
    setTimeout(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(0)';
    }, 100);
    
    // Suppression automatique
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

// Afficher un indicateur de chargement sur un bouton
  static setButtonLoading(button, loading, loadingText = 'Chargement...') {
    if (loading) {
      button.dataset.originalText = button.textContent;
      button.textContent = loadingText;
      button.disabled = true;
    } else {
      button.textContent = button.dataset.originalText || button.textContent;
      button.disabled = false;
    }
  }

  
  // Créer un modal réutilisable
  static createModal(title, content, options = {}) {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    `;

    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
      background: white;
      padding: 30px;
      border-radius: 8px;
      width: 90%;
      max-width: ${options.maxWidth || '500px'};
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `;

    modalContent.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2 style="margin: 0; color: #333;">${title}</h2>
        <button class="close-modal" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #999;">×</button>
      </div>
      <div class="modal-body">${content}</div>
    `;

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Gestion de la fermeture
    const closeModal = () => modal.remove();
    modal.querySelector('.close-modal').onclick = closeModal;
    modal.onclick = (e) => {
      if (e.target === modal) closeModal();
    };

    document.addEventListener('keydown', function escHandler(e) {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', escHandler);
      }
    });

    return modal;
  }
}

// Utilitaires pour la navigation
export class NavigationUtils {
// Naviguer vers la page d'une communauté spécifique
  static goToCommunaute(communauteId) {
    if (!communauteId) {
      console.error('NavigationUtils.goToCommunaute: ID de communauté requis');
      return;
    }
    
    // Nettoyer le sessionStorage (plus nécessaire avec les paramètres d'URL)
    sessionStorage.removeItem('selectedCommunauteId');
    
    // Naviguer vers la page communauté avec l'ID en paramètre
    window.history.pushState({}, '', `/web_api/communaute/${communauteId}`);
    window.dispatchEvent(new Event("pushstate"));
  }
  
// Naviguer vers l'accueil
  static goToHome(forceReload = false) {
    console.log('NavigationUtils.goToHome appelé, forceReload:', forceReload);
    
    // Nettoyer complètement les données de route
    window.routeParams = null;
    sessionStorage.removeItem('selectedCommunauteId');
    
    // Si on doit forcer le rechargement, marquer que les données doivent être rechargées
    if (forceReload) {
      sessionStorage.setItem('shouldReloadHomePage', 'true');
    }
    
    // Naviguer vers la racine avec le baseUrl correct
    const homeUrl = '/web_api/';
    console.log('Navigation vers:', homeUrl);
    window.history.pushState({}, '', homeUrl);
    window.dispatchEvent(new Event("pushstate"));
  }
  
// Obtenir l'ID de communauté depuis l'URL actuelle
  static getCurrentCommunauteId() {
    if (window.routeParams && window.routeParams.id) {
      return window.routeParams.id;
    }
    return null;
  }
}
