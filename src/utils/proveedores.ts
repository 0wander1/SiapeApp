export const PROVEEDORES_URL =
  'https://siape-production.up.railway.app/api/proveedores';

export type Producto = {
  id_prod_prov: string | number;
  producto_id_producto: string | number;
  nombre: string;
  precio_unitario?: number;
  precio_compra?: number;
  tiempo_entrega_dias?: number;
  es_proveedor_principal?: boolean;
  [key: string]: unknown;
};

export type Proveedor = {
  id_proveedor: string | number;
  nombre_proveedor: string;
  NIT?: string;
  [key: string]: unknown;
};

export type ProveedorDetalle = Proveedor & {
  productos_asociados?: Producto[];
};

export type ProveedorItem = Proveedor & {
  pedidos_pendientes: number;
};
