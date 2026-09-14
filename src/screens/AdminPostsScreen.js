import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { SearchBar } from '../components/SearchBar';
import { PostCard } from '../components/PostCard';
import { ConfirmModal } from '../components/ConfirmModal';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

export const AdminPostsScreen = ({ navigation }) => {
  const { isTeacher } = useAuth();

  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPosts = async (searchTerm = search) => {
    try {
      setLoading(true);
      const data = await api.getPosts(searchTerm);
      setPosts(data);
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível carregar as publicações para administração.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPosts(search);
    }, [search])
  );

  const handleSearchChange = (text) => {
    setSearch(text);
    fetchPosts(text);
  };

  const promptDelete = (post) => {
    setPostToDelete(post);
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!postToDelete) return;

    try {
      setDeleting(true);
      await api.deletePost(postToDelete.id);
      setDeleteModalVisible(false);
      setPostToDelete(null);
      fetchPosts(search);
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível excluir a postagem.');
    } finally {
      setDeleting(false);
    }
  };

  if (!isTeacher) {
    return (
      <View style={styles.container}>
        <Header title="Painel Administrativo" navigation={navigation} />
        <View style={styles.centerContainer}>
          <Ionicons name="lock-closed-outline" size={56} color={colors.danger} />
          <Text style={styles.deniedTitle}>Acesso Restrito</Text>
          <Text style={styles.deniedSubtitle}>
            Esta página administrativa é restrita a docentes autenticados.
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
    <View style={styles.container}>
      <Header
        title="Painel Administrativo"
        subtitle="Gerenciamento de Publicações"
        navigation={navigation}
      />

      <View style={styles.shortcutRow}>
        <TouchableOpacity
          style={styles.shortcutCard}
          onPress={() => navigation.navigate('CreatePost')}
        >
          <Ionicons name="add-circle" size={20} color={colors.primary} />
          <Text style={styles.shortcutText}>Novo Post</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.shortcutCard}
          onPress={() => navigation.navigate('TeachersTab')}
        >
          <Ionicons name="people" size={20} color={colors.secondary} />
          <Text style={styles.shortcutText}>Docentes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.shortcutCard}
          onPress={() => navigation.navigate('StudentsTab')}
        >
          <Ionicons name="school" size={20} color={colors.teacherText} />
          <Text style={styles.shortcutText}>Estudantes</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <SearchBar
          value={search}
          onChangeText={handleSearchChange}
          placeholder="Buscar no painel administrativo..."
        />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Todas as Postagens ({posts.length})</Text>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Carregando postagens...</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              showAdminActions
              onPress={() => navigation.navigate('PostDetail', { id: item.id })}
              onEdit={() => navigation.navigate('EditPost', { id: item.id })}
              onDelete={() => promptDelete(item)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="documents-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>Nenhuma postagem encontrada</Text>
            </View>
          }
        />
      )}

      <ConfirmModal
        visible={deleteModalVisible}
        title="Excluir Postagem"
        message={`Deseja realmente remover permanentemente a postagem "${postToDelete?.title}"?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalVisible(false)}
        loading={deleting}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  shortcutRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4
  },
  shortcutCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4
  },
  shortcutText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 4
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 30
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40
  },
  emptyTitle: {
    fontSize: 15,
    color: colors.textMuted,
    marginTop: 8
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
