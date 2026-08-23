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
import { FACTURAS_URL, type Factura } from '../utils/facturas';

const ESTADOS = ['emitida', 'pagada', 'vencida', 'anulada', 'parcial'] as const;

type FacturaEditarScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'FacturaEditarScreen'
>;

type FacturaEditarScreenRouteProp = RouteProp<
  RootStackParamList,
  'FacturaEditarScreen'
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

function FacturaEditarScreen() {
  const navigation = useNavigation<FacturaEditarScreenNavigationProp>();
  const route = useRoute<FacturaEditarScreenRouteProp>();
  const { id_factura } = route.params;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [numeroFactura, setNumeroFactura] = useState('');

  const [estado, setEstado] = useState('');
  const [estadoModalVisible, setEstadoModalVisible] = useState(false);

  const [fechaEmision, setFechaEmision] = useState('');
  const [showFechaEmisionPicker, setShowFechaEmisionPicker] = useState(false);

  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [showFechaVencimientoPicker, setShowFechaVencimientoPicker] =
    useState(false);

  const [errorGuardar, setErrorGuardar] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const fetchFactura = async () => {
      setError('');
      setLoading(true);

      try {
        const response = await axios.get<Factura>(
          `${FACTURAS_URL}/${id_factura}`,
          {
            headers: {
              Authorization: `Bearer ${authState.token}`,
            },
          },
        );

        setNumeroFactura(String(response.data.numero_factura));
        setEstado(response.data.estado);
        setFechaEmision(response.data.fecha_emision.slice(0, 10));
        setFechaVencimiento(
          response.data.fecha_vencimiento?.slice(0, 10) ?? '',
        );
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.data?.message) {
          setError(err.response.data.message);
        } else {
          setError('Ocurrió un error al cargar la factura.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFactura();
  }, [id_factura]);

  const handleSelectEstado = (nuevoEstado: string) => {
    setEstado(nuevoEstado);
    setEstadoModalVisible(false);
  };

  const handleFechaEmisionChange = (
    _event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    setShowFechaEmisionPicker(false);

    if (selectedDate) {
      setFechaEmision(formatDateISO(selectedDate));
    }
  };

  const handleFechaVencimientoChange = (
    _event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    setShowFechaVencimientoPicker(false);

    if (selectedDate) {
      setFechaVencimiento(formatDateISO(selectedDate));
    }
  };

  const handleGuardar = async () => {
    setErrorGuardar('');

    if (!numeroFactura) {
      setErrorGuardar('Ingresa el número de factura.');
      return;
    }

    if (!fechaEmision) {
      setErrorGuardar('Selecciona la fecha de emisión.');
      return;
    }

    if (!estado) {
      setErrorGuardar('Selecciona un estado.');
      return;
    }

    setGuardando(true);

    try {
      await axios.put(
        `${FACTURAS_URL}/${id_factura}`,
        {
          numero_factura: numeroFactura,
          fecha_emision: fechaEmision,
          fecha_vencimiento: fechaVencimiento,
          estado,
        },
        {
          headers: {
            Authorization: `Bearer ${authState.token}`,
          },
        },
      );

      navigation.popTo('FacturasScreen');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setErrorGuardar(err.response.data.message);
      } else {
        setErrorGuardar('Ocurrió un error al guardar la factura.');
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
      <Text style={styles.sectionTitle}>Número de factura</Text>
      <TextInput
        style={styles.input}
        placeholder="Número de factura"
        autoCapitalize="none"
        autoCorrect={false}
        value={numeroFactura}
        onChangeText={setNumeroFactura}
      />

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

      <Text style={styles.sectionTitle}>Fecha de emisión</Text>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setShowFechaEmisionPicker(true)}
      >
        <Text
          style={
            fechaEmision ? styles.selectorText : styles.selectorPlaceholder
          }
        >
          {fechaEmision || 'Selecciona una fecha'}
        </Text>
      </TouchableOpacity>

      {showFechaEmisionPicker ? (
        <DateTimePicker
          value={fechaEmision ? parseISODate(fechaEmision) : new Date()}
          mode="date"
          display="default"
          onChange={handleFechaEmisionChange}
        />
      ) : null}

      <Text style={styles.sectionTitle}>Fecha de vencimiento</Text>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setShowFechaVencimientoPicker(true)}
      >
        <Text
          style={
            fechaVencimiento
              ? styles.selectorText
              : styles.selectorPlaceholder
          }
        >
          {fechaVencimiento || 'Selecciona una fecha'}
        </Text>
      </TouchableOpacity>

      {showFechaVencimientoPicker ? (
        <DateTimePicker
          value={
            fechaVencimiento ? parseISODate(fechaVencimiento) : new Date()
          }
          mode="date"
          display="default"
          onChange={handleFechaVencimientoChange}
        />
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
  error: {
    color: '#D32F2F',
    fontSize: 14,
    marginTop: 8,
  },
});

export default FacturaEditarScreen;
