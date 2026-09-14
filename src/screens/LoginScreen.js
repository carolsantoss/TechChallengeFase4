import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { showFeedback } from '../utils/alert';

export const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();

  const [role, setRole] = useState('teacher');
  const [email, setEmail] = useState('carlos.eduardo@fiap.com.br');
  const [password, setPassword] = useState('123456');
  const [submitting, setSubmitting] = useState(false);

  const handleSelectRole = (selectedRole) => {
    setRole(selectedRole);
    if (selectedRole === 'teacher') {
      setEmail('carlos.eduardo@fiap.com.br');
    } else {
      setEmail('ana.clara@aluno.fiap.com.br');
    }
  };

  const handleLogin = async () => {
    if (submitting) return;

    if (!email.trim()) {
      showFeedback('Validação', 'Por favor, digite seu e-mail.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await login(email.trim(), password, role);

      if (res && res.success) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }]
        });
        return;
      }
    } catch (err) {
      showFeedback('Erro', err.message || 'Falha ao autenticar.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <Header title="Autenticação" showBack navigation={navigation} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerBox}>
            <View style={styles.logoCircle}>
              <Ionicons name="book" size={32} color={colors.primary} />
            </View>
            <Text style={styles.title}>Blog Educacional</Text>
            <Text style={styles.subtitle}>
              Selecione seu perfil e faça login para acessar a plataforma
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Selecione seu perfil de acesso:</Text>
            <View style={styles.roleToggle}>
              <TouchableOpacity
                style={[
                  styles.roleOption,
                  role === 'teacher' && styles.roleOptionActive
                ]}
                onPress={() => handleSelectRole('teacher')}
              >
                <Ionicons
                  name="school"
                  size={18}
                  color={role === 'teacher' ? '#FFFFFF' : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.roleOptionText,
                    role === 'teacher' && styles.roleOptionTextActive
                  ]}
                >
                  Docente (Professor)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleOption,
                  role === 'student' && styles.roleOptionActive
                ]}
                onPress={() => handleSelectRole('student')}
              >
                <Ionicons
                  name="person"
                  size={18}
                  color={role === 'student' ? '#FFFFFF' : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.roleOptionText,
                    role === 'student' && styles.roleOptionTextActive
                  ]}
                >
                  Estudante (Aluno)
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>E-mail Institucional</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="email@fiap.com.br"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Senha</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="******"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry
                />
              </View>
            </View>

            <View style={styles.roleInfoCard}>
              <Ionicons
                name="information-circle-outline"
                size={18}
                color={role === 'teacher' ? colors.teacherText : colors.studentText}
              />
              <Text style={styles.roleInfoText}>
                {role === 'teacher'
                  ? 'Permissões de Docente: Criar, editar e excluir postagens, gerenciar professores e alunos.'
                  : 'Permissões de Estudante: Leitura de postagens e participação comunitária via comentários.'}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.loginBtn, submitting && styles.btnDisabled]}
              onPress={handleLogin}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="log-in-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.loginBtnText}>Entrar no Sistema</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1
  },
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40
  },
  headerBox: {
    alignItems: 'center',
    marginVertical: 16
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 280
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
    shadowRadius: 8,
    elevation: 2
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8
  },
  roleToggle: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20
  },
  roleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: colors.border
  },
  roleOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  roleOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary
  },
  roleOptionTextActive: {
    color: '#FFFFFF'
  },
  fieldGroup: {
    marginBottom: 16
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 6
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12
  },
  inputIcon: {
    marginRight: 8
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textPrimary
  },
  roleInfoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: colors.primaryLight,
    padding: 12,
    borderRadius: 10,
    marginBottom: 20
  },
  roleInfoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: colors.primaryDark
  },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12
  },
  btnDisabled: {
    opacity: 0.65
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700'
  }
});
