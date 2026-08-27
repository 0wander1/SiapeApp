export const BODEGAS_URL =
  'https://siape-production.up.railway.app/api/bodegas';

export const TIPOS_BODEGA = [
  'seca',
  'refrigerada',
  'congelada',
  'inflamables',
  'general',
] as const;

export type Bodega = {
  id_bodega: string | number;
  descripcion: string;
  ubicacion?: string;
  ciudad?: string;
  tipo_bodega?: string;
  capacidad_actual?: number;
  capacidad_maxima?: number;
  activa?: number | boolean;
  usuario_trab_id_responsable?: string | number;
  [key: string]: unknown;
};
