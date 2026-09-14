import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { getBaseUrl, setBaseUrl, resetBaseUrl } from '../services/api';
import { colors } from '../theme/colors';

export const SettingsScreen = ({ navigation }) => {
  const [currentUrl, setCurrentUrl] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    loadUrl();
  }, []);

  const loadUrl = async () => {
    const url = await getBaseUrl();
    setCurrentUrl(url);
    setInputUrl(url);
  };

  const handleSaveUrl = async () => {
    if (!inputUrl.trim()) {
      Alert.alert('Atenção', 'Informe uma URL válida.');
      return;
    }

    const saved = await setBaseUrl(inputUrl.trim());
    setCurrentUrl(saved);
    setInputUrl(saved);
    Alert.alert('Sucesso', `URL base atualizada para:\n${saved}`);
  };

  const handleResetUrl = async () => {
    const reset = await resetBaseUrl();
    setCurrentUrl(reset);
    setInputUrl(reset);
    Alert.alert('Restaurado', 'URL base redefinida para o padrão.');
  };

  const handleTestConnection = async () => {
    try {
      setTesting(true);
      setStatus(null);
      const urlToTest = inputUrl.trim().replace(/\/+$/, '');
      const finalTestUrl = urlToTest.endsWith('/api') ? urlToTest : `${urlToTest}/api`;

      const response = await fetch(`${finalTestUrl}/posts`, { method: 'GET' });
      if (response.ok) {
        setStatus({ ok: true, message: 'Conexão com a API estabelecida com sucesso!' });
      } else {
        setStatus({ ok: false, message: `Servidor respondeu com status HTTP ${response.status}` });
      }
    } catch (err) {
      setStatus({
        ok: false,
        message: 'Não foi possível conectar ao servidor. Certifique-se de que o backend está em execução.'
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Configurações" subtitle="Conexão com Back-End REST" navigation={navigation} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={styles.iconRow}>
            <Ionicons name="server-outline" size={28} color={colors.primary} />
            <Text style={styles.cardTitle}>Parâmetros da API REST</Text>
          </View>
          <Text style={styles.description}>
            Configure a URL base dos endpoints REST do back-end em Node.js para comunicação via HTTP.
          </Text>

          <Text style={styles.label}>URL Base Atual:</Text>
          <View style={styles.urlBadge}>
            <Text style={styles.urlText}>{currentUrl}</Text>
          </View>

          <Text style={[styles.label, { marginTop: 14 }]}>Alterar URL da API:</Text>
          <TextInput
            style={styles.input}
            value={inputUrl}
            onChangeText={setInputUrl}
            placeholder="http://localhost:3000/api"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveUrl}>
              <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" />
              <Text style={styles.saveBtnText}>Salvar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.resetBtn} onPress={handleResetUrl}>
              <Ionicons name="refresh-outline" size={18} color={colors.textSecondary} />
              <Text style={styles.resetBtnText}>Padrão</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.testBtn, testing && styles.btnDisabled]}
            onPress={handleTestConnection}
            disabled={testing}
          >
            {testing ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <>
                <Ionicons name="pulse-outline" size={18} color={colors.primary} />
                <Text style={styles.testBtnText}>Testar Comunicação com o Servidor</Text>
              </>
            )}
          </TouchableOpacity>

          {status && (
            <View
              style={[
                styles.statusBox,
                status.ok ? styles.statusSuccess : styles.statusError
              ]}
            >
              <Ionicons
                name={status.ok ? 'checkmark-circle' : 'alert-circle'}
                size={20}
                color={status.ok ? colors.success : colors.danger}
              />
              <Text
                style={[
                  styles.statusText,
                  status.ok ? styles.statusSuccessText : styles.statusErrorText
                ]}
              >
                {status.message}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  scrollContent: {
    padding: 16
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
    marginBottom: 16
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 6
  },
  urlBadge: {
    backgroundColor: '#F1F5F9',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border
  },
  urlText: {
    fontSize: 13,
    color: colors.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace'
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: colors.textPrimary,
    marginBottom: 12
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12
  },
  saveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 8
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13
  },
  resetBtn: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    borderRadius: 8
  },
  resetBtnText: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 13
  },
  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primaryLight,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 4
  },
  btnDisabled: {
    opacity: 0.6
  },
  testBtnText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 13
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    marginTop: 14
  },
  statusSuccess: {
    backgroundColor: colors.successLight
  },
  statusError: {
    backgroundColor: colors.dangerLight
  },
  statusText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16
  },
  statusSuccessText: {
    color: colors.success
  },
  statusErrorText: {
    color: colors.danger
  }
});
