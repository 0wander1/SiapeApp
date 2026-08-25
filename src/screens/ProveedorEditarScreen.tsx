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
import {
  PROVEEDORES_URL,
  type ProveedorDetalle,
  type Producto,
} from '../utils/proveedores';
import {
  PRODUCTOS_URL,
  type Producto as ProductoCatalogo,
} from '../utils/productos';

declare const atob: (data: string) => string;

type ProductoAsociadoForm = {
  producto_id_producto: string | number;
  nombre_producto: string;
  esPrincipal: boolean;
};

type ProveedorEditarScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ProveedorEditarScreen'
>;

type ProveedorEditarScreenRouteProp = RouteProp<
  RootStackParamList,
  'ProveedorEditarScreen'
>;

function ProveedorEditarScreen() {
  const navigation = useNavigation<ProveedorEditarScreenNavigationProp>();
  const route = useRoute<ProveedorEditarScreenRouteProp>();
  const { id_proveedor } = route.params;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [nombreProveedor, setNombreProveedor] = useState('');
  const [nit, setNit] = useState('');

  const [productosCatalogo, setProductosCatalogo] = useState<
    ProductoCatalogo[]
  >([]);
  const [loadingProductos, setLoadingProductos] = useState(true);
  const [errorProductos, setErrorProductos] = useState('');

  const [productoModalVisible, setProductoModalVisible] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] =
    useState<ProductoCatalogo | null>(null);
  const [errorAgregar, setErrorAgregar] = useState('');

  const [productosAsociadosRaw, setProductosAsociadosRaw] = useState<
    Producto[]
  >([]);
  const [productosAgregados, setProductosAgregados] = useState<
    ProductoAsociadoForm[]
  >([]);

  const [errorGuardar, setErrorGuardar] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const fetchProveedor = async () => {
      setError('');
      setLoading(true);

      try {
        const response = await axios.get<ProveedorDetalle>(
          `${PROVEEDORES_URL}/${id_proveedor}`,
          {
            headers: {
              Authorization: `Bearer ${authState.token}`,
            },
          },
        );

        setNombreProveedor(response.data.nombre_proveedor);
        setNit(response.data.NIT ?? '');
        setProductosAsociadosRaw(response.data.productos_asociados ?? []);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.data?.message) {
          setError(err.response.data.message);
        } else {
          setError('Ocurrió un error al cargar el proveedor.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProveedor();
  }, [id_proveedor]);

  useEffect(() => {
    const fetchProductos = async () => {
      setErrorProductos('');
      setLoadingProductos(true);

      try {
        const response = await axios.get<ProductoCatalogo[]>(PRODUCTOS_URL, {
          headers: {
            Authorization: `Bearer ${authState.token}`,
          },
        });

        setProductosCatalogo(response.data);
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

  useEffect(() => {
    setProductosAgregados(
      productosAsociadosRaw.map(item => {
        const catalogo = productosCatalogo.find(
          producto => producto.id_producto === item.producto_id_producto,
        );

        return {
          producto_id_producto: item.producto_id_producto,
          nombre_producto: catalogo?.nombre_producto ?? item.nombre,
          esPrincipal: item.es_proveedor_principal ?? false,
        };
      }),
    );
  }, [productosAsociadosRaw, productosCatalogo]);

  const handleSelectProducto = (producto: ProductoCatalogo) => {
    setProductoSeleccionado(producto);
    setErrorAgregar('');
    setProductoModalVisible(false);
  };

  const handleAgregarProducto = () => {
    setErrorAgregar('');

    if (!productoSeleccionado) {
      setErrorAgregar('Selecciona un producto.');
      return;
    }

    const yaAgregado = productosAgregados.some(
      item => item.producto_id_producto === productoSeleccionado.id_producto,
    );

    if (yaAgregado) {
      setErrorAgregar('Este producto ya fue agregado.');
      return;
    }

    setProductosAgregados(current => [
      ...current,
      {
        producto_id_producto: productoSeleccionado.id_producto,
        nombre_producto: productoSeleccionado.nombre_producto,
        esPrincipal: false,
      },
    ]);

    setProductoSeleccionado(null);
  };

  const handleQuitarProducto = (producto_id_producto: string | number) => {
    setProductosAgregados(current =>
      current.filter(
        item => item.producto_id_producto !== producto_id_producto,
      ),
    );
  };

  const handleTogglePrincipal = (producto_id_producto: string | number) => {
    setProductosAgregados(current =>
      current.map(item =>
        item.producto_id_producto === producto_id_producto
          ? { ...item, esPrincipal: !item.esPrincipal }
          : item,
      ),
    );
  };

  const handleGuardar = async () => {
    setErrorGuardar('');

    if (!nombreProveedor.trim()) {
      setErrorGuardar('Ingresa el nombre del proveedor.');
      return;
    }

    if (!nit.trim()) {
      setErrorGuardar('Ingresa el NIT del proveedor.');
      return;
    }

    if (!authState.token) {
      setErrorGuardar('No se encontró la sesión del usuario.');
      return;
    }

    setGuardando(true);

    try {
      const id_usuario_trab = JSON.parse(
        atob(authState.token.split('.')[1]),
      ).id;

      await axios.put(
        `${PROVEEDORES_URL}/${id_proveedor}`,
        {
          nombre_proveedor: nombreProveedor.trim(),
          NIT: nit.trim(),
          id_usuario_trab,
          productos_asociados: productosAgregados.map(item => ({
            producto_id_producto: item.producto_id_producto,
            esPrincipal: item.esPrincipal,
          })),
        },
        {
          headers: {
            Authorization: `Bearer ${authState.token}`,
          },
        },
      );

      navigation.popTo('ProveedoresScreen');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setErrorGuardar(err.response.data.message);
      } else {
        setErrorGuardar('Ocurrió un error al guardar el proveedor.');
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
      <Text style={styles.sectionTitle}>Nombre del proveedor</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre del proveedor"
        value={nombreProveedor}
        onChangeText={setNombreProveedor}
      />

      <Text style={styles.sectionTitle}>NIT</Text>
      <TextInput
        style={styles.input}
        placeholder="NIT"
        autoCapitalize="none"
        autoCorrect={false}
        value={nit}
        onChangeText={setNit}
      />

      <Text style={styles.sectionTitle}>Productos asociados</Text>

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
              data={productosCatalogo}
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

      {errorAgregar ? <Text style={styles.error}>{errorAgregar}</Text> : null}

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={handleAgregarProducto}
      >
        <Text style={styles.secondaryButtonText}>Agregar</Text>
      </TouchableOpacity>

      {productosAgregados.length === 0 ? (
        <Text style={styles.empty}>Aún no has agregado productos.</Text>
      ) : (
        productosAgregados.map(item => (
          <View key={String(item.producto_id_producto)} style={styles.itemRow}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemNombre}>{item.nombre_producto}</Text>
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() =>
                  handleTogglePrincipal(item.producto_id_producto)
                }
              >
                <View
                  style={[
                    styles.checkbox,
                    item.esPrincipal && styles.checkboxChecked,
                  ]}
                />
                <Text style={styles.checkboxLabel}>Principal</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() => handleQuitarProducto(item.producto_id_producto)}
            >
              <Text style={styles.removeText}>Quitar</Text>
            </TouchableOpacity>
          </View>
        ))
      )}

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
    marginTop: 12,
  },
  itemInfo: {
    flex: 1,
    marginRight: 8,
  },
  itemNombre: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#007AFF',
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
  },
  checkboxLabel: {
    fontSize: 13,
    color: '#555',
  },
  removeText: {
    color: '#D32F2F',
    fontSize: 13,
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
    marginTop: 8,
  },
  error: {
    color: '#D32F2F',
    fontSize: 14,
    marginTop: 8,
  },
});

export default ProveedorEditarScreen;
