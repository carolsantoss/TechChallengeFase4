
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Header } from '../components/Header';

import {
  getBaseUrl,
  setBaseUrl,
  resetBaseUrl,
  api
} from '../services/api';

import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

export const SettingsScreen = ({ navigation }) => {
  const { user } = useAuth();

  // Nome do usuário logado
  const userName = user?.nome || user?.name || 'Usuário';

  // Configuração da API
  const [currentUrl, setCurrentUrl] = useState('');
  const [inputUrl, setInputUrl] = useState('');

  // Alteração de senha
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  /*
  useEffect(() => {
    loadUrl();
  }, []);
  */

  // Carregar URL salva
  /*const loadUrl = async () => {
    try {
      const url = await getBaseUrl();
      setCurrentUrl(url);
      setInputUrl(url);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar a URL da API.');
    }
  };

  // Salvar URL da API
  const handleSaveUrl = async () => {
    if (!inputUrl.trim()) {
      Alert.alert('Atenção', 'Informe uma URL válida.');
      return;
    }

    try {
      const savedUrl = await setBaseUrl(inputUrl);

      setCurrentUrl(savedUrl);
      setInputUrl(savedUrl);

      Alert.alert('Sucesso', 'URL da API salva com sucesso.');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar a URL.');
    }
  };

  // Restaurar URL padrão
  const handleResetUrl = async () => {
    Alert.alert(
      'Restaurar URL',
      'Deseja restaurar a URL padrão da API?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Restaurar',
          onPress: async () => {
            try {
              const url = await resetBaseUrl();

              setCurrentUrl(url);
              setInputUrl(url);
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível restaurar a URL.');
            }
          }
        }
      ]
    );
  };

  // Testar comunicação com o servidor
  const handleTestConnection = async () => {
    try {
      setTesting(true);
      setStatus(null);

      const baseUrl = await getBaseUrl();
      const response = await fetch(`${baseUrl}/api/posts`);

      if (!response.ok) {
        throw new Error(`Erro HTTP ${response.status}`);
      }

      setStatus({
        success: true,
        message: 'Comunicação com o servidor realizada com sucesso.'
      });

    } catch (error) {
      setStatus({
        success: false,
        message: error.message || 'Não foi possível conectar ao servidor.'
      });

    } finally {
      setTesting(false);
    }
  };
  */

  // Alterar senha
  const handleChangePassword = async () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert(
        'Atenção',
        'Preencha os dois campos de senha.'
      );
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert(
        'Atenção',
        'A nova senha deve ter pelo menos 6 caracteres.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(
        'Atenção',
        'A nova senha e a confirmação não coincidem.'
      );
      return;
    }

    const userId = user?.id || user?._id;

    if (!userId) {
      Alert.alert(
        'Erro',
        'Não foi possível identificar o usuário logado.'
      );
      return;
    }

    try {
      setChangingPassword(true);

      await api.updateUser(userId, {
        senha: newPassword
      });

      Alert.alert(
        'Sucesso',
        'Solicitação de alteração de senha enviada ao servidor.'
      );

      setNewPassword('');
      setConfirmPassword('');

    } catch (error) {
      Alert.alert(
        'Erro',
        error.message || 'Não foi possível alterar a senha.'
      );

    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Configurações</Text>

        {/*
        CONFIGURAÇÃO DA API
        Mantida no código, mas desativada temporariamente.

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons
              name="server-outline"
              size={23}
              color={colors.primary}
            />

            <Text style={styles.cardTitle}>
              Parâmetros da API
            </Text>
          </View>

          <Text style={styles.label}>
            URL atual da API
          </Text>

          <Text style={styles.currentUrl}>
            {currentUrl || 'Carregando...'}
          </Text>

          <Text style={styles.label}>
            Nova URL
          </Text>

          <TextInput
            style={styles.input}
            value={inputUrl}
            onChangeText={setInputUrl}
            placeholder="https://seu-servidor.com"
            autoCapitalize="none"
            keyboardType="url"
          />

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleSaveUrl}
          >
            <Ionicons
              name="save-outline"
              size={18}
              color="#FFFFFF"
            />

            <Text style={styles.primaryButtonText}>
              Salvar URL
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleResetUrl}
          >
            <Ionicons
              name="refresh-outline"
              size={18}
              color="#333333"
            />

            <Text style={styles.secondaryButtonText}>
              Restaurar padrão
            </Text>
          </TouchableOpacity>
        </View>
        */}

        {/* ALTERAÇÃO DE SENHA */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons
              name="lock-closed-outline"
              size={23}
              color={colors.primary}
            />

            <Text style={styles.cardTitle}>
              Alterar senha
            </Text>
          </View>

          {/* SAUDAÇÃO PERSONALIZADA */}
          <Text style={styles.greeting}>
            Olá, {userName}!
          </Text>

          <Text style={styles.description}>
            Digite sua nova senha e confirme para solicitar a alteração.
          </Text>

          <Text style={styles.label}>
            Nova senha
          </Text>

          <TextInput
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Digite a nova senha"
            secureTextEntry
            autoCapitalize="none"
          />

          <Text style={styles.label}>
            Confirmar nova senha
          </Text>

          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Digite novamente a nova senha"
            secureTextEntry
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={[
              styles.primaryButton,
              changingPassword && styles.buttonDisabled
            ]}
            onPress={handleChangePassword}
            disabled={changingPassword}
          >
            {changingPassword ? (
              <Text style={styles.primaryButtonText}>
                Alterando...
              </Text>
            ) : (
              <>
                <Ionicons
                  name="key-outline"
                  size={18}
                  color="#FFFFFF"
                />

                <Text style={styles.primaryButtonText}>
                  Alterar senha
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background || '#F5F6FA'
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 40
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text || '#222222',
    marginBottom: 20
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 18,
    marginBottom: 20,
    elevation: 2
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222222',
    marginLeft: 10
  },

  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary || '#2563EB',
    marginBottom: 10
  },

  description: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 15,
    lineHeight: 20
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444444',
    marginBottom: 7,
    marginTop: 12
  },

  currentUrl: {
    fontSize: 13,
    color: '#666666',
    backgroundColor: '#F2F2F2',
    padding: 12,
    borderRadius: 8
  },

  input: {
    backgroundColor: '#F7F7F7',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#222222'
  },

  primaryButton: {
    backgroundColor: colors.primary || '#2563EB',
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18
  },

  buttonDisabled: {
    opacity: 0.6
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 8
  },

  secondaryButton: {
    backgroundColor: '#EEEEEE',
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10
  },

  secondaryButtonText: {
    color: '#333333',
    fontWeight: '600',
    marginLeft: 8
  }
});
