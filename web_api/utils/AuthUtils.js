
// Utilitaires d'authentification temporaire

// UUID d'un utilisateur existant en base de données
const REAL_USER_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

// Obtient l'ID de l'utilisateur actuel
// TODO: Implémenter la vraie authentification

function getCurrentUserId() {
  console.warn('Utilisation d\'un utilisateur existant de test. Implémentez un système d\'authentification réel.');
  console.log('Real User ID:', REAL_USER_ID);
  return REAL_USER_ID;
}


// Vérifie si un utilisateur est connecté
// TODO: Implémenter la vraie authentification
function isUserLoggedIn() {
  // Pour l'instant, toujours true avec l'utilisateur de test
  return true;
}


// Affiche un avertissement concernant l'authentification manquante

function warnAuthenticationMissing() {
  console.warn('Aucun système d\'authentification implémenté');
  console.log('TODO: Ajouter l\'authentification Supabase Auth');
}

// Export pour utilisation globale
window.AuthUtils = {
  getCurrentUserId,
  isUserLoggedIn,
  warnAuthenticationMissing,
  REAL_USER_ID
};

export { getCurrentUserId, isUserLoggedIn, warnAuthenticationMissing, REAL_USER_ID };
