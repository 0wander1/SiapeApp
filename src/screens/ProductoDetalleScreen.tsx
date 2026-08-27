import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
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
import { formatCOP, formatFecha } from '../utils/pedidos';
import { PRODUCTOS_URL, type Producto } from '../utils/productos';

type ProductoDetalleScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ProductoDetalleScreen'
>;

type ProductoDetalleScreenRouteProp = RouteProp<
  RootStackParamList,
  'ProductoDetalleScreen'
>;

function HeaderActions({
  navigation,
  id_producto,
  onEliminar,
}: {
  navigation: ProductoDetalleScreenNavigationProp;
  id_producto: string | number;
  onEliminar: () => void;
}) {
  return (
    <View style={styles.headerActions}>
      <TouchableOpacity
        style={styles.headerButton}
        onPress={() =>
          navigation.navigate('ProductoEditarScreen', { id_producto })
        }
      >
        <Text style={styles.headerButtonText}>Editar</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.headerButton} onPress={onEliminar}>
        <Text style={styles.headerButtonTextDanger}>Eliminar</Text>
      </TouchableOpacity>
    </View>
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

function ProductoDetalleScreen() {
  const navigation = useNavigation<ProductoDetalleScreenNavigationProp>();
  const route = useRoute<ProductoDetalleScreenRouteProp>();
  const { id_producto } = route.params;

  const [producto, setProducto] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleEliminarConfirmado = useCallback(async () => {
    try {
      await axios.delete(`${PRODUCTOS_URL}/${id_producto}`, {
        headers: {
          Authorization: `Bearer ${authState.token}`,
        },
      });

      navigation.popTo('ProductosScreen');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        Alert.alert('Error', err.response.data.message);
      } else {
        Alert.alert('Error', 'Ocurrió un error al eliminar el producto.');
      }
    }
  }, [navigation, id_producto]);

  const handleEliminar = useCallback(() => {
    Alert.alert(
      'Eliminar producto',
      `¿Estás seguro de que deseas eliminar "${producto?.nombre_producto ?? id_producto}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: handleEliminarConfirmado,
        },
      ],
    );
  }, [id_producto, producto, handleEliminarConfirmado]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderActions
          navigation={navigation}
          id_producto={id_producto}
          onEliminar={handleEliminar}
        />
      ),
    });
  }, [navigation, id_producto, handleEliminar]);

  useEffect(() => {
    const fetchProducto = async () => {
      setError('');
      setLoading(true);

      try {
        const response = await axios.get<Producto>(
          `${PRODUCTOS_URL}/${id_producto}`,
          {
            headers: {
              Authorization: `Bearer ${authState.token}`,
            },
          },
        );

        setProducto(response.data);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.data?.message) {
          setError(err.response.data.message);
        } else {
          setError('Ocurrió un error al cargar el producto.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducto();
  }, [id_producto]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error || !producto) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>
          {error || 'No se encontró el producto.'}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.nombre}>{producto.nombre_producto}</Text>

      <View style={styles.card}>
        <InfoRow label="Valor de venta" value={formatCOP(producto.valor_de_venta)} />
        <InfoRow label="Lote" value={producto.lote ?? '-'} />
        <InfoRow
          label="Fecha de vencimiento"
          value={
            producto.fecha_vencimiento
              ? formatFecha(producto.fecha_vencimiento)
              : '-'
          }
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerActions: {
    flexDirection: 'row',
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
  headerButtonTextDanger: {
    color: '#D32F2F',
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
  nombre: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#f7f7f7',
    padding: 16,
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
  error: {
    color: '#D32F2F',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});

export default ProductoDetalleScreen;
