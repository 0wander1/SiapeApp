import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../App';
import { authState } from '../state/auth';
import { CLIENTES_URL } from '../utils/clientes';

type ClienteEditarScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ClienteEditarScreen'
>;

type ClienteEditarScreenRouteProp = RouteProp<
  RootStackParamList,
  'ClienteEditarScreen'
>;

function ClienteEditarScreen() {
  const navigation = useNavigation<ClienteEditarScreenNavigationProp>();
  const route = useRoute<ClienteEditarScreenRouteProp>();
  const { id_usuario_cli, nombre_usuario, correo: correoInicial } =
    route.params;

  const [nombreUsuario, setNombreUsuario] = useState(nombre_usuario);
  const [correo, setCorreo] = useState(correoInicial);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const handleGuardar = async () => {
    setError('');

    if (!nombreUsuario.trim()) {
      setError('Ingresa el nombre del cliente.');
      return;
    }

    if (!correo.trim()) {
      setError('Ingresa el correo del cliente.');
      return;
    }

    setGuardando(true);

    try {
      await axios.put(
        `${CLIENTES_URL}/${id_usuario_cli}`,
        {
          nombre_usuario: nombreUsuario.trim(),
          correo: correo.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${authState.token}`,
          },
        },
      );

      navigation.popTo('ClientesScreen');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Ocurrió un error al guardar el cliente.');
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
      <Text style={styles.sectionTitle}>Nombre</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre del cliente"
        value={nombreUsuario}
        onChangeText={setNombreUsuario}
      />

      <Text style={styles.sectionTitle}>Correo</Text>
      <TextInput
        style={styles.input}
        placeholder="Correo"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        value={correo}
        onChangeText={setCorreo}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity
        style={styles.button}
        onPress={handleGuardar}
        disabled={guardando}
      >
        <Text style={styles.buttonText}>
          {guardando ? 'Guardando...' : 'Guardar Cliente'}
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
});

export default ClienteEditarScreen;
