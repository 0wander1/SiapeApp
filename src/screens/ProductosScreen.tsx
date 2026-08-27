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
import { PRODUCTOS_URL, type Producto } from '../utils/productos';

type ProductosScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ProductosScreen'
>;

function HeaderNuevoButton({
  navigation,
}: {
  navigation: ProductosScreenNavigationProp;
}) {
  return (
    <TouchableOpacity
      style={styles.headerButton}
      onPress={() => navigation.navigate('ProductoNuevoScreen')}
    >
      <Text style={styles.headerButtonText}>+ Nuevo</Text>
    </TouchableOpacity>
  );
}

function ProductosScreen() {
  const navigation = useNavigation<ProductosScreenNavigationProp>();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <HeaderNuevoButton navigation={navigation} />,
    });
  }, [navigation]);

  const fetchProductos = useCallback(async () => {
    setError('');
    setLoading(true);

    try {
      const response = await axios.get(PRODUCTOS_URL, {
        headers: {
          Authorization: `Bearer ${authState.token}`,
        },
      });

      setProductos(response.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Ocurrió un error al cargar los productos.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchProductos();
    }, [fetchProductos]),
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
      data={productos}
      keyExtractor={item => String(item.id_producto)}
      ListEmptyComponent={
        <Text style={styles.empty}>No hay productos para mostrar.</Text>
      }
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            navigation.navigate('ProductoDetalleScreen', {
              id_producto: item.id_producto,
            })
          }
        >
          <Text style={styles.nombre}>{item.nombre_producto}</Text>
          <Text style={styles.valor}>{formatCOP(item.valor_de_venta)}</Text>
          {item.lote ? (
            <Text style={styles.lote}>Lote: {item.lote}</Text>
          ) : null}
          {item.fecha_vencimiento ? (
            <Text style={styles.vencimiento}>
              Vence: {formatFecha(item.fecha_vencimiento)}
            </Text>
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
  nombre: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  valor: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
  },
  lote: {
    fontSize: 13,
    color: '#555',
    marginBottom: 2,
  },
  vencimiento: {
    fontSize: 13,
    color: '#555',
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

export default ProductosScreen;
