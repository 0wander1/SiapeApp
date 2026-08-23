export const FACTURAS_URL =
  'https://siape-production.up.railway.app/api/facturas';

export const ESTADO_COLORS: Record<string, string> = {
  emitida: '#007AFF',
  pagada: '#4CAF50',
  vencida: '#D32F2F',
  anulada: '#757575',
  parcial: '#FF9800',
};

export const DEFAULT_ESTADO_COLOR = '#555';

export type FacturaItem = {
  id_item?: string | number;
  nombre_producto: string;
  cantidad: number;
  valor_unitario: number;
  [key: string]: unknown;
};

export type Factura = {
  id_factura: string | number;
  numero_factura: string | number;
  estado: string;
  fecha_emision: string;
  fecha_vencimiento?: string;
  subtotal?: number;
  impuesto?: number;
  descuento?: number;
  total: number;
  items?: FacturaItem[];
  [key: string]: unknown;
};
