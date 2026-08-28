import { useLayoutEffect, useState } from 'react';
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

import type { RootStackParamList } from '../../App';
import { setToken } from '../state/auth';

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

const MENU_OPTIONS = [
  'Ver perfil',
  'Cambiar contraseña',
  'Perfil del negocio',
  'PQRS',
  'Cerrar sesión',
] as const;

function HeaderMenuButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.headerButton} onPress={onPress}>
      <Text style={styles.headerButtonText}>⋮</Text>
    </TouchableOpacity>
  );
}

function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [menuModalVisible, setMenuModalVisible] = useState(false);

  const handleLogout = () => {
    setToken(null);
    navigation.navigate('LoginScreen');
  };

  const handleMenuOption = (option: (typeof MENU_OPTIONS)[number]) => {
    setMenuModalVisible(false);

    if (option === 'Cerrar sesión') {
      handleLogout();
    } else if (option === 'Ver perfil') {
      navigation.navigate('PerfilScreen');
    } else if (option === 'PQRS') {
      navigation.navigate('PQRSScreen');
    } else if (option === 'Perfil del negocio') {
      navigation.navigate('PerfilNegocioScreen');
    } else if (option === 'Cambiar contraseña') {
      navigation.navigate('CambiarPasswordScreen');
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderMenuButton onPress={() => setMenuModalVisible(true)} />
      ),
    });
  }, [navigation]);

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
    } else if (moduleKey === 'clientes') {
      navigation.navigate('ClientesScreen');
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

      <Modal
        visible={menuModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setMenuModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Opciones</Text>
            <FlatList
              data={MENU_OPTIONS}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleMenuOption(item)}
                >
                  <Text
                    style={
                      item === 'Cerrar sesión'
                        ? styles.modalItemTextDestructive
                        : styles.modalItemText
                    }
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setMenuModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const CARD_SIZE = '31%';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  headerButtonText: {
    color: '#007AFF',
    fontSize: 22,
    fontWeight: '700',
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
  modalItemTextDestructive: {
    fontSize: 16,
    color: '#D32F2F',
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
