export const BCRYPT_ROUNDS = 12;

export const RATE_LIMIT = {
  AUTH_TTL: 15 * 60 * 1000, // 15 minutes
  AUTH_LIMIT: 5, // 5 tentatives par 15 minutes
  GLOBAL_TTL: 60 * 1000, // 1 minute
  GLOBAL_LIMIT: 100, // 100 requêtes par minute
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

export const TOKEN_TYPES = {
  ACCESS: 'access',
  REFRESH: 'refresh',
} as const;
