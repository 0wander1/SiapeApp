import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../App';
import { authState } from '../state/auth';

declare const atob: (data: string) => string;

const TRABAJADORES_URL =
  'https://siape-production.up.railway.app/api/trabajadores';

type CambiarPasswordScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'CambiarPasswordScreen'
>;

function CambiarPasswordScreen() {
  const navigation = useNavigation<CambiarPasswordScreenNavigationProp>();

  const [contrasenaActual, setContrasenaActual] = useState('');
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');

  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const handleGuardar = async () => {
    setError('');

    if (!contrasenaActual.trim()) {
      setError('Ingresa tu contraseña actual.');
      return;
    }

    if (nuevaContrasena.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (nuevaContrasena !== confirmarContrasena) {
      setError('La confirmación no coincide con la nueva contraseña.');
      return;
    }

    if (!authState.token) {
      setError('No se encontró la sesión del usuario.');
      return;
    }

    setGuardando(true);

    try {
      const id_usuario_trab = JSON.parse(
        atob(authState.token.split('.')[1]),
      ).id;

      await axios.put(
        `${TRABAJADORES_URL}/${id_usuario_trab}`,
        {
          contrasena_actual: contrasenaActual,
          nueva_contrasena: nuevaContrasena,
        },
        {
          headers: {
            Authorization: `Bearer ${authState.token}`,
          },
        },
      );

      navigation.goBack();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Ocurrió un error al cambiar la contraseña.');
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
      <Text style={styles.sectionTitle}>Contraseña actual</Text>
      <TextInput
        style={styles.input}
        placeholder="Contraseña actual"
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        value={contrasenaActual}
        onChangeText={setContrasenaActual}
      />

      <Text style={styles.sectionTitle}>Nueva contraseña</Text>
      <TextInput
        style={styles.input}
        placeholder="Nueva contraseña"
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        value={nuevaContrasena}
        onChangeText={setNuevaContrasena}
      />

      <Text style={styles.sectionTitle}>Confirmar contraseña</Text>
      <TextInput
        style={styles.input}
        placeholder="Confirmar contraseña"
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        value={confirmarContrasena}
        onChangeText={setConfirmarContrasena}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

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

export default CambiarPasswordScreen;
