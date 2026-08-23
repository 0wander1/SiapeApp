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
import { formatCOP } from '../utils/pedidos';
import { CLIENTES_URL, type Cliente } from '../utils/clientes';
import { PRODUCTOS_URL, type Producto } from '../utils/productos';
import { FACTURAS_URL } from '../utils/facturas';

declare const atob: (data: string) => string;

type ItemFactura = {
  producto_id: string | number;
  nombre_producto: string;
  cantidad: number;
  valor_unitario: number;
};

type FacturaNuevaScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'FacturaNuevaScreen'
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

function FacturaNuevaScreen() {
  const navigation = useNavigation<FacturaNuevaScreenNavigationProp>();

  const [numeroFactura, setNumeroFactura] = useState('');

  const [fechaEmision, setFechaEmision] = useState('');
  const [showFechaEmisionPicker, setShowFechaEmisionPicker] = useState(false);

  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [showFechaVencimientoPicker, setShowFechaVencimientoPicker] =
    useState(false);

  const [estado] = useState('emitida');

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(true);
  const [errorClientes, setErrorClientes] = useState('');
  const [clienteSeleccionado, setClienteSeleccionado] =
    useState<Cliente | null>(null);
  const [clienteModalVisible, setClienteModalVisible] = useState(false);

  const [productos, setProductos] = useState<Producto[]>([]);
  const [loadingProductos, setLoadingProductos] = useState(true);
  const [errorProductos, setErrorProductos] = useState('');

  const [impuesto, setImpuesto] = useState('');
  const [descuento, setDescuento] = useState('');

  const [productoSeleccionado, setProductoSeleccionado] =
    useState<Producto | null>(null);
  const [productoModalVisible, setProductoModalVisible] = useState(false);
  const [cantidad, setCantidad] = useState('');
  const [valorUnitario, setValorUnitario] = useState('');
  const [errorItem, setErrorItem] = useState('');

  const [items, setItems] = useState<ItemFactura[]>([]);

  const [errorGuardar, setErrorGuardar] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const fetchNumeroFactura = async () => {
      try {
        const response = await axios.get(FACTURAS_URL, {
          headers: {
            Authorization: `Bearer ${authState.token}`,
          },
        });

        const facturas = response.data;
        const nextNum = facturas.length + 1;

        setNumeroFactura(
          `F-${new Date().getFullYear()}-${String(nextNum).padStart(3, '0')}`,
        );
      } catch (err) {
        console.error('Error al generar el número de factura:', err);
      }
    };

    fetchNumeroFactura();
  }, []);

  useEffect(() => {
    const fetchClientes = async () => {
      setErrorClientes('');
      setLoadingClientes(true);

      try {
        const response = await axios.get(CLIENTES_URL, {
          headers: {
            Authorization: `Bearer ${authState.token}`,
          },
        });

        setClientes(response.data);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.data?.message) {
          setErrorClientes(err.response.data.message);
        } else {
          setErrorClientes('Ocurrió un error al cargar los clientes.');
        }
      } finally {
        setLoadingClientes(false);
      }
    };

    fetchClientes();
  }, []);

  useEffect(() => {
    const fetchProductos = async () => {
      setErrorProductos('');
      setLoadingProductos(true);

      try {
        const response = await axios.get(PRODUCTOS_URL, {
          headers: {
            Authorization: `Bearer ${authState.token}`,
          },
        });

        setProductos(response.data);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.data?.message) {
          setErrorProductos(err.response.data.message);
        } else {
          setErrorProductos('Ocurrió un error al cargar los productos.');
        }
      } finally {
        setLoadingProductos(false);
      }
    };

    fetchProductos();
  }, []);

  const handleSelectCliente = (cliente: Cliente) => {
    setClienteSeleccionado(cliente);
    setClienteModalVisible(false);
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

  const handleSelectProducto = (producto: Producto) => {
    setProductoSeleccionado(producto);
    setErrorItem('');
    setProductoModalVisible(false);
  };

  const handleAgregarItem = () => {
    setErrorItem('');

    if (!productoSeleccionado) {
      setErrorItem('Selecciona un producto.');
      return;
    }

    const cantidadNum = Number(cantidad);
    const valorUnitarioNum = Number(valorUnitario);

    if (!cantidad || Number.isNaN(cantidadNum) || cantidadNum <= 0) {
      setErrorItem('Ingresa una cantidad válida.');
      return;
    }

    if (
      !valorUnitario ||
      Number.isNaN(valorUnitarioNum) ||
      valorUnitarioNum < 0
    ) {
      setErrorItem('Ingresa un precio unitario válido.');
      return;
    }

    setItems(current => [
      ...current,
      {
        producto_id: productoSeleccionado.id_producto,
        nombre_producto: productoSeleccionado.nombre_producto,
        cantidad: cantidadNum,
        valor_unitario: valorUnitarioNum,
      },
    ]);

    setProductoSeleccionado(null);
    setCantidad('');
    setValorUnitario('');
  };

  const handleQuitarItem = (index: number) => {
    setItems(current => current.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.cantidad * item.valor_unitario,
    0,
  );

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

    if (!clienteSeleccionado) {
      setErrorGuardar('Selecciona un cliente.');
      return;
    }

    if (items.length === 0) {
      setErrorGuardar('Agrega al menos un item a la factura.');
      return;
    }

    if (!authState.token) {
      setErrorGuardar('No se encontró la sesión del usuario.');
      return;
    }

    setGuardando(true);

    try {
      const usuario_trab_id = JSON.parse(
        atob(authState.token.split('.')[1]),
      ).id;

      const impuestoCalculado = subtotal * (Number(impuesto) / 100);
      const descuentoNum = Number(descuento);
      const total = subtotal + impuestoCalculado - descuentoNum;

      await axios.post(
        FACTURAS_URL,
        {
          numero_factura: numeroFactura,
          fecha_emision: fechaEmision,
          fecha_vencimiento: fechaVencimiento,
          subtotal,
          impuesto: impuestoCalculado,
          descuento: descuentoNum,
          total,
          estado,
          cliente_id_cliente: clienteSeleccionado.id_usuario_cli,
          usuario_trab_id,
          productos: items.map(item => ({
            producto_id_producto: item.producto_id,
            cantidad: item.cantidad,
            valor_unitario: item.valor_unitario,
          })),
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

      <Text style={styles.sectionTitle}>Cliente</Text>

      {loadingClientes ? (
        <ActivityIndicator size="small" color="#007AFF" />
      ) : errorClientes ? (
        <Text style={styles.error}>{errorClientes}</Text>
      ) : (
        <TouchableOpacity
          style={styles.selector}
          onPress={() => setClienteModalVisible(true)}
        >
          <Text
            style={
              clienteSeleccionado
                ? styles.selectorText
                : styles.selectorPlaceholder
            }
          >
            {clienteSeleccionado
              ? clienteSeleccionado.nombre_usuario
              : 'Selecciona un cliente'}
          </Text>
        </TouchableOpacity>
      )}

      <Modal
        visible={clienteModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setClienteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecciona un cliente</Text>
            <FlatList
              data={clientes}
              keyExtractor={item => String(item.id_usuario_cli)}
              ListEmptyComponent={
                <Text style={styles.empty}>No hay clientes disponibles.</Text>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleSelectCliente(item)}
                >
                  <Text style={styles.modalItemText}>
                    {item.nombre_usuario}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setClienteModalVisible(false)}
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

      <Text style={styles.sectionTitle}>Estado</Text>
      <View style={styles.selector}>
        <Text style={styles.selectorText}>{estado}</Text>
      </View>

      <Text style={styles.sectionTitle}>Impuesto</Text>
      <TextInput
        style={styles.input}
        placeholder="Impuesto"
        keyboardType="numeric"
        value={impuesto}
        onChangeText={setImpuesto}
      />

      <Text style={styles.sectionTitle}>Descuento</Text>
      <TextInput
        style={styles.input}
        placeholder="Descuento"
        keyboardType="numeric"
        value={descuento}
        onChangeText={setDescuento}
      />

      <Text style={styles.sectionTitle}>Agregar item</Text>

      {loadingProductos ? (
        <ActivityIndicator size="small" color="#007AFF" />
      ) : errorProductos ? (
        <Text style={styles.error}>{errorProductos}</Text>
      ) : (
        <TouchableOpacity
          style={styles.selector}
          onPress={() => setProductoModalVisible(true)}
        >
          <Text
            style={
              productoSeleccionado
                ? styles.selectorText
                : styles.selectorPlaceholder
            }
          >
            {productoSeleccionado
              ? productoSeleccionado.nombre_producto
              : 'Selecciona un producto'}
          </Text>
        </TouchableOpacity>
      )}

      <Modal
        visible={productoModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setProductoModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecciona un producto</Text>
            <FlatList
              data={productos}
              keyExtractor={item => String(item.id_producto)}
              ListEmptyComponent={
                <Text style={styles.empty}>
                  No hay productos disponibles.
                </Text>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleSelectProducto(item)}
                >
                  <Text style={styles.modalItemText}>
                    {item.nombre_producto}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setProductoModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.itemForm}>
        <TextInput
          style={[styles.input, styles.itemInput]}
          placeholder="Cantidad"
          keyboardType="numeric"
          value={cantidad}
          onChangeText={setCantidad}
        />
        <TextInput
          style={[styles.input, styles.itemInput]}
          placeholder="Precio unitario"
          keyboardType="numeric"
          value={valorUnitario}
          onChangeText={setValorUnitario}
        />
      </View>

      {errorItem ? <Text style={styles.error}>{errorItem}</Text> : null}

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={handleAgregarItem}
      >
        <Text style={styles.secondaryButtonText}>Agregar Item</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Items</Text>

      {items.length === 0 ? (
        <Text style={styles.empty}>Aún no has agregado items.</Text>
      ) : (
        items.map((item, index) => (
          <View
            key={`${item.producto_id}-${index}`}
            style={styles.itemRow}
          >
            <View style={styles.itemInfo}>
              <Text style={styles.itemNombre}>{item.nombre_producto}</Text>
              <Text style={styles.itemDetalle}>
                {item.cantidad} x {formatCOP(item.valor_unitario)} ={' '}
                {formatCOP(item.cantidad * item.valor_unitario)}
              </Text>
            </View>
            <TouchableOpacity onPress={() => handleQuitarItem(index)}>
              <Text style={styles.removeText}>Quitar</Text>
            </TouchableOpacity>
          </View>
        ))
      )}

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Subtotal</Text>
        <Text style={styles.totalValue}>{formatCOP(subtotal)}</Text>
      </View>

      {errorGuardar ? <Text style={styles.error}>{errorGuardar}</Text> : null}

      <TouchableOpacity
        style={styles.button}
        onPress={handleGuardar}
        disabled={guardando}
      >
        <Text style={styles.buttonText}>
          {guardando ? 'Guardando...' : 'Guardar Factura'}
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
  itemForm: {
    flexDirection: 'row',
    marginTop: 8,
  },
  itemInput: {
    flex: 1,
    marginRight: 8,
  },
  secondaryButton: {
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 15,
    fontWeight: '600',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#f7f7f7',
    padding: 12,
    marginBottom: 8,
  },
  itemInfo: {
    flex: 1,
    marginRight: 8,
  },
  itemNombre: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  itemDetalle: {
    fontSize: 13,
    color: '#555',
  },
  removeText: {
    color: '#D32F2F',
    fontSize: 13,
    fontWeight: '600',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginTop: 16,
    paddingTop: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
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

export default FacturaNuevaScreen;
