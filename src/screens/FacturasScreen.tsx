import { useCallback, useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import axios from 'axios';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../App';
import { authState } from '../state/auth';
import { formatCOP, formatFecha } from '../utils/pedidos';
import {
  DEFAULT_ESTADO_COLOR,
  ESTADO_COLORS,
  FACTURAS_URL,
  type Factura,
} from '../utils/facturas';

type FacturasScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'FacturasScreen'
>;

function HeaderNuevaButton({
  navigation,
}: {
  navigation: FacturasScreenNavigationProp;
}) {
  return (
    <TouchableOpacity
      style={styles.headerButton}
      onPress={() => navigation.navigate('FacturaNuevaScreen')}
    >
      <Text style={styles.headerButtonText}>+ Nueva</Text>
    </TouchableOpacity>
  );
}

function FacturasScreen() {
  const navigation = useNavigation<FacturasScreenNavigationProp>();
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <HeaderNuevaButton navigation={navigation} />,
    });
  }, [navigation]);

  const fetchFacturas = useCallback(async () => {
    setError('');
    setLoading(true);

    try {
      const response = await axios.get(FACTURAS_URL, {
        headers: {
          Authorization: `Bearer ${authState.token}`,
        },
      });

      setFacturas(response.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Ocurrió un error al cargar las facturas.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchFacturas();
    }, [fetchFacturas]),
  );

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
      data={facturas}
      keyExtractor={item => String(item.id_factura)}
      ListEmptyComponent={
        <Text style={styles.empty}>No hay facturas para mostrar.</Text>
      }
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            navigation.navigate('FacturaDetalleScreen', {
              id_factura: item.id_factura,
            })
          }
        >
          <Text style={styles.numero}>{item.numero_factura}</Text>
          <Text
            style={[
              styles.estado,
              { color: ESTADO_COLORS[item.estado] ?? DEFAULT_ESTADO_COLOR },
            ]}
          >
            {item.estado}
          </Text>
          <Text style={styles.total}>{formatCOP(item.total)}</Text>
          <Text style={styles.fecha}>{formatFecha(item.fecha_emision)}</Text>
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
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#f7f7f7',
    padding: 16,
    marginBottom: 12,
  },
  numero: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  estado: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  total: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  fecha: {
    fontSize: 13,
    color: '#555',
    marginTop: 4,
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

export default FacturasScreen;
