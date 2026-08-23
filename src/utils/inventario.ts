export const INVENTARIO_URL =
  'https://siape-production.up.railway.app/api/inventario';

export type InventarioItem = {
  id_inventario: string | number;
  producto_id_producto?: string | number;
  nombre_producto: string;
  descripcion_bodega?: string;
  bodega_id_bodega?: string | number;
  cantidad_disponible: number;
  cantidad_reservada?: number;
  cantidad_minima: number;
  [key: string]: unknown;
};
