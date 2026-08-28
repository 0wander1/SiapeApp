import { useState } from 'react';
import {
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

import { authState } from '../state/auth';
import { PQRS_URL, TIPOS_PQRS, type TipoPQRS } from '../utils/pqrs';

function PQRSScreen() {
  const [tipo, setTipo] = useState<TipoPQRS | ''>('');
  const [tipoModalVisible, setTipoModalVisible] = useState(false);

  const [asunto, setAsunto] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [enviando, setEnviando] = useState(false);

  const handleSelectTipo = (tipoSeleccionado: TipoPQRS) => {
    setTipo(tipoSeleccionado);
    setTipoModalVisible(false);
  };

  const handleEnviar = async () => {
    setError('');
    setExito('');

    if (!tipo) {
      setError('Selecciona el tipo de PQRS.');
      return;
    }

    if (!asunto.trim()) {
      setError('Ingresa el asunto.');
      return;
    }

    if (!descripcion.trim()) {
      setError('Ingresa la descripción.');
      return;
    }

    setEnviando(true);

    try {
      await axios.post(
        PQRS_URL,
        {
          tipo,
          asunto: asunto.trim(),
          descripcion: descripcion.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${authState.token}`,
          },
        },
      );

      setExito('Tu PQRS fue enviada correctamente.');
      setTipo('');
      setAsunto('');
      setDescripcion('');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Ocurrió un error al enviar la PQRS.');
      }
    } finally {
      setEnviando(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.sectionTitle}>Tipo</Text>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setTipoModalVisible(true)}
      >
        <Text style={tipo ? styles.selectorText : styles.selectorPlaceholder}>
          {tipo || 'Selecciona el tipo de PQRS'}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={tipoModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setTipoModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecciona el tipo de PQRS</Text>
            <FlatList
              data={TIPOS_PQRS}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleSelectTipo(item)}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setTipoModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Text style={styles.sectionTitle}>Asunto</Text>
      <TextInput
        style={styles.input}
        placeholder="Asunto"
        value={asunto}
        onChangeText={setAsunto}
      />

      <Text style={styles.sectionTitle}>Descripción</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Describe tu petición, queja, reclamo o sugerencia"
        value={descripcion}
        onChangeText={setDescripcion}
        multiline
        numberOfLines={5}
        textAlignVertical="top"
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {exito ? <Text style={styles.success}>{exito}</Text> : null}

      <TouchableOpacity
        style={styles.button}
        onPress={handleEnviar}
        disabled={enviando}
      >
        <Text style={styles.buttonText}>
          {enviando ? 'Enviando...' : 'Enviar'}
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
    height: 120,
    paddingTop: 12,
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
    marginTop: 8,
  },
  success: {
    color: '#2E7D32',
    fontSize: 14,
    marginTop: 8,
  },
});

export default PQRSScreen;
