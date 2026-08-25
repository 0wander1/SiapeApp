import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
  PROVEEDORES_URL,
  type ProveedorDetalle,
  type Producto,
} from '../utils/proveedores';
import {
  PRODUCTOS_URL,
  type Producto as ProductoCatalogo,
} from '../utils/productos';

type ProveedorDetalleScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ProveedorDetalleScreen'
>;

type ProveedorDetalleScreenRouteProp = RouteProp<
  RootStackParamList,
  'ProveedorDetalleScreen'
>;

function HeaderActions({
  navigation,
  id_proveedor,
  onEliminar,
}: {
  navigation: ProveedorDetalleScreenNavigationProp;
  id_proveedor: string | number;
  onEliminar: () => void;
}) {
  return (
    <View style={styles.headerActions}>
      <TouchableOpacity
        style={styles.headerButton}
        onPress={() =>
          navigation.navigate('ProveedorEditarScreen', { id_proveedor })
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

function ProveedorDetalleScreen() {
  const navigation = useNavigation<ProveedorDetalleScreenNavigationProp>();
  const route = useRoute<ProveedorDetalleScreenRouteProp>();
  const { id_proveedor } = route.params;

  const [proveedor, setProveedor] = useState<ProveedorDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [todosLosProductos, setTodosLosProductos] = useState<
    ProductoCatalogo[]
  >([]);

  const handleEliminarConfirmado = useCallback(async () => {
    try {
      await axios.delete(`${PROVEEDORES_URL}/${id_proveedor}`, {
        headers: {
          Authorization: `Bearer ${authState.token}`,
        },
      });

      navigation.popTo('ProveedoresScreen');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        Alert.alert('Error', err.response.data.message);
      } else {
        Alert.alert('Error', 'Ocurrió un error al eliminar el proveedor.');
      }
    }
  }, [navigation, id_proveedor]);

  const handleEliminar = useCallback(() => {
    Alert.alert(
      'Eliminar proveedor',
      `¿Estás seguro de que deseas eliminar el proveedor "${proveedor?.nombre_proveedor ?? id_proveedor}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: handleEliminarConfirmado,
        },
      ],
    );
  }, [id_proveedor, proveedor, handleEliminarConfirmado]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderActions
          navigation={navigation}
          id_proveedor={id_proveedor}
          onEliminar={handleEliminar}
        />
      ),
    });
  }, [navigation, id_proveedor, handleEliminar]);

  useEffect(() => {
    const fetchTodosLosProductos = async () => {
      try {
        const response = await axios.get<ProductoCatalogo[]>(PRODUCTOS_URL, {
          headers: {
            Authorization: `Bearer ${authState.token}`,
          },
        });

        setTodosLosProductos(response.data);
      } catch (err) {
        console.error('Error al cargar los productos:', err);
      }
    };

    fetchTodosLosProductos();
  }, []);

  useEffect(() => {
    const fetchProveedor = async () => {
      setError('');
      setLoading(true);

      try {
        const response = await axios.get<ProveedorDetalle>(
          `${PROVEEDORES_URL}/${id_proveedor}`,
          {
            headers: {
              Authorization: `Bearer ${authState.token}`,
            },
          },
        );

        setProveedor(response.data);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.data?.message) {
          setError(err.response.data.message);
        } else {
          setError('Ocurrió un error al cargar el proveedor.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProveedor();
  }, [id_proveedor]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error || !proveedor) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>
          {error || 'No se encontró el proveedor.'}
        </Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: Producto }) => {
    const productoCatalogo = todosLosProductos.find(
      producto => producto.id_producto === item.producto_id_producto,
    );

    return (
      <View style={styles.itemRow}>
        <Text style={styles.itemNombre}>
          {productoCatalogo?.nombre_producto ?? item.nombre}
        </Text>
        {item.precio_compra != null ? (
          <Text style={styles.itemDetalle}>
            Precio de compra: {item.precio_compra}
          </Text>
        ) : null}
        {item.tiempo_entrega_dias != null ? (
          <Text style={styles.itemDetalle}>
            Tiempo de entrega: {item.tiempo_entrega_dias} días
          </Text>
        ) : null}
      </View>
    );
  };

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={proveedor.productos_asociados ?? []}
      keyExtractor={(item, index) => String(item.id_prod_prov ?? index)}
      renderItem={renderItem}
      ListEmptyComponent={
        <Text style={styles.empty}>
          Este proveedor no tiene productos asociados.
        </Text>
      }
      ListHeaderComponent={
        <>
          <View style={styles.header}>
            <Text style={styles.nombre}>{proveedor.nombre_proveedor}</Text>
          </View>

          <View style={styles.card}>
            <InfoRow label="NIT" value={proveedor.NIT ?? '-'} />
          </View>

          <Text style={styles.sectionTitle}>Productos asociados</Text>
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
  header: {
    marginBottom: 16,
  },
  nombre: {
    fontSize: 20,
    fontWeight: '700',
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

export default ProveedorDetalleScreen;
