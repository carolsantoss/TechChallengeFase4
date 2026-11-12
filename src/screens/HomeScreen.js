
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { SearchBar } from '../components/SearchBar';
import { PostCard } from '../components/PostCard';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

// Remove acentos e padroniza o texto para comparação
const normalizeText = (text) => {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
};

// Extrai os textos dos campos que podem existir em um post
const getPostSearchText = (post) => {
  const author =
    post.autor ||
    post.author ||
    post.usuario ||
    post.user ||
    {};

  const authorName =
    typeof author === 'string'
      ? author
      : author.nome || author.name || '';

  return normalizeText([
    post.titulo,
    post.title,
    post.autor_nome,
    post.author_name,
    authorName,
    post.conteudo,
    post.content,
    post.descricao,
    post.description,
    post.assunto,
    post.subject
  ].filter(Boolean).join(' '));
};

export const HomeScreen = ({ navigation }) => {
  const { isTeacher } = useAuth();

  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Carrega sempre todos os posts, sem aplicar pesquisa na API
  const fetchPosts = useCallback(async () => {
    try {
      setError(null);

      const data = await api.getPosts('');

      const postsList = Array.isArray(data)
        ? data
        : Array.isArray(data?.posts)
          ? data.posts
          : [];

      setPosts(postsList);
    } catch (err) {
      setError(
        'Não foi possível carregar as publicações. Verifique a conexão com o servidor.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Atualiza os posts quando a tela recebe foco
  useFocusEffect(
    useCallback(() => {
      fetchPosts();
    }, [fetchPosts])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  const handleSearchChange = (text) => {
    setSearch(text);
  };

  // Filtra localmente os posts já carregados
  const filteredPosts = posts.filter((post) => {
    const searchTerm = normalizeText(search);

    if (!searchTerm) {
      return true;
    }

    return getPostSearchText(post).includes(searchTerm);
  });

  return (
    <View style={styles.container}>
      <Header
        title="Blog"
        subtitle="Portal de Artigos Acadêmicos"
        navigation={navigation}
      />

      <View style={styles.searchContainer}>
        <SearchBar
          value={search}
          onChangeText={handleSearchChange}
          placeholder="Buscar posts por título, autor..."
        />
      </View>

      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>
            Carregando postagens...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={colors.danger}
          />

          <Text style={styles.errorText}>{error}</Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchPosts}
          >
            <Text style={styles.retryButtonText}>
              Tentar Novamente
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredPosts}
          keyExtractor={(item, index) =>
            String(item.id || item._id || index)
          }
          contentContainerStyle={[
            styles.listContent,
            filteredPosts.length === 0 && { flexGrow: 1 }
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
            />
          }
          renderItem={({ item }) => (
            <PostCard
              post={item}
              onPress={() =>
                navigation.navigate('PostDetail', {
                  id: item.id || item._id
                })
              }
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="document-text-outline"
                size={48}
                color={colors.textMuted}
              />

              <Text style={styles.emptyTitle}>
                Nenhuma postagem encontrada
              </Text>

              <Text style={styles.emptySubtitle}>
                {search
                  ? 'Tente utilizar termos diferentes na busca.'
                  : 'Ainda não existem postagens cadastradas no blog.'}
              </Text>
            </View>
          }
        />
      )}

      {isTeacher && (
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('CreatePost')}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80
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
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.danger,
    textAlign: 'center',
    lineHeight: 20
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 12
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8
  }
});
