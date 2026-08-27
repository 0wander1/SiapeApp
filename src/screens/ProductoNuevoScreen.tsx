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
import { PRODUCTOS_URL } from '../utils/productos';
import { BODEGAS_URL, type Bodega } from '../utils/bodegas';

type ProductoNuevoScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ProductoNuevoScreen'
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

function ProductoNuevoScreen() {
  const navigation = useNavigation<ProductoNuevoScreenNavigationProp>();

  const [nombreProducto, setNombreProducto] = useState('');
  const [valorNeto, setValorNeto] = useState('');
  const [valorDeVenta, setValorDeVenta] = useState('');
  const [lote, setLote] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [cantidad, setCantidad] = useState('');
  const [cantidadMinima, setCantidadMinima] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const [bodegas, setBodegas] = useState<Bodega[]>([]);
  const [loadingBodegas, setLoadingBodegas] = useState(true);
  const [errorBodegas, setErrorBodegas] = useState('');
  const [bodegaSeleccionada, setBodegaSeleccionada] = useState<Bodega | null>(
    null,
  );
  const [bodegaModalVisible, setBodegaModalVisible] = useState(false);

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
      setFechaVencimiento(formatDateISO(selectedDate));
    }
  };

  const handleGuardar = async () => {
    setError('');

    if (!nombreProducto.trim()) {
      setError('Ingresa el nombre del producto.');
      return;
    }

    const valorNetoNum = Number(valorNeto);

    if (!valorNeto.trim() || Number.isNaN(valorNetoNum)) {
      setError('Ingresa un valor neto válido.');
      return;
    }

    const valorDeVentaNum = Number(valorDeVenta);

    if (!valorDeVenta.trim() || Number.isNaN(valorDeVentaNum)) {
      setError('Ingresa un valor de venta válido.');
      return;
    }

    const cantidadNum = Number(cantidad);

    if (!cantidad.trim() || Number.isNaN(cantidadNum)) {
      setError('Ingresa una cantidad válida.');
      return;
    }

    const cantidadMinimaNum = Number(cantidadMinima);

    if (!cantidadMinima.trim() || Number.isNaN(cantidadMinimaNum)) {
      setError('Ingresa una cantidad mínima válida.');
      return;
    }

    if (!bodegaSeleccionada) {
      setError('Selecciona una bodega.');
      return;
    }

    setGuardando(true);

    try {
      await axios.post(
        PRODUCTOS_URL,
        {
          nombre_producto: nombreProducto.trim(),
          valor_neto: valorNetoNum,
          valor_de_venta: valorDeVentaNum,
          lote: lote.trim() || undefined,
          fecha_vencimiento: fechaVencimiento || undefined,
          bodega_id_bodega: bodegaSeleccionada.id_bodega,
          cantidad: cantidadNum,
          cantidad_minima: cantidadMinimaNum,
        },
        {
          headers: {
            Authorization: `Bearer ${authState.token}`,
          },
        },
      );

      navigation.popTo('ProductosScreen');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Ocurrió un error al guardar el producto.');
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
      <Text style={styles.sectionTitle}>Nombre del producto</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre del producto"
        value={nombreProducto}
        onChangeText={setNombreProducto}
      />

      <Text style={styles.sectionTitle}>Valor neto</Text>
      <TextInput
        style={styles.input}
        placeholder="Valor neto"
        keyboardType="numeric"
        value={valorNeto}
        onChangeText={setValorNeto}
      />

      <Text style={styles.sectionTitle}>Valor de venta</Text>
      <TextInput
        style={styles.input}
        placeholder="Valor de venta"
        keyboardType="numeric"
        value={valorDeVenta}
        onChangeText={setValorDeVenta}
      />

      <Text style={styles.sectionTitle}>Lote</Text>
      <TextInput
        style={styles.input}
        placeholder="Lote"
        value={lote}
        onChangeText={setLote}
      />

      <Text style={styles.sectionTitle}>Fecha de vencimiento</Text>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setShowDatePicker(true)}
      >
        <Text
          style={
            fechaVencimiento ? styles.selectorText : styles.selectorPlaceholder
          }
        >
          {fechaVencimiento || 'Selecciona una fecha'}
        </Text>
      </TouchableOpacity>

      {showDatePicker ? (
        <DateTimePicker
          value={fechaVencimiento ? parseISODate(fechaVencimiento) : new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      ) : null}

      <Text style={styles.sectionTitle}>Cantidad</Text>
      <TextInput
        style={styles.input}
        placeholder="Cantidad"
        keyboardType="numeric"
        value={cantidad}
        onChangeText={setCantidad}
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

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity
        style={styles.button}
        onPress={handleGuardar}
        disabled={guardando}
      >
        <Text style={styles.buttonText}>
          {guardando ? 'Guardando...' : 'Guardar Producto'}
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
  empty: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginTop: 16,
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

export default ProductoNuevoScreen;
