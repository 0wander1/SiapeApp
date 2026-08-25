export const PAGOS_URL = 'https://siape-production.up.railway.app/api/pagos';

export type Pago = {
  id_pago: string | number;
  numero_factura: string | number;
  factura_id_factura: string | number;
  monto_pagado: number;
  fecha_pago: string;
  metodo_pago: string;
  referencia_transaccion?: string;
  [key: string]: unknown;
};
