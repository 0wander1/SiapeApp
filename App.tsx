import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import VerifyScreen from './src/screens/VerifyScreen';
import PedidosScreen from './src/screens/PedidosScreen';
import PedidoDetalleScreen from './src/screens/PedidoDetalleScreen';

export type RootStackParamList = {
  LoginScreen: undefined;
  HomeScreen: undefined;
  VerifyScreen: { userId: string };
  PedidosScreen: undefined;
  PedidoDetalleScreen: { id_pedido_prov: string | number };
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
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
