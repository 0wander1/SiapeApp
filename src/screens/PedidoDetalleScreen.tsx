import { useEffect, useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../App';
import { authState } from '../state/auth';
import {
  DEFAULT_ESTADO_COLOR,
  ESTADO_COLORS,
  PEDIDOS_URL,
  formatCOP,
  formatFecha,
  type Pedido,
  type PedidoItem,
} from '../utils/pedidos';

type PedidoDetalleScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'PedidoDetalleScreen'
>;

type PedidoDetalleScreenRouteProp = RouteProp<
  RootStackParamList,
  'PedidoDetalleScreen'
>;

function HeaderEditarButton({
  navigation,
  id_pedido_prov,
}: {
  navigation: PedidoDetalleScreenNavigationProp;
  id_pedido_prov: string | number;
}) {
  return (
    <TouchableOpacity
      style={styles.headerButton}
      onPress={() =>
        navigation.navigate('PedidoEditarScreen', { id_pedido_prov })
      }
    >
      <Text style={styles.headerButtonText}>Editar</Text>
    </TouchableOpacity>
  );
}

function PedidoDetalleScreen() {
  const navigation = useNavigation<PedidoDetalleScreenNavigationProp>();
  const route = useRoute<PedidoDetalleScreenRouteProp>();
  const { id_pedido_prov } = route.params;

  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderEditarButton
          navigation={navigation}
          id_pedido_prov={id_pedido_prov}
        />
      ),
    });
  }, [navigation, id_pedido_prov]);

  useEffect(() => {
    const fetchPedido = async () => {
      setError('');
      setLoading(true);

      try {
        const response = await axios.get(
          `${PEDIDOS_URL}/${id_pedido_prov}`,
          {
            headers: {
              Authorization: `Bearer ${authState.token}`,
            },
          },
        );

        setPedido(response.data);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.data?.message) {
          setError(err.response.data.message);
        } else {
          setError('Ocurrió un error al cargar el pedido.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPedido();
  }, [id_pedido_prov]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error || !pedido) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>
          {error || 'No se encontró el pedido.'}
        </Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: PedidoItem }) => (
    <View style={styles.itemRow}>
      <Text style={styles.itemNombre}>{item.nombre_producto}</Text>
      <Text style={styles.itemDetalle}>Cantidad: {item.cantidad}</Text>
      <Text style={styles.itemDetalle}>
        Precio unitario:{' '}
        {typeof item.precio_unitario === 'number'
          ? formatCOP(item.precio_unitario)
          : item.precio_unitario}
      </Text>
    </View>
  );

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={pedido.items}
      keyExtractor={(item, index) => String(item.id_item ?? index)}
      renderItem={renderItem}
      ListEmptyComponent={
        <Text style={styles.empty}>Este pedido no tiene items.</Text>
      }
      ListHeaderComponent={
        <>
          <View style={styles.header}>
            <Text style={styles.id}>Pedido #{pedido.id_pedido_prov}</Text>
            <Text
              style={[
                styles.estado,
                {
                  color:
                    ESTADO_COLORS[pedido.estado] ?? DEFAULT_ESTADO_COLOR,
                },
              ]}
            >
              {pedido.estado}
            </Text>
          </View>

          <View style={styles.card}>
            <InfoRow label="Proveedor" value={pedido.nombre_proveedor} />
            <InfoRow label="NIT" value={pedido.NIT} />
            <InfoRow
              label="Trabajador"
              value={pedido.trabajador?.nombre ?? '-'}
            />
            <InfoRow
              label="Fecha de creación"
              value={formatFecha(pedido.fecha_creacion)}
            />
            <InfoRow
              label="Fecha estimada"
              value={formatFecha(pedido.fechaEstimada)}
            />
            <InfoRow
              label="Valor total"
              value={formatCOP(pedido.valorTotal)}
            />
            {pedido.observaciones ? (
              <InfoRow label="Observaciones" value={pedido.observaciones} />
            ) : null}
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
  headerButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  headerButtonText: {
    color: '#007AFF',
    fontSize: 15,
    fontWeight: '600',
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
  id: {
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

export default PedidoDetalleScreen;
