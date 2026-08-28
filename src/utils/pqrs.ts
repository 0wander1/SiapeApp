export const PQRS_URL = 'https://siape-production.up.railway.app/api/pqrs';

export const TIPOS_PQRS = ['Petición', 'Queja', 'Reclamo', 'Sugerencia'] as const;

export type TipoPQRS = (typeof TIPOS_PQRS)[number];
