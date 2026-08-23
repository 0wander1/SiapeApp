import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../App';
import { authState } from '../state/auth';
import { INVENTARIO_URL, type InventarioItem } from '../utils/inventario';
import { BODEGAS_URL, type Bodega } from '../utils/bodegas';

type InventarioEditarScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'InventarioEditarScreen'
>;

type InventarioEditarScreenRouteProp = RouteProp<
  RootStackParamList,
  'InventarioEditarScreen'
>;

function InventarioEditarScreen() {
  const navigation = useNavigation<InventarioEditarScreenNavigationProp>();
  const route = useRoute<InventarioEditarScreenRouteProp>();
  const { id_inventario, nombre_producto } = route.params;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [cantidadDisponible, setCantidadDisponible] = useState('');
  const [cantidadReservada, setCantidadReservada] = useState('');
  const [cantidadMinima, setCantidadMinima] = useState('');
  const [bodegaIdActual, setBodegaIdActual] = useState<
    string | number | null
  >(null);

  const [bodegas, setBodegas] = useState<Bodega[]>([]);
  const [loadingBodegas, setLoadingBodegas] = useState(true);
  const [errorBodegas, setErrorBodegas] = useState('');
  const [bodegaSeleccionada, setBodegaSeleccionada] = useState<Bodega | null>(
    null,
  );
  const [bodegaModalVisible, setBodegaModalVisible] = useState(false);

  const [errorGuardar, setErrorGuardar] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const fetchInventario = async () => {
      setError('');
      setLoading(true);

      try {
        const response = await axios.get<InventarioItem>(
          `${INVENTARIO_URL}/${id_inventario}`,
          {
            headers: {
              Authorization: `Bearer ${authState.token}`,
            },
          },
        );

        setCantidadDisponible(String(response.data.cantidad_disponible));
        setCantidadReservada(
          response.data.cantidad_reservada != null
            ? String(response.data.cantidad_reservada)
            : '',
        );
        setCantidadMinima(String(response.data.cantidad_minima));
        setBodegaIdActual(response.data.bodega_id_bodega ?? null);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.data?.message) {
          setError(err.response.data.message);
        } else {
          setError('Ocurrió un error al cargar el inventario.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchInventario();
  }, [id_inventario]);

  useEffect(() => {
    const fetchBodegas = async () => {
      setErrorBodegas('');
      setLoadingBodegas(true);

      try {
        const response = await axios.get(BODEGAS_URL, {
          headers: {
            Authorization: `Bearer ${authState.token}`,
          },
        });

        setBodegas(response.data);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.data?.message) {
          setErrorBodegas(err.response.data.message);
        } else {
          setErrorBodegas('Ocurrió un error al cargar las bodegas.');
        }
      } finally {
        setLoadingBodegas(false);
      }
    };

    fetchBodegas();
  }, []);

  useEffect(() => {
    if (bodegaIdActual == null || bodegas.length === 0) {
      return;
    }

    const match = bodegas.find(bodega => bodega.id_bodega === bodegaIdActual);

    if (match) {
      setBodegaSeleccionada(match);
    }
  }, [bodegaIdActual, bodegas]);

  const handleSelectBodega = (bodega: Bodega) => {
    setBodegaSeleccionada(bodega);
    setBodegaModalVisible(false);
  };

  const handleGuardar = async () => {
    setErrorGuardar('');

    const cantidadDisponibleNum = Number(cantidadDisponible);
    const cantidadReservadaNum = Number(cantidadReservada);
    const cantidadMinimaNum = Number(cantidadMinima);

    if (!cantidadDisponible || Number.isNaN(cantidadDisponibleNum)) {
      setErrorGuardar('Ingresa una cantidad disponible válida.');
      return;
    }

    if (!cantidadReservada || Number.isNaN(cantidadReservadaNum)) {
      setErrorGuardar('Ingresa una cantidad reservada válida.');
      return;
    }

    if (!cantidadMinima || Number.isNaN(cantidadMinimaNum)) {
      setErrorGuardar('Ingresa una cantidad mínima válida.');
      return;
    }

    if (!bodegaSeleccionada) {
      setErrorGuardar('Selecciona una bodega.');
      return;
    }

    setGuardando(true);

    try {
      await axios.put(
        `${INVENTARIO_URL}/${id_inventario}`,
        {
          cantidad_disponible: cantidadDisponibleNum,
          cantidad_reservada: cantidadReservadaNum,
          cantidad_minima: cantidadMinimaNum,
          bodega_id_bodega: bodegaSeleccionada.id_bodega,
        },
        {
          headers: {
            Authorization: `Bearer ${authState.token}`,
          },
        },
      );

      navigation.popTo('InventarioScreen');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setErrorGuardar(err.response.data.message);
      } else {
        setErrorGuardar('Ocurrió un error al guardar el inventario.');
      }
    } finally {
      setGuardando(false);
    }
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.sectionTitle}>Producto</Text>
      <TextInput
        style={[styles.input, styles.inputDisabled]}
        value={nombre_producto}
        editable={false}
      />

      <Text style={styles.sectionTitle}>Cantidad disponible</Text>
      <TextInput
        style={styles.input}
        placeholder="Cantidad disponible"
        keyboardType="numeric"
        value={cantidadDisponible}
        onChangeText={setCantidadDisponible}
      />

      <Text style={styles.sectionTitle}>Cantidad reservada</Text>
      <TextInput
        style={styles.input}
        placeholder="Cantidad reservada"
        keyboardType="numeric"
        value={cantidadReservada}
        onChangeText={setCantidadReservada}
      />

      <Text style={styles.sectionTitle}>Cantidad mínima</Text>
      <TextInput
        style={styles.input}
        placeholder="Cantidad mínima"
        keyboardType="numeric"
        value={cantidadMinima}
        onChangeText={setCantidadMinima}
      />

      <Text style={styles.sectionTitle}>Bodega</Text>

      {loadingBodegas ? (
        <ActivityIndicator size="small" color="#007AFF" />
      ) : errorBodegas ? (
        <Text style={styles.error}>{errorBodegas}</Text>
      ) : (
        <TouchableOpacity
          style={styles.selector}
          onPress={() => setBodegaModalVisible(true)}
        >
          <Text
            style={
              bodegaSeleccionada
                ? styles.selectorText
                : styles.selectorPlaceholder
            }
          >
            {bodegaSeleccionada
              ? bodegaSeleccionada.descripcion
              : 'Selecciona una bodega'}
          </Text>
        </TouchableOpacity>
      )}

      <Modal
        visible={bodegaModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setBodegaModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecciona una bodega</Text>
            <FlatList
              data={bodegas}
              keyExtractor={item => String(item.id_bodega)}
              ListEmptyComponent={
                <Text style={styles.empty}>No hay bodegas disponibles.</Text>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleSelectBodega(item)}
                >
                  <Text style={styles.modalItemText}>{item.descripcion}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setBodegaModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {errorGuardar ? <Text style={styles.error}>{errorGuardar}</Text> : null}

      <TouchableOpacity
        style={styles.button}
        onPress={handleGuardar}
        disabled={guardando}
      >
        <Text style={styles.buttonText}>
          {guardando ? 'Guardando...' : 'Guardar'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  inputDisabled: {
    backgroundColor: '#f0f0f0',
    color: '#777',
  },
  selector: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  selectorText: {
    fontSize: 16,
    color: '#000',
  },
  selectorPlaceholder: {
    fontSize: 16,
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalContent: {
    maxHeight: '70%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  modalItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalItemText: {
    fontSize: 16,
  },
  modalCloseButton: {
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  modalCloseButtonText: {
    color: '#007AFF',
    fontSize: 15,
    fontWeight: '600',
  },
  button: {
    height: 48,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  empty: {
    fontSize: 14,
    color: '#555',
  },
  error: {
    color: '#D32F2F',
    fontSize: 14,
    marginTop: 8,
  },
});

export default InventarioEditarScreen;
