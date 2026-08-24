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
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
