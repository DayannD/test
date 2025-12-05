export const AUTH_MESSAGES = {
  INVALID_CREDENTIALS: 'Email/téléphone ou mot de passe incorrect',
  USER_NOT_FOUND: 'Utilisateur non trouvé',
  USER_EXISTS: 'Un utilisateur avec cet email/téléphone existe déjà',
  PHONE_NOT_VERIFIED: 'Le numéro de téléphone doit être vérifié',
  PHONE_ALREADY_VERIFIED: 'Le numéro de téléphone est déjà vérifié',
  INVALID_VERIFICATION_CODE: 'Code de vérification invalide',
  TOKEN_EXPIRED: 'Token expiré',
  INVALID_TOKEN: 'Token invalide',
  LOGIN_SUCCESS: 'Connexion réussie',
  LOGOUT_SUCCESS: 'Déconnexion réussie',
  SIGNUP_SUCCESS: 'Inscription réussie',
  TOO_MANY_REQUESTS: 'Trop de tentatives, veuillez réessayer plus tard',
} as const;

export const USER_MESSAGES = {
  PROFILE_UPDATED: 'Profil mis à jour avec succès',
  ACCOUNT_DELETED: 'Compte supprimé avec succès',
  PHONE_VERIFICATION_SENT: 'Code de vérification envoyé par SMS',
  PHONE_VERIFIED: 'Numéro de téléphone vérifié avec succès',
  USER_NOT_FOUND: 'Utilisateur non trouvé',
  USER_EMAIL_EXISTS: 'Un utilisateur avec cet email existe déjà',
  USER_PHONE_EXISTS: 'Un utilisateur avec ce téléphone existe déjà',
  UPDATE_ERROR: 'Erreur lors de la mise à jour',
  PASSWORD_REQUIRED: 'Le mot de passe est obligatoire',
  EMAIL_REQUIRED: "L'email est obligatoire",
  PHONE_REQUIRED: 'Le téléphone est obligatoire',
} as const;

export const VALIDATION_MESSAGES = {
  INVALID_EMAIL: "Format d'email invalide",
  INVALID_PHONE: 'Format de téléphone invalide',
  PASSWORD_TOO_SHORT: 'Le mot de passe doit contenir au moins 8 caractères',
  PASSWORD_TOO_WEAK:
    'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre',
  REQUIRED_FIELD: 'Ce champ est obligatoire',
} as const;
