import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import VerifyScreen from './src/screens/VerifyScreen';
import PedidosScreen from './src/screens/PedidosScreen';
import PedidoDetalleScreen from './src/screens/PedidoDetalleScreen';
import PedidoNuevoScreen from './src/screens/PedidoNuevoScreen';
import PedidoEditarScreen from './src/screens/PedidoEditarScreen';
import FacturasScreen from './src/screens/FacturasScreen';
import FacturaDetalleScreen from './src/screens/FacturaDetalleScreen';
import FacturaNuevaScreen from './src/screens/FacturaNuevaScreen';
import FacturaEditarScreen from './src/screens/FacturaEditarScreen';
import InventarioScreen from './src/screens/InventarioScreen';
import InventarioEditarScreen from './src/screens/InventarioEditarScreen';
import ReportesScreen from './src/screens/ReportesScreen';
import ProveedoresScreen from './src/screens/ProveedoresScreen';
import ProveedorDetalleScreen from './src/screens/ProveedorDetalleScreen';
import ProveedorNuevoScreen from './src/screens/ProveedorNuevoScreen';
import ProveedorEditarScreen from './src/screens/ProveedorEditarScreen';
import PagosScreen from './src/screens/PagosScreen';
import PagoNuevoScreen from './src/screens/PagoNuevoScreen';
import ProductosScreen from './src/screens/ProductosScreen';
import ProductoDetalleScreen from './src/screens/ProductoDetalleScreen';
import ProductoNuevoScreen from './src/screens/ProductoNuevoScreen';
import ProductoEditarScreen from './src/screens/ProductoEditarScreen';
import BodegasScreen from './src/screens/BodegasScreen';
import BodegaNuevaScreen from './src/screens/BodegaNuevaScreen';
import BodegaEditarScreen from './src/screens/BodegaEditarScreen';
import ClientesScreen from './src/screens/ClientesScreen';
import ClienteNuevoScreen from './src/screens/ClienteNuevoScreen';
import ClienteEditarScreen from './src/screens/ClienteEditarScreen';

export type RootStackParamList = {
  LoginScreen: undefined;
  HomeScreen: undefined;
  VerifyScreen: { userId: string };
  PedidosScreen: undefined;
  PedidoDetalleScreen: { id_pedido_prov: string | number };
  PedidoNuevoScreen: undefined;
  PedidoEditarScreen: { id_pedido_prov: string | number };
  FacturasScreen: undefined;
  FacturaDetalleScreen: { id_factura: string | number };
  FacturaNuevaScreen: undefined;
  FacturaEditarScreen: { id_factura: string | number };
  InventarioScreen: undefined;
  InventarioEditarScreen: {
    id_inventario: string | number;
    producto_id_producto: string | number;
    nombre_producto: string;
  };
  ReportesScreen: undefined;
  ProveedoresScreen: undefined;
  ProveedorDetalleScreen: { id_proveedor: string | number };
  ProveedorNuevoScreen: undefined;
  ProveedorEditarScreen: { id_proveedor: string | number };
  PagosScreen: undefined;
  PagoNuevoScreen: undefined;
  ProductosScreen: undefined;
  ProductoDetalleScreen: { id_producto: string | number };
  ProductoNuevoScreen: undefined;
  ProductoEditarScreen: { id_producto: string | number };
  BodegasScreen: undefined;
  BodegaNuevaScreen: undefined;
  BodegaEditarScreen: { id_bodega: string | number };
  ClientesScreen: undefined;
  ClienteNuevoScreen: undefined;
  ClienteEditarScreen: {
    id_usuario_cli: string | number;
    nombre_usuario: string;
    correo: string;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="LoginScreen">
          <Stack.Screen
            name="LoginScreen"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="HomeScreen"
            component={HomeScreen}
            options={{
              title: 'Inicio',
              headerLeft: () => null,
              headerBackVisible: false,
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name="VerifyScreen"
            component={VerifyScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="PedidosScreen"
            component={PedidosScreen}
            options={{ title: 'Pedidos' }}
          />
          <Stack.Screen
            name="PedidoDetalleScreen"
            component={PedidoDetalleScreen}
            options={{ title: 'Detalle del Pedido' }}
          />
          <Stack.Screen
            name="PedidoNuevoScreen"
            component={PedidoNuevoScreen}
            options={{ title: 'Nuevo Pedido' }}
          />
          <Stack.Screen
            name="PedidoEditarScreen"
            component={PedidoEditarScreen}
            options={{ title: 'Editar Pedido' }}
          />
          <Stack.Screen
            name="FacturasScreen"
            component={FacturasScreen}
            options={{ title: 'Facturas' }}
          />
          <Stack.Screen
            name="FacturaDetalleScreen"
            component={FacturaDetalleScreen}
            options={{ title: 'Detalle de Factura' }}
          />
          <Stack.Screen
            name="FacturaNuevaScreen"
            component={FacturaNuevaScreen}
            options={{ title: 'Nueva Factura' }}
          />
          <Stack.Screen
            name="FacturaEditarScreen"
            component={FacturaEditarScreen}
            options={{ title: 'Editar Factura' }}
          />
          <Stack.Screen
            name="InventarioScreen"
            component={InventarioScreen}
            options={{ title: 'Inventario' }}
          />
          <Stack.Screen
            name="InventarioEditarScreen"
            component={InventarioEditarScreen}
            options={{ title: 'Editar Inventario' }}
          />
          <Stack.Screen
            name="ReportesScreen"
            component={ReportesScreen}
            options={{ title: 'Reportes' }}
          />
          <Stack.Screen
            name="ProveedoresScreen"
            component={ProveedoresScreen}
            options={{ title: 'Proveedores' }}
          />
          <Stack.Screen
            name="ProveedorDetalleScreen"
            component={ProveedorDetalleScreen}
            options={{ title: 'Detalle del Proveedor' }}
          />
          <Stack.Screen
            name="ProveedorNuevoScreen"
            component={ProveedorNuevoScreen}
            options={{ title: 'Nuevo Proveedor' }}
          />
          <Stack.Screen
            name="ProveedorEditarScreen"
            component={ProveedorEditarScreen}
            options={{ title: 'Editar Proveedor' }}
          />
          <Stack.Screen
            name="PagosScreen"
            component={PagosScreen}
            options={{ title: 'Pagos' }}
          />
          <Stack.Screen
            name="PagoNuevoScreen"
            component={PagoNuevoScreen}
            options={{ title: 'Nuevo Pago' }}
          />
          <Stack.Screen
            name="ProductosScreen"
            component={ProductosScreen}
            options={{ title: 'Productos' }}
          />
          <Stack.Screen
            name="ProductoDetalleScreen"
            component={ProductoDetalleScreen}
            options={{ title: 'Detalle del Producto' }}
          />
          <Stack.Screen
            name="ProductoNuevoScreen"
            component={ProductoNuevoScreen}
            options={{ title: 'Nuevo Producto' }}
          />
          <Stack.Screen
            name="ProductoEditarScreen"
            component={ProductoEditarScreen}
            options={{ title: 'Editar Producto' }}
          />
          <Stack.Screen
            name="BodegasScreen"
            component={BodegasScreen}
            options={{ title: 'Bodegas' }}
          />
          <Stack.Screen
            name="BodegaNuevaScreen"
            component={BodegaNuevaScreen}
            options={{ title: 'Nueva Bodega' }}
          />
          <Stack.Screen
            name="BodegaEditarScreen"
            component={BodegaEditarScreen}
            options={{ title: 'Editar Bodega' }}
          />
          <Stack.Screen
            name="ClientesScreen"
            component={ClientesScreen}
            options={{ title: 'Clientes' }}
          />
          <Stack.Screen
            name="ClienteNuevoScreen"
            component={ClienteNuevoScreen}
            options={{ title: 'Nuevo Cliente' }}
          />
          <Stack.Screen
            name="ClienteEditarScreen"
            component={ClienteEditarScreen}
            options={{ title: 'Editar Cliente' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
