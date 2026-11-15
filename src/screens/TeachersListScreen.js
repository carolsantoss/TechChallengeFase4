import React, { useState, useCallback, useEffect, useMemo } from 'react';

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
import { Pagination } from '../components/Pagination';
import { ConfirmModal } from '../components/ConfirmModal';

import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

const PAGE_SIZE = 4;

// Remove acentos e deixa minúsculo para a busca
const normalize = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

export const TeachersListScreen = ({ navigation }) => {
  const { isTeacher } = useAuth();

  const [allTeachers, setAllTeachers] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // CARREGAR TODOS OS DOCENTES (busca e paginação são feitas aqui no app)
  const fetchTeachers = async () => {
    try {
      setLoading(true);

      // O servidor devolve todos os usuários (alunos e docentes) em um array
      const res = await api.getTeachers(1, 1000, '');

      const listaBruta = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
          ? res.data
          : [];

      // FILTRAR SOMENTE ROLE DOCENTE
      const listaDocentes = listaBruta.filter((user) => {
        const role = String(user.role || '').trim().toLowerCase();
        return role === 'docente' || role === 'teacher';
      });

      setAllTeachers(listaDocentes);
    } catch (err) {
      console.log('Erro ao carregar docentes:', err);

      Alert.alert(
        'Erro',
        err.message || 'Não foi possível carregar a lista de professores.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ATUALIZAR AO ABRIR A TELA (não recarrega a cada letra digitada)
  useFocusEffect(
    useCallback(() => {
      fetchTeachers();
    }, [])
  );

  // BUSCA (nome ou e-mail)
  const filtered = useMemo(() => {
    const term = normalize(search.trim());
    if (!term) return allTeachers;

    return allTeachers.filter(
      (t) =>
        normalize(t.nome || t.name).includes(term) ||
        normalize(t.email).includes(term)
    );
  }, [allTeachers, search]);

  // PAGINAÇÃO
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const teachers = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  );

  // Se a página atual deixar de existir (ex.: após excluir), volta uma página
  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleSearchChange = (text) => {
    setSearch(text);
    setPage(1);
  };

  // ABRIR CONFIRMAÇÃO DE EXCLUSÃO
  const promptDelete = (teacher) => {
    setTeacherToDelete(teacher);
    setDeleteModalVisible(true);
  };

  // EXCLUIR DOCENTE
  const handleConfirmDelete = async () => {
    if (!teacherToDelete) return;

    try {
      setDeleting(true);

      await api.deleteTeacher(teacherToDelete.id);

      setDeleteModalVisible(false);
      setTeacherToDelete(null);

      Alert.alert('Sucesso', 'Docente excluído com sucesso.');

      await fetchTeachers();
    } catch (err) {
      console.log('Erro ao excluir docente:', err);

      Alert.alert(
        'Erro',
        err.message || 'Não foi possível excluir o professor.'
      );
    } finally {
      setDeleting(false);
    }
  };

  // ACESSO RESTRITO
  if (!isTeacher) {
    return (
      <View style={styles.container}>
        <Header title="Gestão de Docentes" navigation={navigation} />

        <View style={styles.centerContainer}>
          <Ionicons
            name="lock-closed-outline"
            size={56}
            color={colors.danger}
          />

          <Text style={styles.deniedTitle}>Acesso Restrito</Text>

          <Text style={styles.deniedSubtitle}>
            Apenas docentes autenticados podem visualizar e gerenciar o corpo
            docente.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Professores"
        subtitle="Quadro de Docentes"
        navigation={navigation}
      />

      {/* BUSCA */}
      <View style={styles.searchBarContainer}>
        <SearchBar
          value={search}
          onChangeText={handleSearchChange}
          placeholder="Buscar docente por nome, e-mail..."
        />
      </View>

      {/* CABEÇALHO E BOTÃO NOVO DOCENTE */}
      <View style={styles.actionHeader}>
        <Text style={styles.sectionTitle}>Docentes Cadastrados</Text>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('CreateTeacher')}
        >
          <Ionicons name="person-add" size={16} color="#FFFFFF" />

          <Text style={styles.addButtonText}>Novo Docente</Text>
        </TouchableOpacity>
      </View>

      {/* CARREGAMENTO */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />

          <Text style={styles.loadingText}>Carregando professores...</Text>
        </View>
      ) : (
        <FlatList
          data={teachers}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => {
            const teacherName = item.nome || item.name || 'Professor';

            return (
              <View style={styles.card}>
                {/* INFORMAÇÕES DO DOCENTE */}
                <View style={styles.cardHeader}>
                  <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>
                      {teacherName.charAt(0).toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.infoContainer}>
                    <Text style={styles.nome}>{teacherName}</Text>

                    <Text style={styles.email}>{item.email}</Text>

                    <View style={styles.badgeRow}>
                      <View style={styles.tagBadge}>
                        <Text style={styles.tagBadgeText}>
                          {item.title || 'Professor'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* AÇÕES */}
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={[styles.btnAction, styles.btnEdit]}
                    onPress={() =>
                      navigation.navigate('EditTeacher', {
                        id: item.id
                      })
                    }
                  >
                    <Ionicons
                      name="pencil-outline"
                      size={15}
                      color={colors.primary}
                    />

                    <Text style={styles.btnEditText}>Editar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.btnAction, styles.btnDelete]}
                    onPress={() => promptDelete(item)}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={15}
                      color={colors.danger}
                    />

                    <Text style={styles.btnDeleteText}>Excluir</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
          ListFooterComponent={
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              onPageChange={handlePageChange}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="people-outline"
                size={48}
                color={colors.textMuted}
              />

              <Text style={styles.emptyTitle}>Nenhum docente encontrado</Text>
            </View>
          }
        />
      )}

      {/* MODAL DE EXCLUSÃO */}
      <ConfirmModal
        visible={deleteModalVisible}
        title="Excluir Docente"
        message={`Deseja realmente remover ${
          teacherToDelete?.nome || teacherToDelete?.name || 'este docente'
        } do sistema?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteModalVisible(false);
          setTeacherToDelete(null);
        }}
        loading={deleting}
      />
    </View>
  );
};

// ESTILOS
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },

  searchBarContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6
  },

  actionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary
  },

  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8
  },

  addButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600'
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30
  },

  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },

  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.teacherBadge,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },

  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.teacherText
  },

  infoContainer: {
    flex: 1
  },

  nome: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary
  },

  email: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2
  },

  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6
  },

  tagBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },

  tagBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary
  },

  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10
  },

  btnAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },

  btnEdit: {
    backgroundColor: colors.primaryLight
  },

  btnEditText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary
  },

  btnDelete: {
    backgroundColor: colors.dangerLight
  },

  btnDeleteText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.danger
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
    lineHeight: 20
  }
});