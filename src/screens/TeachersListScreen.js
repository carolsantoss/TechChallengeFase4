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
import { Pagination } from '../components/Pagination';
import { ConfirmModal } from '../components/ConfirmModal';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

export const TeachersListScreen = ({ navigation }) => {
  const { isTeacher } = useAuth();

  const [teachers, setTeachers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTeachers = async (currentPage = page, searchTerm = search) => {
    try {
      setLoading(true);
      const res = await api.getTeachers(currentPage, 4, searchTerm);
      setTeachers(res.data || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
      setPage(res.page || 1);
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível carregar a lista de professores.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTeachers(page, search);
    }, [page, search])
  );

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchTeachers(newPage, search);
  };

  const handleSearchChange = (text) => {
    setSearch(text);
    setPage(1);
    fetchTeachers(1, text);
  };

  const promptDelete = (teacher) => {
    setTeacherToDelete(teacher);
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!teacherToDelete) return;
    try {
      setDeleting(true);
      await api.deleteTeacher(teacherToDelete.id);
      setDeleteModalVisible(false);
      setTeacherToDelete(null);
      fetchTeachers(page, search);
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível excluir o professor.');
    } finally {
      setDeleting(false);
    }
  };

  if (!isTeacher) {
    return (
      <View style={styles.container}>
        <Header title="Gestão de Docentes" navigation={navigation} />
        <View style={styles.centerContainer}>
          <Ionicons name="lock-closed-outline" size={56} color={colors.danger} />
          <Text style={styles.deniedTitle}>Acesso Restrito</Text>
          <Text style={styles.deniedSubtitle}>
            Apenas docentes autenticados podem visualizar e gerenciar o corpo docente.
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

      <View style={styles.searchBarContainer}>
        <SearchBar
          value={search}
          onChangeText={handleSearchChange}
          placeholder="Buscar docente por nome, e-mail..."
        />
      </View>

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
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatarText}>
                    {item.name ? item.name.charAt(0).toUpperCase() : 'P'}
                  </Text>
                </View>
                <View style={styles.infoContainer}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.email}>{item.email}</Text>
                  <View style={styles.badgeRow}>
                    <View style={styles.tagBadge}>
                      <Text style={styles.tagBadgeText}>{item.title || 'Professor'}</Text>
                    </View>
                    <View style={styles.deptBadge}>
                      <Text style={styles.deptBadgeText}>{item.department || 'Geral'}</Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={[styles.btnAction, styles.btnEdit]}
                  onPress={() => navigation.navigate('EditTeacher', { id: item.id })}
                >
                  <Ionicons name="pencil-outline" size={15} color={colors.primary} />
                  <Text style={styles.btnEditText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btnAction, styles.btnDelete]}
                  onPress={() => promptDelete(item)}
                >
                  <Ionicons name="trash-outline" size={15} color={colors.danger} />
                  <Text style={styles.btnDeleteText}>Excluir</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
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
              <Ionicons name="people-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>Nenhum docente encontrado</Text>
            </View>
          }
        />
      )}

      <ConfirmModal
        visible={deleteModalVisible}
        title="Excluir Docente"
        message={`Deseja realmente remover ${teacherToDelete?.name} do sistema?`}
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
  name: {
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
  deptBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },
  deptBadgeText: {
    fontSize: 11,
    color: colors.textSecondary
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
