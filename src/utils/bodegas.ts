export const BODEGAS_URL =
  'https://siape-production.up.railway.app/api/bodegas';

export type Bodega = {
  id_bodega: string | number;
  descripcion: string;
  [key: string]: unknown;
};
