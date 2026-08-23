import { useCallback, useState } from 'react';
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
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../App';
import { authState } from '../state/auth';
import { INVENTARIO_URL, type InventarioItem } from '../utils/inventario';

type InventarioScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'InventarioScreen'
>;

function getCardStockStyle(cantidadDisponible: number, cantidadMinima: number) {
  if (cantidadDisponible <= cantidadMinima * 0.5) {
    return styles.cardRojo;
  }

  if (cantidadDisponible <= cantidadMinima) {
    return styles.cardAmarillo;
  }

  return styles.cardVerde;
}

function InventarioScreen() {
  const navigation = useNavigation<InventarioScreenNavigationProp>();
  const [inventario, setInventario] = useState<InventarioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchInventario = useCallback(async () => {
    setError('');
    setLoading(true);

    try {
      const response = await axios.get(INVENTARIO_URL, {
        headers: {
          Authorization: `Bearer ${authState.token}`,
        },
      });

      setInventario(response.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Ocurrió un error al cargar el inventario.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchInventario();
    }, [fetchInventario]),
  );

  const handleEliminarConfirmado = async (item: InventarioItem) => {
    try {
      await axios.delete(`${INVENTARIO_URL}/${item.id_inventario}`, {
        headers: {
          Authorization: `Bearer ${authState.token}`,
        },
        data: {
          producto_id_producto: item.producto_id_producto,
        },
      });

      fetchInventario();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        Alert.alert('Error', err.response.data.message);
      } else {
        Alert.alert(
          'Error',
          'Ocurrió un error al eliminar el producto del inventario.',
        );
      }
    }
  };

  const handleEliminar = (item: InventarioItem) => {
    Alert.alert(
      'Eliminar del inventario',
      `¿Estás seguro de que deseas eliminar "${item.nombre_producto}" del inventario?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => handleEliminarConfirmado(item),
        },
      ],
    );
  };

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
      data={inventario}
      keyExtractor={item => String(item.id_inventario)}
      ListEmptyComponent={
        <Text style={styles.empty}>No hay inventario para mostrar.</Text>
      }
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[
            styles.card,
            getCardStockStyle(item.cantidad_disponible, item.cantidad_minima),
          ]}
          onPress={() =>
            navigation.navigate('InventarioEditarScreen', {
              id_inventario: item.id_inventario,
              producto_id_producto: item.producto_id_producto ?? '',
              nombre_producto: item.nombre_producto,
            })
          }
        >
          <Text style={styles.nombre}>{item.nombre_producto}</Text>
          <Text style={styles.bodega}>{item.descripcion_bodega}</Text>
          <Text style={styles.cantidad}>
            Disponible: {item.cantidad_disponible}
          </Text>
          <Text style={styles.minima}>Mínima: {item.cantidad_minima}</Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleEliminar(item)}
          >
            <Text style={styles.deleteButtonText}>Eliminar</Text>
          </TouchableOpacity>
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
    padding: 16,
    marginBottom: 12,
  },
  cardRojo: {
    backgroundColor: '#FFEBEE',
    borderColor: '#D32F2F',
  },
  cardAmarillo: {
    backgroundColor: '#FFF8E1',
    borderColor: '#FF9800',
  },
  cardVerde: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  nombre: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  bodega: {
    fontSize: 13,
    color: '#555',
    marginBottom: 8,
  },
  cantidad: {
    fontSize: 14,
    fontWeight: '600',
  },
  minima: {
    fontSize: 13,
    color: '#555',
    marginTop: 2,
  },
  deleteButton: {
    alignSelf: 'flex-end',
    marginTop: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  deleteButtonText: {
    color: '#D32F2F',
    fontSize: 13,
    fontWeight: '600',
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

export default InventarioScreen;
