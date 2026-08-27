export const PRODUCTOS_URL =
  'https://siape-production.up.railway.app/api/productos';

export type Producto = {
  id_producto: string | number;
  nombre_producto: string;
  valor_neto?: number;
  valor_de_venta: number;
  lote?: string;
  fecha_vencimiento?: string;
  bodega_id_bodega?: string | number;
  [key: string]: unknown;
};
