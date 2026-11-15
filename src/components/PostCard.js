import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

// Pega o nome do autor em qualquer formato que o servidor devolver
const getAuthorName = (post) => {
  const author = post.autor || post.author || post.usuario || post.user;

  if (typeof author === 'string' && author.trim()) {
    return author;
  }

  return (
    author?.nome ||
    author?.name ||
    post.autor_nome ||
    post.author_name ||
    'Autor desconhecido'
  );
};

export const PostCard = ({ post, onPress, onEdit, onDelete, showAdminActions = false }) => {
  const formattedDate = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    : '';

  const commentsCount = post.comments ? post.comments.length : 0;
  const authorName = getAuthorName(post);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={styles.card}
    >
      <View style={styles.headerRow}>
        <View style={styles.authorBadge}>
          <Ionicons name="person-circle-outline" size={16} color={colors.primary} />
          <Text style={styles.authorText} numberOfLines={1}>{authorName}</Text>
        </View>
        {formattedDate ? (
          <Text style={styles.dateText}>{formattedDate}</Text>
        ) : null}
      </View>

      <Text style={styles.title} numberOfLines={2}>{post.title}</Text>

      <Text style={styles.description} numberOfLines={3}>
        {post.description || post.content}
      </Text>

      <View style={styles.footerRow}>
        <View style={styles.commentsBadge}>
          <Ionicons name="chatbubble-ellipses-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.commentsText}>{commentsCount} {commentsCount === 1 ? 'comentário' : 'comentários'}</Text>
        </View>

        {showAdminActions ? (
          <View style={styles.actionsContainer}>
            {onEdit && (
              <TouchableOpacity
                onPress={onEdit}
                style={[styles.actionBtn, styles.editBtn]}
              >
                <Ionicons name="pencil-outline" size={15} color={colors.primary} />
                <Text style={styles.editBtnText}>Editar</Text>
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity
                onPress={onDelete}
                style={[styles.actionBtn, styles.deleteBtn]}
              >
                <Ionicons name="trash-outline" size={15} color={colors.danger} />
                <Text style={styles.deleteBtnText}>Excluir</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.readMore}>
            <Text style={styles.readMoreText}>Ler artigo</Text>
            <Ionicons name="arrow-forward" size={14} color={colors.primary} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  authorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    flexShrink: 1
  },
  authorText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primaryDark,
    maxWidth: 160
  },
  dateText: {
    fontSize: 11,
    color: colors.textMuted,
    marginLeft: 8
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 23,
    marginBottom: 6
  },
  description: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
    marginBottom: 12
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  commentsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  commentsText: {
    fontSize: 12,
    color: colors.textSecondary
  },
  readMore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  readMoreText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8
  },
  editBtn: {
    backgroundColor: colors.primaryLight
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary
  },
  deleteBtn: {
    backgroundColor: colors.dangerLight
  },
  deleteBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.danger
  }
});