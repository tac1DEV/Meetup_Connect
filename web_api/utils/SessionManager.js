// Gestionnaire de session et permissions pour l'application
import supabase from "../config.js";

// Fonction pour parser le JWT token
function parseJwt(token) {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export class SessionManager {
  // Obtenir les informations de l'utilisateur connecté
  static getCurrentUser() {
    const token = localStorage.getItem("sb_token");
    return parseJwt(token);
  }

  // Vérifier si l'utilisateur est connecté
  static isAuthenticated() {
    const user = this.getCurrentUser();
    return user && user.sub;
  }

  // Obtenir l'ID de l'utilisateur actuel
  static getCurrentUserId() {
    const user = this.getCurrentUser();
    return user ? user.sub : null;
  }

  // Obtenir le rôle de l'utilisateur actuel (avec cache)
  static async getCurrentUserRole() {
    if (!this.isAuthenticated()) {
      return null;
    }

    const userId = this.getCurrentUserId();
    const cacheKey = `user_role_${userId}`;
    const cached = sessionStorage.getItem(cacheKey);
    
    if (cached) {
      const { role, timestamp } = JSON.parse(cached);
      // Cache valide pendant 5 minutes
      if (Date.now() - timestamp < 300000) {
        return role;
      }
    }

    try {
      const userData = await supabase.getUtilisateur(userId);
      const role = userData?.id_role || 1;
      
      // Mettre en cache
      sessionStorage.setItem(cacheKey, JSON.stringify({
        role,
        timestamp: Date.now()
      }));
      
      return role;
    } catch (error) {
      console.error('Erreur lors de la récupération du rôle:', error);
      return 1; // Rôle utilisateur par défaut
    }
  }

  // Vérifier si l'utilisateur a un rôle spécifique ou supérieur
  static async hasRole(requiredRole) {
    const userRole = await this.getCurrentUserRole();
    return userRole >= requiredRole;
  }

  // Vérifier si l'utilisateur est administrateur
  static async isAdmin() {
    return await this.hasRole(2);
  }

  // Vérifier si l'utilisateur peut créer des communautés
  static async canCreateCommunity() {
    // Seuls les utilisateurs authentifiés peuvent créer des communautés
    return this.isAuthenticated();
  }

  // Vérifier si l'utilisateur peut rejoindre des communautés
  static async canJoinCommunity() {
    // Seuls les utilisateurs authentifiés peuvent rejoindre des communautés
    return this.isAuthenticated();
  }

  // Vérifier si l'utilisateur peut modifier une communauté
  static async canEditCommunity(communityId, communityCreatorId = null) {
    if (!this.isAuthenticated()) {
      return false;
    }

    const isAdmin = await this.isAdmin();
    if (isAdmin) {
      return true;
    }

    // Le créateur de la communauté peut la modifier
    const currentUserId = this.getCurrentUserId();
    return communityCreatorId && currentUserId === communityCreatorId;
  }

  // Vérifier si l'utilisateur peut supprimer une communauté
  static async canDeleteCommunity(communityId, communityCreatorId = null) {
    // Seuls les admins peuvent supprimer des communautés
    return await this.isAdmin();
  }

  // Obtenir les noms des rôles
  static getRoleName(roleId) {
    switch (roleId) {
      case 1:
        return "Utilisateur";
      case 2:
        return "Administrateur";
      default:
        return "Invité";
    }
  }

  // Déconnecter l'utilisateur
  static logout() {
    localStorage.removeItem("sb_token");
    sessionStorage.clear();
    window.location.href = "/web_api/login";
  }

  // Rediriger vers la page de connexion si non authentifié
  static requireAuth(redirectUrl = "/web_api/login") {
    if (!this.isAuthenticated()) {
      window.location.href = redirectUrl;
      return false;
    }
    return true;
  }

  // Afficher un message d'erreur de permissions
  static showPermissionError(message = "Vous n'avez pas les permissions nécessaires pour effectuer cette action.") {
    if (window.UIUtils && window.UIUtils.showToast) {
      window.UIUtils.showToast(message, "error");
    } else {
      alert(message);
    }
  }

  // Nettoyer le cache des rôles (à appeler après changement de rôle)
  static clearRoleCache() {
    const userId = this.getCurrentUserId();
    if (userId) {
      sessionStorage.removeItem(`user_role_${userId}`);
    }
  }
}

// Export des méthodes pour compatibilité
export const {
  getCurrentUser,
  isAuthenticated, 
  getCurrentUserId,
  getCurrentUserRole,
  hasRole,
  isAdmin,
  canCreateCommunity,
  canJoinCommunity,
  canEditCommunity,
  canDeleteCommunity,
  getRoleName,
  logout,
  requireAuth,
  showPermissionError,
  clearRoleCache
} = SessionManager;

// Rendre disponible globalement
window.SessionManager = SessionManager;

export default SessionManager;
