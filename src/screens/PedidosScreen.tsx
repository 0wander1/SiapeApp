import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { authState } from '../state/auth';
import type { RootStackParamList } from '../../App';
import {
  DEFAULT_ESTADO_COLOR,
  ESTADO_COLORS,
  PEDIDOS_URL,
  formatCOP,
  formatFecha,
  type Pedido,
} from '../utils/pedidos';

type PedidosScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'PedidosScreen'
>;

function PedidosScreen() {
  const navigation = useNavigation<PedidosScreenNavigationProp>();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPedidos = async () => {
      setError('');
      setLoading(true);

      try {
        const response = await axios.get(PEDIDOS_URL, {
          headers: {
            Authorization: `Bearer ${authState.token}`,
          },
        });

        setPedidos(response.data);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.data?.message) {
          setError(err.response.data.message);
        } else {
          setError('Ocurrió un error al cargar los pedidos.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPedidos();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={pedidos}
      keyExtractor={item => String(item.id_pedido_prov)}
      ListEmptyComponent={
        <Text style={styles.empty}>No hay pedidos para mostrar.</Text>
      }
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            navigation.navigate('PedidoDetalleScreen', {
              id_pedido_prov: item.id_pedido_prov,
            })
          }
        >
          <Text style={styles.proveedor}>{item.nombre_proveedor}</Text>
          <Text
            style={[
              styles.estado,
              { color: ESTADO_COLORS[item.estado] ?? DEFAULT_ESTADO_COLOR },
            ]}
          >
            {item.estado}
          </Text>
          <Text style={styles.valor}>{formatCOP(item.valorTotal)}</Text>
          <Text style={styles.fecha}>{formatFecha(item.fechaEstimada)}</Text>
          {item.observaciones ? (
            <Text style={styles.observaciones}>{item.observaciones}</Text>
          ) : null}
        </TouchableOpacity>
      )}
    />
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
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#f7f7f7',
    padding: 16,
    marginBottom: 12,
  },
  proveedor: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  estado: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  valor: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  fecha: {
    fontSize: 13,
    color: '#555',
    marginTop: 4,
  },
  observaciones: {
    fontSize: 13,
    color: '#777',
    fontStyle: 'italic',
    marginTop: 8,
  },
  empty: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginTop: 32,
  },
  error: {
    color: '#D32F2F',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});

export default PedidosScreen;
