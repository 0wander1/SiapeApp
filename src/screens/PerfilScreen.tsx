import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../App';
import { authState } from '../state/auth';

declare const atob: (data: string) => string;

type PerfilScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'PerfilScreen'
>;

function PerfilScreen() {
  const navigation = useNavigation<PerfilScreenNavigationProp>();

  const { userName, cargo } = useMemo(() => {
    if (!authState.token) {
      return { userName: '', cargo: '' };
    }

    try {
      const payload = JSON.parse(atob(authState.token.split('.')[1]));
      return {
        userName: payload.user_name ?? '',
        cargo: payload.cargo ?? '',
      };
    } catch {
      return { userName: '', cargo: '' };
    }
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.sectionTitle}>Usuario</Text>
      <TextInput
        style={[styles.input, styles.inputDisabled]}
        value={userName}
        editable={false}
      />

      <Text style={styles.sectionTitle}>Cargo</Text>
      <TextInput
        style={[styles.input, styles.inputDisabled]}
        value={cargo}
        editable={false}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>Cerrar</Text>
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
  inputDisabled: {
    backgroundColor: '#f2f2f2',
    color: '#555',
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
});

export default PerfilScreen;
