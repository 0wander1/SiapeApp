import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../App';
import { authState } from '../state/auth';
import { NEGOCIO_URL, type Negocio } from '../utils/negocio';

type PerfilNegocioScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'PerfilNegocioScreen'
>;

function PerfilNegocioScreen() {
  const navigation = useNavigation<PerfilNegocioScreenNavigationProp>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [nombre, setNombre] = useState('');
  const [nit, setNit] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');

  const [errorGuardar, setErrorGuardar] = useState('');
  const [exito, setExito] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const fetchNegocio = async () => {
      setError('');
      setLoading(true);

      try {
        const response = await axios.get<Negocio>(NEGOCIO_URL, {
          headers: {
            Authorization: `Bearer ${authState.token}`,
          },
        });

        setNombre(response.data.nombre ?? '');
        setNit(response.data.nit ?? '');
        setDireccion(response.data.direccion ?? '');
        setTelefono(response.data.telefono ?? '');
        setCorreo(response.data.correo ?? '');
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.data?.message) {
          setError(err.response.data.message);
        } else {
          setError('Ocurrió un error al cargar el perfil del negocio.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNegocio();
  }, []);

  const handleGuardar = async () => {
    setErrorGuardar('');
    setExito('');

    if (!nombre.trim()) {
      setErrorGuardar('Ingresa el nombre del negocio.');
      return;
    }

    if (!nit.trim()) {
      setErrorGuardar('Ingresa el NIT del negocio.');
      return;
    }

    setGuardando(true);

    try {
      await axios.put(
        NEGOCIO_URL,
        {
          nombre: nombre.trim(),
          nit: nit.trim(),
          direccion: direccion.trim(),
          telefono: telefono.trim(),
          correo: correo.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${authState.token}`,
          },
        },
      );

      setExito('El perfil del negocio se actualizó correctamente.');
      setTimeout(() => {
        navigation.goBack();
      }, 1000);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setErrorGuardar(err.response.data.message);
      } else {
        setErrorGuardar('Ocurrió un error al guardar el perfil del negocio.');
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
      <Text style={styles.sectionTitle}>Nombre</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre del negocio"
        value={nombre}
        onChangeText={setNombre}
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

      <Text style={styles.sectionTitle}>Dirección</Text>
      <TextInput
        style={styles.input}
        placeholder="Dirección"
        value={direccion}
        onChangeText={setDireccion}
      />

      <Text style={styles.sectionTitle}>Teléfono</Text>
      <TextInput
        style={styles.input}
        placeholder="Teléfono"
        keyboardType="phone-pad"
        value={telefono}
        onChangeText={setTelefono}
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

      {errorGuardar ? <Text style={styles.error}>{errorGuardar}</Text> : null}
      {exito ? <Text style={styles.success}>{exito}</Text> : null}

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

export default PerfilNegocioScreen;
