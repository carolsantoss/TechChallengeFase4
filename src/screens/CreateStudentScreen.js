import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { showFeedback } from '../utils/alert';

export const CreateStudentScreen = ({ navigation }) => {
  const { isTeacher } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [course, setCourse] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (submitting) return;

    if (!name.trim()) {
      showFeedback('Validação', 'Por favor, informe o nome do estudante.');
      return;
    }
    if (!email.trim()) {
      showFeedback('Validação', 'Por favor, informe o e-mail do estudante.');
      return;
    }

    try {
      setSubmitting(true);
      await api.createStudent({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        registrationNumber: registrationNumber.trim() || 'RM' + Math.floor(10000 + Math.random() * 90000),
        course: course.trim() || 'Engenharia de Software'
      });

      showFeedback('Sucesso', 'Estudante cadastrado com sucesso!', () => {
        navigation.goBack();
      });
    } catch (error) {
      setSubmitting(false);
      showFeedback('Erro', error.message || 'Falha ao cadastrar estudante.');
    }
  };

  if (!isTeacher) {
    return (
      <View style={styles.container}>
        <Header title="Novo Estudante" showBack navigation={navigation} />
        <View style={styles.centerContainer}>
          <Ionicons name="lock-closed-outline" size={56} color={colors.danger} />
          <Text style={styles.deniedTitle}>Acesso Restrito</Text>
          <Text style={styles.deniedSubtitle}>
            Apenas docentes podem cadastrar novos estudantes.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <Header
          title="Cadastrar Estudante"
          subtitle="Área Administrativa"
          showBack
          navigation={navigation}
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Nome Completo *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Ex: Ana Clara Lima"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>E-mail Institucional *</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Ex: ana.clara@aluno.fiap.com.br"
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Matrícula (RM)</Text>
              <TextInput
                style={styles.input}
                value={registrationNumber}
                onChangeText={setRegistrationNumber}
                placeholder="Ex: RM98701 (opcional, gerado automático)"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Curso / Graduação</Text>
              <TextInput
                style={styles.input}
                value={course}
                onChangeText={setCourse}
                placeholder="Ex: Análise e Desenvolvimento de Sistemas"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, submitting && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="school-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>Cadastrar Estudante</Text>
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
    padding: 16,
    paddingBottom: 40
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  deniedTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8
  },
  deniedSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20
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
  fieldGroup: {
    marginBottom: 16
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 6
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textPrimary
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8
  },
  buttonDisabled: {
    opacity: 0.65
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF'
  }
});
