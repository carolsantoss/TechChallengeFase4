import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

export const PostDetailScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const { user, isTeacher } = useAuth();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentAuthor, setCommentAuthor] = useState(user?.name || '');
  const [commentContent, setCommentContent] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const data = await api.getPostById(id);
      setPost(data);
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível carregar o post.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [id]);

  useEffect(() => {
    if (user?.name) {
      setCommentAuthor(user.name);
    }
  }, [user]);

  const handleAddComment = async () => {
    if (!commentContent.trim()) {
      Alert.alert('Atenção', 'Escreva um comentário antes de enviar.');
      return;
    }

    const authorToUse = commentAuthor.trim() || user?.name || 'Anônimo';

    try {
      setSubmittingComment(true);
      const newComment = await api.addComment(id, {
        author: authorToUse,
        content: commentContent.trim(),
        authorRole: user?.role || 'student'
      });

      setPost((prev) => ({
        ...prev,
        comments: [...(prev.comments || []), newComment]
      }));

      setCommentContent('');
      Alert.alert('Sucesso', 'Comentário adicionado com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível enviar o comentário.');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Carregando artigo...</Text>
      </View>
    );
  }

  if (!post) return null;

  const formattedDate = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    : '';

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <Header
          title="Leitura de Post"
          subtitle="Artigo acadêmico"
          navigation={navigation}
          showBack
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.articleHeader}>
            <View style={styles.metaRow}>
              <View style={styles.authorBadge}>
                <Ionicons name="person-circle-outline" size={18} color={colors.primary} />
                <Text style={styles.authorText}>{post.author}</Text>
              </View>
              {formattedDate ? (
                <View style={styles.dateBadge}>
                  <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
                  <Text style={styles.dateText}>{formattedDate}</Text>
                </View>
              ) : null}
            </View>

            <Text style={styles.title}>{post.title}</Text>

            {isTeacher && (
              <View style={styles.teacherBar}>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => navigation.navigate('EditPost', { id: post.id })}
                >
                  <Ionicons name="create-outline" size={16} color={colors.primary} />
                  <Text style={styles.editBtnText}>Editar Publicação</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.bodyCard}>
            <Text style={styles.content}>{post.content}</Text>
          </View>

          <View style={styles.commentsSection}>
            <View style={styles.commentsHeader}>
              <Ionicons name="chatbubbles-outline" size={20} color={colors.primary} />
              <Text style={styles.commentsTitle}>
                Comentários ({post.comments ? post.comments.length : 0})
              </Text>
            </View>

            <View style={styles.addCommentCard}>
              <Text style={styles.addCommentLabel}>Deixe seu comentário</Text>
              {!user && (
                <TextInput
                  style={styles.inputAuthor}
                  placeholder="Seu nome"
                  placeholderTextColor={colors.textMuted}
                  value={commentAuthor}
                  onChangeText={setCommentAuthor}
                />
              )}
              <TextInput
                style={styles.inputComment}
                placeholder="Escreva sua opinião ou dúvida sobre o artigo..."
                placeholderTextColor={colors.textMuted}
                value={commentContent}
                onChangeText={setCommentContent}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
              <TouchableOpacity
                style={[styles.submitCommentBtn, submittingComment && styles.disabledBtn]}
                onPress={handleAddComment}
                disabled={submittingComment}
              >
                {submittingComment ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="send" size={16} color="#FFFFFF" />
                    <Text style={styles.submitCommentText}>Publicar Comentário</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {post.comments && post.comments.length > 0 ? (
              post.comments.map((comment, index) => (
                <View key={comment.id || index} style={styles.commentItem}>
                  <View style={styles.commentTopRow}>
                    <View style={styles.commentUser}>
                      <Ionicons
                        name={comment.authorRole === 'teacher' ? 'school' : 'person-circle'}
                        size={18}
                        color={comment.authorRole === 'teacher' ? colors.teacherText : colors.primary}
                      />
                      <Text style={styles.commentAuthorName}>{comment.author}</Text>
                      {comment.authorRole === 'teacher' && (
                        <View style={styles.teacherTag}>
                          <Text style={styles.teacherTagText}>Docente</Text>
                        </View>
                      )}
                    </View>
                    {comment.createdAt && (
                      <Text style={styles.commentDate}>
                        {new Date(comment.createdAt).toLocaleDateString('pt-BR')}
                      </Text>
                    )}
                  </View>
                  <Text style={styles.commentBody}>{comment.content}</Text>
                </View>
              ))
            ) : (
              <View style={styles.noCommentsContainer}>
                <Ionicons name="chatbox-outline" size={32} color={colors.textMuted} />
                <Text style={styles.noCommentsText}>
                  Nenhum comentário ainda. Seja o primeiro a comentar!
                </Text>
              </View>
            )}
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40
  },
  articleHeader: {
    marginBottom: 16
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  authorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14
  },
  authorText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primaryDark
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  dateText: {
    fontSize: 12,
    color: colors.textMuted
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 30,
    marginBottom: 8
  },
  teacherBar: {
    flexDirection: 'row',
    marginTop: 6
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },
  editBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary
  },
  bodyCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1
  },
  content: {
    fontSize: 15,
    lineHeight: 25,
    color: colors.textPrimary
  },
  commentsSection: {
    marginTop: 8
  },
  commentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary
  },
  addCommentCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16
  },
  addCommentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 10
  },
  inputAuthor: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: colors.textPrimary,
    marginBottom: 10
  },
  inputComment: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 13,
    color: colors.textPrimary,
    minHeight: 80,
    marginBottom: 12
  },
  submitCommentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 8
  },
  disabledBtn: {
    opacity: 0.6
  },
  submitCommentText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600'
  },
  commentItem: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10
  },
  commentTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  commentUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  commentAuthorName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary
  },
  teacherTag: {
    backgroundColor: colors.teacherBadge,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  teacherTagText: {
    fontSize: 10,
    color: colors.teacherText,
    fontWeight: '600'
  },
  commentDate: {
    fontSize: 11,
    color: colors.textMuted
  },
  commentBody: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary
  },
  noCommentsContainer: {
    alignItems: 'center',
    paddingVertical: 24
  },
  noCommentsText: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 8
  }
});
