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
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';

import type { RootStackParamList } from '../../App';
import { authState } from '../state/auth';
import { PAGOS_URL, type Pago } from '../utils/pagos';
import { FACTURAS_URL, type Factura } from '../utils/facturas';
import { formatCOP } from '../utils/pedidos';

declare const atob: (data: string) => string;

const METODOS_PAGO = ['efectivo', 'transferencia', 'tarjeta', 'cheque'];

const ESTADOS_FACTURA_PAGABLE = ['emitida', 'parcial'];

type PagoNuevoScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'PagoNuevoScreen'
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

function PagoNuevoScreen() {
  const navigation = useNavigation<PagoNuevoScreenNavigationProp>();

  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [loadingFacturas, setLoadingFacturas] = useState(true);
  const [errorFacturas, setErrorFacturas] = useState('');
  const [facturaSeleccionada, setFacturaSeleccionada] =
    useState<Factura | null>(null);
  const [facturaModalVisible, setFacturaModalVisible] = useState(false);

  const [totalPagado, setTotalPagado] = useState(0);
  const [loadingSaldo, setLoadingSaldo] = useState(false);
  const [errorSaldo, setErrorSaldo] = useState('');

  const [montoPagado, setMontoPagado] = useState('');

  const [fechaPago, setFechaPago] = useState('');
  const [showFechaPagoPicker, setShowFechaPagoPicker] = useState(false);

  const [metodoPago, setMetodoPago] = useState('');
  const [metodoPagoModalVisible, setMetodoPagoModalVisible] = useState(false);

  const [referenciaTransaccion, setReferenciaTransaccion] = useState('');

  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const fetchFacturas = async () => {
      setErrorFacturas('');
      setLoadingFacturas(true);

      try {
        const response = await axios.get<Factura[]>(FACTURAS_URL, {
          headers: {
            Authorization: `Bearer ${authState.token}`,
          },
        });

        setFacturas(
          response.data.filter(factura =>
            ESTADOS_FACTURA_PAGABLE.includes(factura.estado),
          ),
        );
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.data?.message) {
          setErrorFacturas(err.response.data.message);
        } else {
          setErrorFacturas('Ocurrió un error al cargar las facturas.');
        }
      } finally {
        setLoadingFacturas(false);
      }
    };

    fetchFacturas();
  }, []);

  useEffect(() => {
    if (!facturaSeleccionada) {
      setTotalPagado(0);
      setErrorSaldo('');
      return;
    }

    const fetchPagosFactura = async () => {
      setErrorSaldo('');
      setLoadingSaldo(true);

      try {
        const response = await axios.get<Pago[]>(PAGOS_URL, {
          headers: {
            Authorization: `Bearer ${authState.token}`,
          },
        });

        const pagosFactura = response.data.filter(
          pago =>
            pago.factura_id_factura === facturaSeleccionada.id_factura,
        );

        setTotalPagado(
          pagosFactura.reduce((sum, pago) => sum + pago.monto_pagado, 0),
        );
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.data?.message) {
          setErrorSaldo(err.response.data.message);
        } else {
          setErrorSaldo('Ocurrió un error al calcular el saldo pendiente.');
        }
      } finally {
        setLoadingSaldo(false);
      }
    };

    fetchPagosFactura();
  }, [facturaSeleccionada]);

  const handleSelectFactura = (factura: Factura) => {
    setFacturaSeleccionada(factura);
    setFacturaModalVisible(false);
  };

  const handleSelectMetodoPago = (metodo: string) => {
    setMetodoPago(metodo);
    setMetodoPagoModalVisible(false);
  };

  const handleFechaPagoChange = (
    _event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    setShowFechaPagoPicker(false);

    if (selectedDate) {
      setFechaPago(formatDateISO(selectedDate));
    }
  };

  const handleGuardar = async () => {
    setError('');

    if (!facturaSeleccionada) {
      setError('Selecciona una factura.');
      return;
    }

    const montoPagadoNum = Number(montoPagado);

    if (!montoPagado || Number.isNaN(montoPagadoNum) || montoPagadoNum <= 0) {
      setError('Ingresa un monto pagado válido.');
      return;
    }

    if (!fechaPago) {
      setError('Selecciona la fecha de pago.');
      return;
    }

    if (!metodoPago) {
      setError('Selecciona el método de pago.');
      return;
    }

    if (!authState.token) {
      setError('No se encontró la sesión del usuario.');
      return;
    }

    setGuardando(true);

    try {
      const usuario_trab_id_usuario_trab = JSON.parse(
        atob(authState.token.split('.')[1]),
      ).id;

      await axios.post(
        PAGOS_URL,
        {
          factura_id_factura: facturaSeleccionada.id_factura,
          monto_pagado: montoPagadoNum,
          fecha_pago: fechaPago,
          metodo_pago: metodoPago,
          referencia_transaccion: referenciaTransaccion.trim() || undefined,
          usuario_trab_id_usuario_trab,
        },
        {
          headers: {
            Authorization: `Bearer ${authState.token}`,
          },
        },
      );

      navigation.popTo('PagosScreen');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Ocurrió un error al guardar el pago.');
      }
    } finally {
      setGuardando(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.sectionTitle}>Factura</Text>

      {loadingFacturas ? (
        <ActivityIndicator size="small" color="#007AFF" />
      ) : errorFacturas ? (
        <Text style={styles.error}>{errorFacturas}</Text>
      ) : (
        <TouchableOpacity
          style={styles.selector}
          onPress={() => setFacturaModalVisible(true)}
        >
          <Text
            style={
              facturaSeleccionada
                ? styles.selectorText
                : styles.selectorPlaceholder
            }
          >
            {facturaSeleccionada
              ? `Factura #${facturaSeleccionada.numero_factura}`
              : 'Selecciona una factura'}
          </Text>
        </TouchableOpacity>
      )}

      <Modal
        visible={facturaModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setFacturaModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecciona una factura</Text>
            <FlatList
              data={facturas}
              keyExtractor={item => String(item.id_factura)}
              ListEmptyComponent={
                <Text style={styles.empty}>
                  No hay facturas emitidas o parciales disponibles.
                </Text>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleSelectFactura(item)}
                >
                  <Text style={styles.modalItemText}>
                    Factura #{item.numero_factura} ({item.estado})
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setFacturaModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {facturaSeleccionada ? (
        <View style={styles.saldoCard}>
          <Text style={styles.saldoLabel}>
            Total factura: {formatCOP(facturaSeleccionada.total)}
          </Text>
          {loadingSaldo ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : errorSaldo ? (
            <Text style={styles.error}>{errorSaldo}</Text>
          ) : (
            <Text style={styles.saldoLabel}>
              Saldo pendiente:{' '}
              {formatCOP(facturaSeleccionada.total - totalPagado)}
            </Text>
          )}
        </View>
      ) : null}

      <Text style={styles.sectionTitle}>Monto pagado</Text>
      <TextInput
        style={styles.input}
        placeholder="Monto pagado"
        keyboardType="numeric"
        value={montoPagado}
        onChangeText={setMontoPagado}
      />

      <Text style={styles.sectionTitle}>Fecha de pago</Text>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setShowFechaPagoPicker(true)}
      >
        <Text
          style={fechaPago ? styles.selectorText : styles.selectorPlaceholder}
        >
          {fechaPago || 'Selecciona una fecha'}
        </Text>
      </TouchableOpacity>

      {showFechaPagoPicker ? (
        <DateTimePicker
          value={fechaPago ? parseISODate(fechaPago) : new Date()}
          mode="date"
          display="default"
          onChange={handleFechaPagoChange}
        />
      ) : null}

      <Text style={styles.sectionTitle}>Método de pago</Text>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setMetodoPagoModalVisible(true)}
      >
        <Text
          style={
            metodoPago ? styles.selectorText : styles.selectorPlaceholder
          }
        >
          {metodoPago || 'Selecciona un método de pago'}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={metodoPagoModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setMetodoPagoModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecciona un método de pago</Text>
            <FlatList
              data={METODOS_PAGO}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleSelectMetodoPago(item)}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setMetodoPagoModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Text style={styles.sectionTitle}>Referencia de transacción</Text>
      <TextInput
        style={styles.input}
        placeholder="Referencia de transacción (opcional)"
        autoCapitalize="none"
        autoCorrect={false}
        value={referenciaTransaccion}
        onChangeText={setReferenciaTransaccion}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity
        style={styles.button}
        onPress={handleGuardar}
        disabled={guardando}
      >
        <Text style={styles.buttonText}>
          {guardando ? 'Guardando...' : 'Guardar Pago'}
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
  saldoCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#f7f7f7',
    padding: 12,
    marginTop: 12,
  },
  saldoLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
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

export default PagoNuevoScreen;
