import { useCallback, useLayoutEffect, useState } from 'react';
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
import { BODEGAS_URL, type Bodega } from '../utils/bodegas';

type BodegasScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'BodegasScreen'
>;

function HeaderNuevaButton({
  navigation,
}: {
  navigation: BodegasScreenNavigationProp;
}) {
  return (
    <TouchableOpacity
      style={styles.headerButton}
      onPress={() => navigation.navigate('BodegaNuevaScreen')}
    >
      <Text style={styles.headerButtonText}>+ Nueva</Text>
    </TouchableOpacity>
  );
}

function getCapacidadColor(porcentaje: number) {
  if (porcentaje >= 90) {
    return '#D32F2F';
  }

  if (porcentaje >= 70) {
    return '#FF9800';
  }

  return '#4CAF50';
}

function CardActions({
  navigation,
  bodega,
  onEliminar,
}: {
  navigation: BodegasScreenNavigationProp;
  bodega: Bodega;
  onEliminar: (bodega: Bodega) => void;
}) {
  return (
    <View style={styles.cardActions}>
      <TouchableOpacity
        style={styles.cardActionButton}
        onPress={() =>
          navigation.navigate('BodegaEditarScreen', {
            id_bodega: bodega.id_bodega,
          })
        }
      >
        <Text style={styles.headerButtonText}>Editar</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.cardActionButton}
        onPress={() => onEliminar(bodega)}
      >
        <Text style={styles.headerButtonTextDanger}>Eliminar</Text>
      </TouchableOpacity>
    </View>
  );
}

function CapacidadBarra({
  capacidadActual,
  capacidadMaxima,
}: {
  capacidadActual: number;
  capacidadMaxima: number;
}) {
  const porcentaje =
    capacidadMaxima > 0 ? (capacidadActual / capacidadMaxima) * 100 : 0;
  const color = getCapacidadColor(porcentaje);
  const anchoBarra = Math.min(Math.max(porcentaje, 0), 100);

  return (
    <View style={styles.capacidadContainer}>
      <View style={styles.capacidadBarraFondo}>
        <View
          style={[
            styles.capacidadBarraRelleno,
            { width: `${anchoBarra}%`, backgroundColor: color },
          ]}
        />
      </View>
      <Text style={styles.capacidadTexto}>
        {capacidadActual}/{capacidadMaxima} ({Math.round(porcentaje)}%)
      </Text>
    </View>
  );
}

function BodegasScreen() {
  const navigation = useNavigation<BodegasScreenNavigationProp>();
  const [bodegas, setBodegas] = useState<Bodega[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <HeaderNuevaButton navigation={navigation} />,
    });
  }, [navigation]);

  const fetchBodegas = useCallback(async () => {
    setError('');
    setLoading(true);

    try {
      const response = await axios.get(BODEGAS_URL, {
        headers: {
          Authorization: `Bearer ${authState.token}`,
        },
      });

      setBodegas(response.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Ocurrió un error al cargar las bodegas.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchBodegas();
    }, [fetchBodegas]),
  );

  const handleEliminarConfirmado = useCallback(
    async (bodega: Bodega) => {
      try {
        await axios.delete(`${BODEGAS_URL}/${bodega.id_bodega}`, {
          headers: {
            Authorization: `Bearer ${authState.token}`,
          },
        });

        fetchBodegas();
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.data?.message) {
          Alert.alert('Error', err.response.data.message);
        } else {
          Alert.alert('Error', 'Ocurrió un error al eliminar la bodega.');
        }
      }
    },
    [fetchBodegas],
  );

  const handleEliminar = useCallback(
    (bodega: Bodega) => {
      Alert.alert(
        'Eliminar bodega',
        `¿Estás seguro de que deseas eliminar "${bodega.descripcion}"?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: () => handleEliminarConfirmado(bodega),
          },
        ],
      );
    },
    [handleEliminarConfirmado],
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
      data={bodegas}
      keyExtractor={item => String(item.id_bodega)}
      ListEmptyComponent={
        <Text style={styles.empty}>No hay bodegas para mostrar.</Text>
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.descripcion}>{item.descripcion}</Text>
          {item.ciudad ? (
            <Text style={styles.detalle}>Ciudad: {item.ciudad}</Text>
          ) : null}
          {item.tipo_bodega ? (
            <Text style={styles.detalle}>Tipo: {item.tipo_bodega}</Text>
          ) : null}
          {item.capacidad_actual != null && item.capacidad_maxima != null ? (
            <CapacidadBarra
              capacidadActual={item.capacidad_actual}
              capacidadMaxima={item.capacidad_maxima}
            />
          ) : null}
          <CardActions
            navigation={navigation}
            bodega={item}
            onEliminar={handleEliminar}
          />
        </View>
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
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#f7f7f7',
    padding: 16,
    marginBottom: 12,
  },
  descripcion: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  detalle: {
    fontSize: 13,
    color: '#555',
    marginBottom: 2,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  cardActionButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  capacidadContainer: {
    marginTop: 10,
  },
  capacidadBarraFondo: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
    overflow: 'hidden',
  },
  capacidadBarraRelleno: {
    height: 8,
    borderRadius: 4,
  },
  capacidadTexto: {
    fontSize: 12,
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

export default BodegasScreen;
