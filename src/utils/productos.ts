export const PRODUCTOS_URL =
  'https://siape-production.up.railway.app/api/productos';

export type Producto = {
  id_producto: string | number;
  nombre_producto: string;
  [key: string]: unknown;
};
