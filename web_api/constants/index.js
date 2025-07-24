
// Constantes globales de l'application

// Configuration de l'application
export const APP_CONFIG = {
  name: 'Meetup Connect',
  version: '2.0.0',
  description: 'Plateforme communautaire pour créer et rejoindre des événements',
  baseUrl: '/web_api'
};

// Messages d'erreur standardisés
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erreur de connexion. Vérifiez votre connexion internet.',
  UNAUTHORIZED: 'Vous n\'êtes pas autorisé à effectuer cette action.',
  FORBIDDEN: 'Accès refusé.',
  NOT_FOUND: 'Ressource non trouvée.',
  SERVER_ERROR: 'Erreur serveur. Veuillez réessayer plus tard.',
  VALIDATION_ERROR: 'Les données fournies ne sont pas valides.',
  REQUIRED_FIELD: 'Ce champ est obligatoire.',
  INVALID_EMAIL: 'Adresse email invalide.',
  PASSWORD_TOO_SHORT: 'Le mot de passe doit contenir au moins 8 caractères.',
  PASSWORDS_DONT_MATCH: 'Les mots de passe ne correspondent pas.',
  ALREADY_EXISTS: 'Cette ressource existe déjà.',
  OPERATION_FAILED: 'L\'opération a échoué.'
};

// Messages de succès
export const SUCCESS_MESSAGES = {
  CREATED: 'Créé avec succès',
  UPDATED: 'Mis à jour avec succès',
  DELETED: 'Supprimé avec succès',
  SAVED: 'Sauvegardé avec succès',
  SENT: 'Envoyé avec succès',
  REGISTERED: 'Inscription réussie',
  LOGIN_SUCCESS: 'Connexion réussie',
  LOGOUT_SUCCESS: 'Déconnexion réussie'
};

// Styles des composants
export const COMPONENT_STYLES = {
  colors: {
    primary: '#4730dc',
    secondary: '#757575',
    success: '#4caf50',
    warning: '#ff9800',
    error: '#f44336',
    info: '#4730dc',
    light: '#f5f5f5',
    dark: '#333333',
    white: '#ffffff',
    transparent: 'transparent'
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px'
  },
  borderRadius: {
    none: '0',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '50%'
  },
  shadows: {
    none: 'none',
    sm: '0 1px 3px rgba(0,0,0,0.12)',
    md: '0 4px 6px rgba(0,0,0,0.1)',
    lg: '0 10px 15px rgba(0,0,0,0.1)',
    xl: '0 20px 25px rgba(0,0,0,0.15)'
  },
  fonts: {
    family: 'Arial, sans-serif',
    sizes: {
      xs: '12px',
      sm: '14px',
      md: '16px',
      lg: '18px',
      xl: '20px',
      xxl: '24px',
      xxxl: '32px'
    },
    weights: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    }
  }
};

// Configuration des transitions et animations
export const ANIMATIONS = {
  duration: {
    fast: '0.15s',
    normal: '0.3s',
    slow: '0.5s'
  },
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out'
  }
};

// Limites et validations
export const VALIDATION_RULES = {
  communaute: {
    nom: {
      minLength: 3,
      maxLength: 100
    },
    description: {
      minLength: 10,
      maxLength: 1000
    },
    nombreMaxMembres: {
      min: 1,
      max: 10000
    }
  },
  evenement: {
    titre: {
      minLength: 3,
      maxLength: 200
    },
    description: {
      minLength: 10,
      maxLength: 2000
    },
    nombreMaxParticipants: {
      min: 1,
      max: 1000
    }
  },
  utilisateur: {
    nom: {
      minLength: 2,
      maxLength: 50
    },
    prenom: {
      minLength: 2,
      maxLength: 50
    },
    email: {
      maxLength: 255
    },
    password: {
      minLength: 8,
      maxLength: 128
    }
  }
};

// Configuration de pagination
export const PAGINATION = {
  defaultLimit: 10,
  maxLimit: 100,
  communautes: {
    itemsPerPage: 6
  },
  evenements: {
    itemsPerPage: 12
  },
  photos: {
    itemsPerPage: 20
  }
};

// Types d'événements
export const EVENT_TYPES = [
  { value: 'conference', label: 'Conférence' },
  { value: 'workshop', label: 'Atelier' },
  { value: 'meetup', label: 'Meetup' },
  { value: 'networking', label: 'Networking' },
  { value: 'formation', label: 'Formation' },
  { value: 'hackathon', label: 'Hackathon' },
  { value: 'competition', label: 'Compétition' },
  { value: 'social', label: 'Événement social' },
  { value: 'autre', label: 'Autre' }
];

// Statuts des événements
export const EVENT_STATUS = {
  DRAFT: 'brouillon',
  PUBLISHED: 'publié',
  CANCELLED: 'annulé',
  COMPLETED: 'terminé'
};

// Rôles utilisateur
export const USER_ROLES = {
  ADMIN: 'admin',
  MODERATOR: 'moderateur',
  MEMBER: 'membre',
  GUEST: 'invité'
};

// Configuration des notifications
export const NOTIFICATION_CONFIG = {
  duration: {
    short: 3000,
    normal: 5000,
    long: 8000
  },
  position: {
    topRight: 'top-right',
    topLeft: 'top-left',
    bottomRight: 'bottom-right',
    bottomLeft: 'bottom-left',
    center: 'center'
  }
};

// URLs et endpoints
export const API_ENDPOINTS = {
  communautes: '/api/communautes',
  evenements: '/api/evenements',
  categories: '/api/categories',
  utilisateurs: '/api/utilisateurs',
  inscriptions: '/api/inscriptions',
  photos: '/photos.json'
};

// Regex patterns pour validation
export const REGEX_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^(?:\+33|0)[1-9](?:[0-9]{8})$/,
  url: /^https?:\/\/.+/,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/
};

// Configuration du localStorage
export const STORAGE_KEYS = {
  selectedCommunauteId: 'selectedCommunauteId',
  userPreferences: 'userPreferences',
  authToken: 'authToken',
  theme: 'theme',
  language: 'language'
};

// Formats de date
export const DATE_FORMATS = {
  short: { year: 'numeric', month: 'short', day: 'numeric' },
  long: { year: 'numeric', month: 'long', day: 'numeric' },
  time: { hour: '2-digit', minute: '2-digit' },
  datetime: { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  }
};

// Configuration responsive
export const BREAKPOINTS = {
  mobile: '640px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1280px'
};
