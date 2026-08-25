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
import { PAGOS_URL, type Pago } from '../utils/pagos';

type PagosScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'PagosScreen'
>;

function HeaderNuevoButton({
  navigation,
}: {
  navigation: PagosScreenNavigationProp;
}) {
  return (
    <TouchableOpacity
      style={styles.headerButton}
      onPress={() => navigation.navigate('PagoNuevoScreen')}
    >
      <Text style={styles.headerButtonText}>+ Nuevo</Text>
    </TouchableOpacity>
  );
}

function PagosScreen() {
  const navigation = useNavigation<PagosScreenNavigationProp>();
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <HeaderNuevoButton navigation={navigation} />,
    });
  }, [navigation]);

  const fetchPagos = useCallback(async () => {
    setError('');
    setLoading(true);

    try {
      const response = await axios.get(PAGOS_URL, {
        headers: {
          Authorization: `Bearer ${authState.token}`,
        },
      });

      setPagos(response.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Ocurrió un error al cargar los pagos.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPagos();
    }, [fetchPagos]),
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
      data={pagos}
      keyExtractor={item => String(item.id_pago)}
      ListEmptyComponent={
        <Text style={styles.empty}>No hay pagos para mostrar.</Text>
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.numero}>Factura #{item.numero_factura}</Text>
          <Text style={styles.monto}>{formatCOP(item.monto_pagado)}</Text>
          <Text style={styles.fecha}>{formatFecha(item.fecha_pago)}</Text>
          <Text style={styles.metodo}>{item.metodo_pago}</Text>
          {item.referencia_transaccion ? (
            <Text style={styles.referencia}>
              Ref: {item.referencia_transaccion}
            </Text>
          ) : null}
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
  monto: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
  },
  fecha: {
    fontSize: 13,
    color: '#555',
    marginBottom: 4,
  },
  metodo: {
    fontSize: 13,
    color: '#555',
  },
  referencia: {
    fontSize: 12,
    color: '#777',
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

export default PagosScreen;
