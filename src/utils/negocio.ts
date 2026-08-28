export const NEGOCIO_URL = 'https://siape-production.up.railway.app/api/negocio';

export type Negocio = {
  nombre?: string;
  nit?: string;
  direccion?: string;
  telefono?: string;
  correo?: string;
  [key: string]: unknown;
};
