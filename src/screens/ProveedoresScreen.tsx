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
import { PROVEEDORES_URL, type ProveedorItem } from '../utils/proveedores';

type ProveedoresScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ProveedoresScreen'
>;

function HeaderNuevoButton({
  navigation,
}: {
  navigation: ProveedoresScreenNavigationProp;
}) {
  return (
    <TouchableOpacity
      style={styles.headerButton}
      onPress={() => navigation.navigate('ProveedorNuevoScreen')}
    >
      <Text style={styles.headerButtonText}>+ Nuevo</Text>
    </TouchableOpacity>
  );
}

function ProveedoresScreen() {
  const navigation = useNavigation<ProveedoresScreenNavigationProp>();
  const [proveedores, setProveedores] = useState<ProveedorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <HeaderNuevoButton navigation={navigation} />,
    });
  }, [navigation]);

  const fetchProveedores = useCallback(async () => {
    setError('');
    setLoading(true);

    try {
      const response = await axios.get(PROVEEDORES_URL, {
        headers: {
          Authorization: `Bearer ${authState.token}`,
        },
      });

      setProveedores(response.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Ocurrió un error al cargar los proveedores.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchProveedores();
    }, [fetchProveedores]),
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
      data={proveedores}
      keyExtractor={item => String(item.id_proveedor)}
      ListEmptyComponent={
        <Text style={styles.empty}>No hay proveedores para mostrar.</Text>
      }
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            navigation.navigate('ProveedorDetalleScreen', {
              id_proveedor: item.id_proveedor,
            })
          }
        >
          <View style={styles.cardHeader}>
            <Text style={styles.nombre}>{item.nombre_proveedor}</Text>
            <View
              style={[
                styles.badge,
                item.pedidos_pendientes > 0
                  ? styles.badgeAzul
                  : styles.badgeGris,
              ]}
            >
              <Text style={styles.badgeText}>
                {item.pedidos_pendientes > 0
                  ? `${item.pedidos_pendientes} pendientes`
                  : 'Sin pendientes'}
              </Text>
            </View>
          </View>
          <Text style={styles.nit}>NIT: {item.NIT}</Text>
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nombre: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  nit: {
    fontSize: 13,
    color: '#555',
  },
  badge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeAzul: {
    backgroundColor: '#1976D2',
  },
  badgeGris: {
    backgroundColor: '#9E9E9E',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
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

export default ProveedoresScreen;
