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

export const CreatePostScreen = ({ navigation }) => {
  const { user, isTeacher } = useAuth();

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState(user?.name || '');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (submitting) return;

    if (!title.trim()) {
      showFeedback('Validação', 'Por favor, informe o título da postagem.');
      return;
    }
    if (!author.trim()) {
      showFeedback('Validação', 'Por favor, informe o nome do autor.');
      return;
    }
    if (!content.trim()) {
      showFeedback('Validação', 'Por favor, preencha o conteúdo da postagem.');
      return;
    }

    try {
      setSubmitting(true);
      await api.createPost({
        title: title.trim(),
        author: author.trim(),
        description: description.trim() || content.trim().substring(0, 120) + '...',
        content: content.trim()
      });

      showFeedback('Sucesso', 'Postagem criada com sucesso!', () => {
        navigation.goBack();
      });
    } catch (error) {
      setSubmitting(false);
      showFeedback('Erro', error.message || 'Não foi possível salvar o post.');
    }
  };

  if (!isTeacher) {
    return (
      <View style={styles.container}>
        <Header title="Nova Publicação" showBack navigation={navigation} />
        <View style={styles.deniedContainer}>
          <Ionicons name="lock-closed-outline" size={56} color={colors.danger} />
          <Text style={styles.deniedTitle}>Acesso Restrito</Text>
          <Text style={styles.deniedSubtitle}>
            Apenas docentes autenticados possuem permissão para criar novas postagens.
          </Text>
          <TouchableOpacity
            style={styles.loginRedirectBtn}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginRedirectBtnText}>Fazer Login como Docente</Text>
          </TouchableOpacity>
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
          title="Criar Publicação"
          subtitle="Área do Docente"
          showBack
          navigation={navigation}
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Título da Postagem *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Introdução ao React Native"
                placeholderTextColor={colors.textMuted}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Autor *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Prof. Carlos Eduardo"
                placeholderTextColor={colors.textMuted}
                value={author}
                onChangeText={setAuthor}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Breve Descrição / Resumo</Text>
              <TextInput
                style={[styles.input, styles.textAreaSmall]}
                placeholder="Resumo que aparecerá no feed inicial..."
                placeholderTextColor={colors.textMuted}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={2}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Conteúdo Completo *</Text>
              <TextInput
                style={[styles.input, styles.textAreaLarge]}
                placeholder="Escreva todo o artigo, conceitos, explicações..."
                placeholderTextColor={colors.textMuted}
                value={content}
                onChangeText={setContent}
                multiline
                numberOfLines={8}
                textAlignVertical="top"
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
                  <Ionicons name="cloud-upload-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>Publicar no Blog</Text>
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
  textAreaSmall: {
    minHeight: 60
  },
  textAreaLarge: {
    minHeight: 160
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
  },
  deniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32
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
    lineHeight: 20,
    marginBottom: 24
  },
  loginRedirectBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10
  },
  loginRedirectBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14
  }
});
