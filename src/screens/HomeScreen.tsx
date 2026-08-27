import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

import type { RootStackParamList } from '../../App';

type Module = {
  key: string;
  label: string;
  icon: string;
};

const MODULES: Module[] = [
  { key: 'pedidos', label: 'Pedidos', icon: '📦' },
  { key: 'inventario', label: 'Inventario', icon: '🗃️' },
  { key: 'productos', label: 'Productos', icon: '🏷️' },
  { key: 'proveedores', label: 'Proveedores', icon: '🚚' },
  { key: 'clientes', label: 'Clientes', icon: '👥' },
  { key: 'facturas', label: 'Facturas', icon: '🧾' },
  { key: 'pagos', label: 'Pagos', icon: '💳' },
  { key: 'bodegas', label: 'Bodegas', icon: '🏭' },
  { key: 'reportes', label: 'Reportes', icon: '📊' },
];

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'HomeScreen'
>;

function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const handlePress = (moduleKey: string) => {
    if (moduleKey === 'pedidos') {
      navigation.navigate('PedidosScreen');
    } else if (moduleKey === 'facturas') {
      navigation.navigate('FacturasScreen');
    } else if (moduleKey === 'inventario') {
      navigation.navigate('InventarioScreen');
    } else if (moduleKey === 'reportes') {
      navigation.navigate('ReportesScreen');
    } else if (moduleKey === 'proveedores') {
      navigation.navigate('ProveedoresScreen');
    } else if (moduleKey === 'pagos') {
      navigation.navigate('PagosScreen');
    } else if (moduleKey === 'productos') {
      navigation.navigate('ProductosScreen');
    } else if (moduleKey === 'bodegas') {
      navigation.navigate('BodegasScreen');
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>SIAPE</Text>

      <View style={styles.grid}>
        {MODULES.map(module => (
          <TouchableOpacity
            key={module.key}
            style={styles.card}
            onPress={() => handlePress(module.key)}
          >
            <Text style={styles.icon}>{module.icon}</Text>
            <Text style={styles.label}>{module.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const CARD_SIZE = '31%';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: CARD_SIZE,
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#f7f7f7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    padding: 8,
  },
  icon: {
    fontSize: 32,
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default HomeScreen;
