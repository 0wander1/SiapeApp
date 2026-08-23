export const CLIENTES_URL =
  'https://siape-production.up.railway.app/api/clientes';

export type Cliente = {
  id_usuario_cli: string | number;
  nombre_usuario: string;
  [key: string]: unknown;
};
