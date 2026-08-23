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
import { PEDIDOS_URL, formatCOP } from '../utils/pedidos';
import {
  PROVEEDORES_URL,
  type Proveedor,
  type ProveedorDetalle,
} from '../utils/proveedores';

const PRODUCTOS_URL = 'https://siape-production.up.railway.app/api/productos';

declare const atob: (data: string) => string;

type PedidoNuevoScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'PedidoNuevoScreen'
>;

type ItemPedido = {
  producto_id_producto: string | number;
  nombre_producto: string;
  cantidad: number;
  precio_unitario: number;
};

type ProductoCatalogo = {
  id_producto: string | number;
  nombre_producto: string;
  [key: string]: unknown;
};

type ProductoProveedor = {
  id_prod_prov: string | number;
  producto_id_producto: string | number;
  nombre_producto: string;
  precio_compra?: number;
};

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

function PedidoNuevoScreen() {
  const navigation = useNavigation<PedidoNuevoScreenNavigationProp>();

  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loadingProveedores, setLoadingProveedores] = useState(true);
  const [errorProveedores, setErrorProveedores] = useState('');

  const [proveedorSeleccionado, setProveedorSeleccionado] =
    useState<Proveedor | null>(null);
  const [productos, setProductos] = useState<ProductoProveedor[]>([]);
  const [loadingProductos, setLoadingProductos] = useState(false);
  const [errorProductos, setErrorProductos] = useState('');

  const [fechaEstimada, setFechaEstimada] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [observaciones, setObservaciones] = useState('');

  const [productoSeleccionado, setProductoSeleccionado] =
    useState<ProductoProveedor | null>(null);
  const [cantidad, setCantidad] = useState('');
  const [precioUnitario, setPrecioUnitario] = useState('');
  const [errorItem, setErrorItem] = useState('');

  const [items, setItems] = useState<ItemPedido[]>([]);

  const [errorGuardar, setErrorGuardar] = useState('');
  const [guardando, setGuardando] = useState(false);

  const [proveedorModalVisible, setProveedorModalVisible] = useState(false);
  const [productoModalVisible, setProductoModalVisible] = useState(false);

  const [todosLosProductos, setTodosLosProductos] = useState<
    ProductoCatalogo[]
  >([]);

  useEffect(() => {
    const fetchTodosLosProductos = async () => {
      try {
        const response = await axios.get(PRODUCTOS_URL, {
          headers: {
            Authorization: `Bearer ${authState.token}`,
          },
        });

        setTodosLosProductos(response.data);
      } catch (err) {
        console.error('Error al cargar todos los productos:', err);
      }
    };

    fetchTodosLosProductos();
  }, []);

  useEffect(() => {
    const fetchProveedores = async () => {
      setErrorProveedores('');
      setLoadingProveedores(true);

      try {
        const response = await axios.get(PROVEEDORES_URL, {
          headers: {
            Authorization: `Bearer ${authState.token}`,
          },
        });

        setProveedores(response.data);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.data?.message) {
          setErrorProveedores(err.response.data.message);
        } else {
          setErrorProveedores('Ocurrió un error al cargar los proveedores.');
        }
      } finally {
        setLoadingProveedores(false);
      }
    };

    fetchProveedores();
  }, []);

  const handleDateChange = (
    _event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    setShowDatePicker(false);

    if (selectedDate) {
      setFechaEstimada(formatDateISO(selectedDate));
    }
  };

  const handleSelectProveedor = async (proveedor: Proveedor) => {
    setProveedorSeleccionado(proveedor);
    setProductos([]);
    setProductoSeleccionado(null);
    setCantidad('');
    setPrecioUnitario('');
    setErrorItem('');
    setErrorProductos('');
    setProveedorModalVisible(false);
    setLoadingProductos(true);

    try {
      const response = await axios.get<ProveedorDetalle>(
        `${PROVEEDORES_URL}/${proveedor.id_proveedor}`,
        {
          headers: {
            Authorization: `Bearer ${authState.token}`,
          },
        },
      );

      const productosAsociados = response.data.productos_asociados ?? [];
      const productosConNombre: ProductoProveedor[] = productosAsociados.map(
        item => {
          const productoCatalogo = todosLosProductos.find(
            catalogo => catalogo.id_producto === item.producto_id_producto,
          );

          return {
            id_prod_prov: item.id_prod_prov,
            producto_id_producto: item.producto_id_producto,
            nombre_producto: productoCatalogo?.nombre_producto ?? '',
            precio_compra: item.precio_compra,
          };
        },
      );

      setProductos(productosConNombre);
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

  const handleSelectProducto = (producto: ProductoProveedor) => {
    setProductoSeleccionado(producto);
    setPrecioUnitario(
      producto.precio_compra != null ? String(producto.precio_compra) : '',
    );
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
    const precioNum = Number(precioUnitario);

    if (!cantidad || Number.isNaN(cantidadNum) || cantidadNum <= 0) {
      setErrorItem('Ingresa una cantidad válida.');
      return;
    }

    if (!precioUnitario || Number.isNaN(precioNum) || precioNum < 0) {
      setErrorItem('Ingresa un precio unitario válido.');
      return;
    }

    setItems(current => [
      ...current,
      {
        producto_id_producto: productoSeleccionado.producto_id_producto,
        nombre_producto: productoSeleccionado.nombre_producto,
        cantidad: cantidadNum,
        precio_unitario: precioNum,
      },
    ]);

    setProductoSeleccionado(null);
    setCantidad('');
    setPrecioUnitario('');
  };

  const handleQuitarItem = (index: number) => {
    setItems(current => current.filter((_, i) => i !== index));
  };

  const valorTotal = items.reduce(
    (sum, item) => sum + item.cantidad * item.precio_unitario,
    0,
  );

  const handleGuardar = async () => {
    setErrorGuardar('');

    if (!proveedorSeleccionado) {
      setErrorGuardar('Selecciona un proveedor.');
      return;
    }

    if (!fechaEstimada) {
      setErrorGuardar('Ingresa la fecha estimada.');
      return;
    }

    if (items.length === 0) {
      setErrorGuardar('Agrega al menos un item al pedido.');
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

      await axios.post(
        PEDIDOS_URL,
        {
          proveedor_id_proveedor: proveedorSeleccionado.id_proveedor,
          usuario_trab_id,
          fecha_estimada: fechaEstimada,
          estado: 'pendiente',
          observaciones: observaciones || null,
          valor_total: valorTotal,
          items: items.map(item => ({
            producto_id_producto: item.producto_id_producto,
            cantidad: item.cantidad,
            precio_unitario: item.precio_unitario,
          })),
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

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.sectionTitle}>Proveedor</Text>

      {loadingProveedores ? (
        <ActivityIndicator size="small" color="#007AFF" />
      ) : errorProveedores ? (
        <Text style={styles.error}>{errorProveedores}</Text>
      ) : (
        <TouchableOpacity
          style={styles.selector}
          onPress={() => setProveedorModalVisible(true)}
        >
          <Text
            style={
              proveedorSeleccionado
                ? styles.selectorText
                : styles.selectorPlaceholder
            }
          >
            {proveedorSeleccionado
              ? proveedorSeleccionado.nombre_proveedor
              : 'Selecciona un proveedor'}
          </Text>
        </TouchableOpacity>
      )}

      <Modal
        visible={proveedorModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setProveedorModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecciona un proveedor</Text>
            <FlatList
              data={proveedores}
              keyExtractor={item => String(item.id_proveedor)}
              ListEmptyComponent={
                <Text style={styles.empty}>
                  No hay proveedores disponibles.
                </Text>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleSelectProveedor(item)}
                >
                  <Text style={styles.modalItemText}>
                    {item.nombre_proveedor}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setProveedorModalVisible(false)}
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

      {proveedorSeleccionado ? (
        <>
          <Text style={styles.sectionTitle}>Agregar producto</Text>

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
                  keyExtractor={item => String(item.id_prod_prov)}
                  ListEmptyComponent={
                    <Text style={styles.empty}>
                      Este proveedor no tiene productos.
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
              value={precioUnitario}
              onChangeText={setPrecioUnitario}
            />
          </View>

          {errorItem ? <Text style={styles.error}>{errorItem}</Text> : null}

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleAgregarItem}
          >
            <Text style={styles.secondaryButtonText}>Agregar item</Text>
          </TouchableOpacity>
        </>
      ) : null}

      <Text style={styles.sectionTitle}>Items del pedido</Text>

      {items.length === 0 ? (
        <Text style={styles.empty}>Aún no has agregado items.</Text>
      ) : (
        items.map((item, index) => (
          <View key={`${item.producto_id_producto}-${index}`} style={styles.itemRow}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemNombre}>{item.nombre_producto}</Text>
              <Text style={styles.itemDetalle}>
                {item.cantidad} x {formatCOP(item.precio_unitario)} ={' '}
                {formatCOP(item.cantidad * item.precio_unitario)}
              </Text>
            </View>
            <TouchableOpacity onPress={() => handleQuitarItem(index)}>
              <Text style={styles.removeText}>Quitar</Text>
            </TouchableOpacity>
          </View>
        ))
      )}

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Valor total</Text>
        <Text style={styles.totalValue}>{formatCOP(valorTotal)}</Text>
      </View>

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

export default PedidoNuevoScreen;
