export const PEDIDOS_URL =
  'https://siape-production.up.railway.app/api/pedidos-proveedor';

export type PedidoItem = {
  id_item?: string | number;
  nombre_producto?: string;
  cantidad?: number;
  precio_unitario?: number;
  [key: string]: unknown;
};

export type Trabajador = {
  id_usuario?: string | number;
  nombre?: string;
  [key: string]: unknown;
};

export type Pedido = {
  id_pedido_prov: string | number;
  proveedor_id_proveedor: string | number;
  usuario_trab_id: string | number;
  fecha_creacion: string;
  fechaEstimada: string;
  estado: string;
  valorTotal: number;
  observaciones: string | null;
  nombre_proveedor: string;
  NIT: string;
  trabajador: Trabajador;
  items: PedidoItem[];
};

export const ESTADO_COLORS: Record<string, string> = {
  pendiente: '#FF9800',
  confirmado: '#007AFF',
  en_transito: '#9C27B0',
  recibido: '#4CAF50',
  cancelado: '#D32F2F',
};

export const DEFAULT_ESTADO_COLOR = '#555';

export function formatCOP(valor: number): string {
  return valor.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  });
}

export function formatFecha(fecha: string): string {
  const date = new Date(fecha);
  if (Number.isNaN(date.getTime())) {
    return fecha;
  }
  return date.toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
