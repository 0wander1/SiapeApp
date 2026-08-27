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
import { BODEGAS_URL, TIPOS_BODEGA, type Bodega } from '../utils/bodegas';

type BodegaEditarScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'BodegaEditarScreen'
>;

type BodegaEditarScreenRouteProp = RouteProp<
  RootStackParamList,
  'BodegaEditarScreen'
>;

function BodegaEditarScreen() {
  const navigation = useNavigation<BodegaEditarScreenNavigationProp>();
  const route = useRoute<BodegaEditarScreenRouteProp>();
  const { id_bodega } = route.params;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [descripcion, setDescripcion] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [tipoBodega, setTipoBodega] = useState('');
  const [tipoBodegaModalVisible, setTipoBodegaModalVisible] = useState(false);
  const [capacidadMaxima, setCapacidadMaxima] = useState('');
  const [capacidadActual, setCapacidadActual] = useState('');

  const [errorGuardar, setErrorGuardar] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const fetchBodega = async () => {
      setError('');
      setLoading(true);

      try {
        const response = await axios.get<Bodega>(
          `${BODEGAS_URL}/${id_bodega}`,
          {
            headers: {
              Authorization: `Bearer ${authState.token}`,
            },
          },
        );

        const bodega = response.data;

        setDescripcion(bodega.descripcion ?? '');
        setUbicacion(bodega.ubicacion ?? '');
        setCiudad(bodega.ciudad ?? '');
        setTipoBodega(bodega.tipo_bodega ?? '');
        setCapacidadMaxima(
          bodega.capacidad_maxima != null
            ? String(bodega.capacidad_maxima)
            : '',
        );
        setCapacidadActual(
          bodega.capacidad_actual != null
            ? String(bodega.capacidad_actual)
            : '',
        );
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.data?.message) {
          setError(err.response.data.message);
        } else {
          setError('Ocurrió un error al cargar la bodega.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBodega();
  }, [id_bodega]);

  const handleSelectTipoBodega = (tipo: string) => {
    setTipoBodega(tipo);
    setTipoBodegaModalVisible(false);
  };

  const handleGuardar = async () => {
    setErrorGuardar('');

    if (!descripcion.trim()) {
      setErrorGuardar('Ingresa la descripción de la bodega.');
      return;
    }

    if (!ubicacion.trim()) {
      setErrorGuardar('Ingresa la ubicación de la bodega.');
      return;
    }

    if (!tipoBodega) {
      setErrorGuardar('Selecciona un tipo de bodega.');
      return;
    }

    const capacidadMaximaNum = Number(capacidadMaxima);

    if (!capacidadMaxima.trim() || Number.isNaN(capacidadMaximaNum)) {
      setErrorGuardar('Ingresa una capacidad máxima válida.');
      return;
    }

    const capacidadActualNum = Number(capacidadActual);

    if (!capacidadActual.trim() || Number.isNaN(capacidadActualNum)) {
      setErrorGuardar('Ingresa una capacidad actual válida.');
      return;
    }

    setGuardando(true);

    try {
      await axios.put(
        `${BODEGAS_URL}/${id_bodega}`,
        {
          descripcion: descripcion.trim(),
          ubicacion: ubicacion.trim(),
          ciudad: ciudad.trim() || undefined,
          tipo_bodega: tipoBodega,
          capacidad_maxima: capacidadMaximaNum,
          capacidad_actual: capacidadActualNum,
        },
        {
          headers: {
            Authorization: `Bearer ${authState.token}`,
          },
        },
      );

      navigation.popTo('BodegasScreen');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setErrorGuardar(err.response.data.message);
      } else {
        setErrorGuardar('Ocurrió un error al guardar la bodega.');
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
      <Text style={styles.sectionTitle}>Descripción</Text>
      <TextInput
        style={styles.input}
        placeholder="Descripción de la bodega"
        value={descripcion}
        onChangeText={setDescripcion}
      />

      <Text style={styles.sectionTitle}>Ubicación</Text>
      <TextInput
        style={styles.input}
        placeholder="Ubicación de la bodega"
        value={ubicacion}
        onChangeText={setUbicacion}
      />

      <Text style={styles.sectionTitle}>Ciudad</Text>
      <TextInput
        style={styles.input}
        placeholder="Ciudad"
        value={ciudad}
        onChangeText={setCiudad}
      />

      <Text style={styles.sectionTitle}>Tipo de bodega</Text>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setTipoBodegaModalVisible(true)}
      >
        <Text
          style={
            tipoBodega ? styles.selectorText : styles.selectorPlaceholder
          }
        >
          {tipoBodega || 'Selecciona un tipo de bodega'}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={tipoBodegaModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setTipoBodegaModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecciona un tipo de bodega</Text>
            <FlatList
              data={TIPOS_BODEGA}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleSelectTipoBodega(item)}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setTipoBodegaModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Text style={styles.sectionTitle}>Capacidad máxima</Text>
      <TextInput
        style={styles.input}
        placeholder="Capacidad máxima"
        keyboardType="numeric"
        value={capacidadMaxima}
        onChangeText={setCapacidadMaxima}
      />

      <Text style={styles.sectionTitle}>Capacidad actual</Text>
      <TextInput
        style={styles.input}
        placeholder="Capacidad actual"
        keyboardType="numeric"
        value={capacidadActual}
        onChangeText={setCapacidadActual}
      />

      {errorGuardar ? <Text style={styles.error}>{errorGuardar}</Text> : null}

      <TouchableOpacity
        style={styles.button}
        onPress={handleGuardar}
        disabled={guardando}
      >
        <Text style={styles.buttonText}>
          {guardando ? 'Guardando...' : 'Guardar Bodega'}
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
    textAlign: 'center',
    paddingHorizontal: 24,
    marginTop: 8,
  },
});

export default BodegaEditarScreen;
