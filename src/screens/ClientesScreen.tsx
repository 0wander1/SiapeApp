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
import { CLIENTES_URL, type Cliente } from '../utils/clientes';

type ClientesScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ClientesScreen'
>;

function HeaderNuevoButton({
  navigation,
}: {
  navigation: ClientesScreenNavigationProp;
}) {
  return (
    <TouchableOpacity
      style={styles.headerButton}
      onPress={() => navigation.navigate('ClienteNuevoScreen')}
    >
      <Text style={styles.headerButtonText}>+ Nuevo</Text>
    </TouchableOpacity>
  );
}

function CardActions({
  navigation,
  cliente,
  onEliminar,
}: {
  navigation: ClientesScreenNavigationProp;
  cliente: Cliente;
  onEliminar: (cliente: Cliente) => void;
}) {
  return (
    <View style={styles.cardActions}>
      <TouchableOpacity
        style={styles.cardActionButton}
        onPress={() =>
          navigation.navigate('ClienteEditarScreen', {
            id_usuario_cli: cliente.id_usuario_cli,
            nombre_usuario: cliente.nombre_usuario,
            correo: cliente.correo ?? '',
          })
        }
      >
        <Text style={styles.headerButtonText}>Editar</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.cardActionButton}
        onPress={() => onEliminar(cliente)}
      >
        <Text style={styles.headerButtonTextDanger}>Eliminar</Text>
      </TouchableOpacity>
    </View>
  );
}

function ClientesScreen() {
  const navigation = useNavigation<ClientesScreenNavigationProp>();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <HeaderNuevoButton navigation={navigation} />,
    });
  }, [navigation]);

  const fetchClientes = useCallback(async () => {
    setError('');
    setLoading(true);

    try {
      const response = await axios.get(CLIENTES_URL, {
        headers: {
          Authorization: `Bearer ${authState.token}`,
        },
      });

      setClientes(response.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Ocurrió un error al cargar los clientes.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchClientes();
    }, [fetchClientes]),
  );

  const handleEliminarConfirmado = useCallback(
    async (cliente: Cliente) => {
      try {
        await axios.delete(`${CLIENTES_URL}/${cliente.id_usuario_cli}`, {
          headers: {
            Authorization: `Bearer ${authState.token}`,
          },
        });

        fetchClientes();
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.data?.message) {
          Alert.alert('Error', err.response.data.message);
        } else {
          Alert.alert('Error', 'Ocurrió un error al eliminar el cliente.');
        }
      }
    },
    [fetchClientes],
  );

  const handleEliminar = useCallback(
    (cliente: Cliente) => {
      Alert.alert(
        'Eliminar cliente',
        `¿Estás seguro de que deseas eliminar "${cliente.nombre_usuario}"?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: () => handleEliminarConfirmado(cliente),
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
      data={clientes}
      keyExtractor={item => String(item.id_usuario_cli)}
      ListEmptyComponent={
        <Text style={styles.empty}>No hay clientes para mostrar.</Text>
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.nombre}>{item.nombre_usuario}</Text>
          {item.correo ? (
            <Text style={styles.correo}>{item.correo}</Text>
          ) : null}
          <CardActions
            navigation={navigation}
            cliente={item}
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
  nombre: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  correo: {
    fontSize: 13,
    color: '#555',
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

export default ClientesScreen;
