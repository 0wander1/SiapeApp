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
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';

import type { RootStackParamList } from '../../App';
import { authState } from '../state/auth';
import { PEDIDOS_URL, type Pedido } from '../utils/pedidos';
import { BODEGAS_URL, type Bodega } from '../utils/bodegas';

const ESTADOS = [
  'pendiente',
  'confirmado',
  'en_transito',
  'recibido',
  'cancelado',
] as const;

type PedidoEditarScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'PedidoEditarScreen'
>;

type PedidoEditarScreenRouteProp = RouteProp<
  RootStackParamList,
  'PedidoEditarScreen'
>;

function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseISODate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function PedidoEditarScreen() {
  const navigation = useNavigation<PedidoEditarScreenNavigationProp>();
  const route = useRoute<PedidoEditarScreenRouteProp>();
  const { id_pedido_prov } = route.params;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [estado, setEstado] = useState('');
  const [estadoModalVisible, setEstadoModalVisible] = useState(false);

  const [fechaEstimada, setFechaEstimada] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [observaciones, setObservaciones] = useState('');

  const [bodegas, setBodegas] = useState<Bodega[]>([]);
  const [loadingBodegas, setLoadingBodegas] = useState(false);
  const [errorBodegas, setErrorBodegas] = useState('');
  const [bodegaSeleccionada, setBodegaSeleccionada] = useState<Bodega | null>(
    null,
  );
  const [bodegaModalVisible, setBodegaModalVisible] = useState(false);

  const [errorGuardar, setErrorGuardar] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const fetchPedido = async () => {
      setError('');
      setLoading(true);

      try {
        const response = await axios.get<Pedido>(
          `${PEDIDOS_URL}/${id_pedido_prov}`,
          {
            headers: {
              Authorization: `Bearer ${authState.token}`,
            },
          },
        );

        setEstado(response.data.estado);
        setFechaEstimada(response.data.fechaEstimada.slice(0, 10));
        setObservaciones(response.data.observaciones ?? '');
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.data?.message) {
          setError(err.response.data.message);
        } else {
          setError('Ocurrió un error al cargar el pedido.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPedido();
  }, [id_pedido_prov]);

  useEffect(() => {
    if (estado !== 'recibido') {
      return;
    }

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
  }, [estado]);

  const handleSelectEstado = (nuevoEstado: string) => {
    setEstado(nuevoEstado);
    setEstadoModalVisible(false);
  };

  const handleSelectBodega = (bodega: Bodega) => {
    setBodegaSeleccionada(bodega);
    setBodegaModalVisible(false);
  };

  const handleDateChange = (
    _event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    setShowDatePicker(false);

    if (selectedDate) {
      setFechaEstimada(formatDateISO(selectedDate));
    }
  };

  const handleGuardar = async () => {
    setErrorGuardar('');

    if (!estado) {
      setErrorGuardar('Selecciona un estado.');
      return;
    }

    if (!fechaEstimada) {
      setErrorGuardar('Selecciona la fecha estimada.');
      return;
    }

    if (estado === 'recibido' && !bodegaSeleccionada) {
      setErrorGuardar('Selecciona una bodega.');
      return;
    }

    setGuardando(true);

    try {
      await axios.put(
        `${PEDIDOS_URL}/${id_pedido_prov}`,
        {
          estado,
          fecha_estimada: fechaEstimada,
          observaciones: observaciones || null,
          ...(estado === 'recibido'
            ? { bodega_id: bodegaSeleccionada?.id_bodega }
            : {}),
        },
        {
          headers: {
            Authorization: `Bearer ${authState.token}`,
          },
        },
      );

      navigation.popTo('PedidosScreen');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setErrorGuardar(err.response.data.message);
      } else {
        setErrorGuardar('Ocurrió un error al guardar el pedido.');
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
      <Text style={styles.sectionTitle}>Estado</Text>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setEstadoModalVisible(true)}
      >
        <Text style={styles.selectorText}>{estado}</Text>
      </TouchableOpacity>

      <Modal
        visible={estadoModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setEstadoModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecciona un estado</Text>
            <FlatList
              data={ESTADOS}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleSelectEstado(item)}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setEstadoModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Text style={styles.sectionTitle}>Fecha estimada</Text>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setShowDatePicker(true)}
      >
        <Text
          style={
            fechaEstimada ? styles.selectorText : styles.selectorPlaceholder
          }
        >
          {fechaEstimada || 'Selecciona una fecha'}
        </Text>
      </TouchableOpacity>

      {showDatePicker ? (
        <DateTimePicker
          value={fechaEstimada ? parseISODate(fechaEstimada) : new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      ) : null}

      <Text style={styles.sectionTitle}>Observaciones</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Observaciones del pedido"
        multiline
        numberOfLines={3}
        value={observaciones}
        onChangeText={setObservaciones}
      />

      {estado === 'recibido' ? (
        <>
          <View style={styles.warning}>
            <Text style={styles.warningText}>
              Al marcar el pedido como recibido, selecciona la bodega donde
              se almacenarán los productos.
            </Text>
          </View>

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
                    <Text style={styles.empty}>
                      No hay bodegas disponibles.
                    </Text>
                  }
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.modalItem}
                      onPress={() => handleSelectBodega(item)}
                    >
                      <Text style={styles.modalItemText}>
                        {item.descripcion}
                      </Text>
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
        </>
      ) : null}

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
  textArea: {
    height: 80,
    paddingTop: 12,
    textAlignVertical: 'top',
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
  warning: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF9800',
    backgroundColor: '#FFF3E0',
    padding: 12,
    marginTop: 16,
  },
  warningText: {
    color: '#E65100',
    fontSize: 13,
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

export default PedidoEditarScreen;
