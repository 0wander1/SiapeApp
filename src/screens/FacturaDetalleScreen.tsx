import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import axios from 'axios';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';

import type { RootStackParamList } from '../../App';
import { authState } from '../state/auth';
import { formatCOP, formatFecha } from '../utils/pedidos';
import {
  DEFAULT_ESTADO_COLOR,
  ESTADO_COLORS,
  FACTURAS_URL,
  type Factura,
  type FacturaItem,
} from '../utils/facturas';

type FacturaDetalleScreenRouteProp = RouteProp<
  RootStackParamList,
  'FacturaDetalleScreen'
>;

function FacturaDetalleScreen() {
  const route = useRoute<FacturaDetalleScreenRouteProp>();
  const { id_factura } = route.params;

  const [factura, setFactura] = useState<Factura | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFactura = async () => {
      setError('');
      setLoading(true);

      try {
        const response = await axios.get<Factura>(
          `${FACTURAS_URL}/${id_factura}`,
          {
            headers: {
              Authorization: `Bearer ${authState.token}`,
            },
          },
        );

        setFactura(response.data);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.data?.message) {
          setError(err.response.data.message);
        } else {
          setError('Ocurrió un error al cargar la factura.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFactura();
  }, [id_factura]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error || !factura) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>
          {error || 'No se encontró la factura.'}
        </Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: FacturaItem }) => (
    <View style={styles.itemRow}>
      <Text style={styles.itemNombre}>{item.nombre_producto}</Text>
      <Text style={styles.itemDetalle}>Cantidad: {item.cantidad}</Text>
      <Text style={styles.itemDetalle}>
        Valor unitario: {formatCOP(item.valor_unitario)}
      </Text>
    </View>
  );

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={factura.items ?? []}
      keyExtractor={(item, index) => String(item.id_item ?? index)}
      renderItem={renderItem}
      ListEmptyComponent={
        <Text style={styles.empty}>Esta factura no tiene items.</Text>
      }
      ListHeaderComponent={
        <>
          <View style={styles.header}>
            <Text style={styles.numero}>
              Factura #{factura.numero_factura}
            </Text>
            <Text
              style={[
                styles.estado,
                {
                  color: ESTADO_COLORS[factura.estado] ?? DEFAULT_ESTADO_COLOR,
                },
              ]}
            >
              {factura.estado}
            </Text>
          </View>

          <View style={styles.card}>
            <InfoRow
              label="Fecha de emisión"
              value={formatFecha(factura.fecha_emision)}
            />
            {factura.fecha_vencimiento ? (
              <InfoRow
                label="Fecha de vencimiento"
                value={formatFecha(factura.fecha_vencimiento)}
              />
            ) : null}
            {factura.subtotal != null ? (
              <InfoRow label="Subtotal" value={formatCOP(factura.subtotal)} />
            ) : null}
            {factura.impuesto != null ? (
              <InfoRow label="Impuesto" value={formatCOP(factura.impuesto)} />
            ) : null}
            {factura.descuento != null ? (
              <InfoRow
                label="Descuento"
                value={formatCOP(factura.descuento)}
              />
            ) : null}
            <InfoRow label="Total" value={formatCOP(factura.total)} />
          </View>

          <Text style={styles.sectionTitle}>Items</Text>
        </>
      }
    />
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    marginBottom: 16,
  },
  numero: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  estado: {
    fontSize: 15,
    fontWeight: '600',
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#f7f7f7',
    padding: 16,
    marginBottom: 24,
  },
  infoRow: {
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 12,
    color: '#777',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  itemRow: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#f7f7f7',
    padding: 16,
    marginBottom: 12,
  },
  itemNombre: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemDetalle: {
    fontSize: 13,
    color: '#555',
  },
  empty: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginTop: 16,
  },
  error: {
    color: '#D32F2F',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});

export default FacturaDetalleScreen;
