# Documentation du Système de Gestion de Session et Permissions

## Vue d'ensemble

Ce système de gestion de session et permissions a été intégré dans les vues `Communautes.js` et `CommunautePage.js` pour contrôler l'accès aux fonctionnalités selon le statut d'authentification et les rôles des utilisateurs.

## Composants

### SessionManager (`utils/SessionManager.js`)

Gestionnaire central pour l'authentification et les permissions :

#### Méthodes principales :
- `isAuthenticated()` - Vérifie si l'utilisateur est connecté
- `getCurrentUserId()` - Obtient l'ID de l'utilisateur connecté
- `getCurrentUserRole()` - Obtient le rôle de l'utilisateur (avec cache)
- `hasRole(requiredRole)` - Vérifie si l'utilisateur a un rôle spécifique
- `isAdmin()` - Vérifie si l'utilisateur est administrateur
- `canCreateCommunity()` - Vérifie les permissions de création de communauté
- `canJoinCommunity()` - Vérifie les permissions d'inscription
- `canEditCommunity(communityId, creatorId)` - Vérifie les permissions de modification
- `canDeleteCommunity()` - Vérifie les permissions de suppression
- `requireAuth(redirectUrl)` - Redirige vers la connexion si nécessaire
- `showPermissionError(message)` - Affiche un message d'erreur de permissions

### Rôles utilisateur

1. **Invité (non connecté)** - Rôle : null
   - Peut consulter les communautés et événements
   - Ne peut pas rejoindre de communautés
   - Ne peut pas créer de communautés

2. **Utilisateur connecté** - Rôle : 1
   - Peut consulter les communautés et événements
   - Peut rejoindre/quitter des communautés
   - Peut créer des communautés
   - Peut modifier ses propres communautés

3. **Administrateur** - Rôle : 2
   - Toutes les permissions utilisateur
   - Peut modifier toutes les communautés
   - Peut supprimer toutes les communautés
   - Accès au panel d'administration

## Implémentation dans les Vues

### Communautes.js

#### Fonctionnalités avec permissions :

1. **Création de communauté** (`showCreateForm`)
   - Vérification : Utilisateur authentifié + permission de création
   - Bouton affiché conditionnellement selon les permissions

2. **Inscription à une communauté** (`handleJoinCommunauteFromHome`)
   - Vérification : Utilisateur authentifié + permission d'inscription
   - Utilise l'ID utilisateur réel au lieu d'un ID de test

3. **Désinscription** (`handleLeaveCommunauteFromHome`)
   - Vérification : Utilisateur authentifié
   - Utilise l'ID utilisateur réel

4. **Chargement des états d'inscription** (`loadSubscriptionStates`)
   - Chargé uniquement si l'utilisateur est authentifié
   - Utilise l'ID utilisateur réel

#### Améliorations de l'interface :

- Bouton "Créer une communauté" affiché uniquement aux utilisateurs autorisés
- Messages d'erreur spécifiques selon le type de problème de permission
- Redirection automatique vers la page de connexion si nécessaire

### CommunautePage.js

#### Fonctionnalités avec permissions :

1. **Inscription/Désinscription** (`handleJoinCommunaute`, `handleLeaveCommunaute`)
   - Vérification : Utilisateur authentifié + permissions appropriées
   - Utilise l'ID utilisateur réel

2. **Suppression de communauté** (`deleteCommunaute`)
   - Vérification : Utilisateur administrateur uniquement
   - Confirmation supplémentaire requise

3. **Chargement de l'état d'inscription** (`loadCommunauteData`)
   - État d'inscription chargé uniquement pour les utilisateurs connectés
   - Fallback gracieux pour les utilisateurs non connectés

#### Améliorations de l'interface :

- **Bouton de suppression** : Affiché uniquement aux administrateurs
- **Bouton d'inscription** : 
  - "Connexion requise" pour les utilisateurs non connectés
  - Bouton normal pour les utilisateurs authentifiés
  - Désactivé si la communauté est pleine

## Sécurité

### Côté Client
- Vérification des permissions avant chaque action
- Interface adaptative selon les rôles
- Messages d'erreur informatifs
- Redirection automatique vers la connexion

### Recommandations pour le Côté Serveur
- Implémenter les mêmes vérifications côté serveur
- Validation des rôles à chaque requête API
- Protection contre les attaques de type privilege escalation
- Audit des actions administratives

## Cache des Rôles

Le système utilise un cache en sessionStorage pour optimiser les performances :
- Durée de vie : 5 minutes
- Clé : `user_role_{userId}`
- Nettoyage automatique après changement de rôle

## Messages d'Erreur

Le système fournit des messages d'erreur contextuels :
- "Vous devez être connecté pour [action]"
- "Vous n'avez pas les permissions pour [action]"
- "Seuls les administrateurs peuvent [action]"

## Utilisation

### Import dans une vue :
```javascript
import SessionManager from "../utils/SessionManager.js";
```

### Vérification des permissions :
```javascript
// Vérifier l'authentification
if (!SessionManager.isAuthenticated()) {
  SessionManager.requireAuth();
  return;
}

// Vérifier un rôle spécifique
if (!(await SessionManager.isAdmin())) {
  SessionManager.showPermissionError("Action réservée aux administrateurs");
  return;
}
```

### Génération d'interface conditionnelle :
```javascript
const canEdit = await SessionManager.canEditCommunity(communityId, creatorId);
const editButton = canEdit ? generateEditButton() : null;
```

## Extension

Pour ajouter de nouvelles permissions :

1. Ajouter la méthode de vérification dans `SessionManager`
2. Implémenter la logique selon les rôles
3. Utiliser la méthode dans les vues concernées
4. Adapter l'interface utilisateur selon les permissions

## Notes de Migration

Ce système remplace les mécanismes d'authentification temporaires :
- Remplacement de `window.AuthUtils.getCurrentUserId()` par `SessionManager.getCurrentUserId()`
- Remplacement des ID utilisateur en dur par l'authentification réelle
- Ajout de vérifications de permissions avant toutes les actions sensibles
