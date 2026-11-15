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

export const StudentsListScreen = ({ navigation }) => {
  const { isTeacher } = useAuth();

  const [allStudents, setAllStudents] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // CARREGAR TODOS OS ALUNOS (busca e paginação são feitas aqui no app)
  const fetchStudents = async () => {
    try {
      setLoading(true);

      // O servidor devolve todos os usuários (alunos e docentes) em um array
      const res = await api.getStudents(1, 1000, '');

      const listaBruta = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
          ? res.data
          : [];

      // FILTRA SOMENTE USUÁRIOS COM ROLE DE ALUNO
      const listaAlunos = listaBruta.filter((user) => {
        const role = String(user.role || '').trim().toLowerCase();
        return role === 'aluno' || role === 'student';
      });

      setAllStudents(listaAlunos);
    } catch (err) {
      console.log('Erro ao carregar alunos:', err);

      Alert.alert(
        'Erro',
        err.message || 'Não foi possível carregar a lista de estudantes.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ATUALIZAR AO ABRIR A TELA (não recarrega a cada letra digitada)
  useFocusEffect(
    useCallback(() => {
      fetchStudents();
    }, [])
  );

  // BUSCA (nome ou e-mail)
  const filtered = useMemo(() => {
    const term = normalize(search.trim());
    if (!term) return allStudents;

    return allStudents.filter(
      (s) =>
        normalize(s.nome || s.name).includes(term) ||
        normalize(s.email).includes(term)
    );
  }, [allStudents, search]);

  // PAGINAÇÃO
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const students = useMemo(
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
  const promptDelete = (student) => {
    setStudentToDelete(student);
    setDeleteModalVisible(true);
  };

  // EXCLUIR ALUNO
  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;

    try {
      setDeleting(true);

      await api.deleteStudent(studentToDelete.id);

      setDeleteModalVisible(false);
      setStudentToDelete(null);

      Alert.alert('Sucesso', 'Estudante excluído com sucesso.');

      fetchStudents();
    } catch (err) {
      console.log('Erro ao excluir aluno:', err);

      Alert.alert(
        'Erro',
        err.message || 'Não foi possível excluir o estudante.'
      );
    } finally {
      setDeleting(false);
    }
  };

  // ACESSO RESTRITO
  if (!isTeacher) {
    return (
      <View style={styles.container}>
        <Header title="Gestão de Alunos" navigation={navigation} />

        <View style={styles.centerContainer}>
          <Ionicons
            name="lock-closed-outline"
            size={56}
            color={colors.danger}
          />

          <Text style={styles.deniedTitle}>Acesso Restrito</Text>

          <Text style={styles.deniedSubtitle}>
            Apenas docentes autenticados podem visualizar e gerenciar os
            estudantes.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Estudantes"
        subtitle="Quadro de Alunos"
        navigation={navigation}
      />

      {/* BUSCA */}
      <View style={styles.searchBarContainer}>
        <SearchBar
          value={search}
          onChangeText={handleSearchChange}
          placeholder="Buscar estudante por nome, e-mail..."
        />
      </View>

      {/* CABEÇALHO E BOTÃO NOVO ALUNO */}
      <View style={styles.actionHeader}>
        <Text style={styles.sectionTitle}>Alunos Cadastrados</Text>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('CreateStudent')}
        >
          <Ionicons name="person-add" size={16} color="#FFFFFF" />

          <Text style={styles.addButtonText}>Novo Aluno</Text>
        </TouchableOpacity>
      </View>

      {/* CARREGAMENTO */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />

          <Text style={styles.loadingText}>Carregando estudantes...</Text>
        </View>
      ) : (
        <FlatList
          data={students}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => {
            const studentName = item.nome || item.name || 'Aluno';

            return (
              <View style={styles.card}>
                {/* INFORMAÇÕES DO ALUNO */}
                <View style={styles.cardHeader}>
                  <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>
                      {studentName.charAt(0).toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.infoContainer}>
                    <Text style={styles.nome}>{studentName}</Text>

                    <Text style={styles.email}>{item.email}</Text>
                  </View>
                </View>

                {/* AÇÕES */}
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={[styles.btnAction, styles.btnEdit]}
                    onPress={() =>
                      navigation.navigate('EditStudent', {
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
                name="school-outline"
                size={48}
                color={colors.textMuted}
              />

              <Text style={styles.emptyTitle}>
                Nenhum estudante encontrado
              </Text>
            </View>
          }
        />
      )}

      {/* MODAL DE EXCLUSÃO */}
      <ConfirmModal
        visible={deleteModalVisible}
        title="Excluir Estudante"
        message={`Deseja realmente remover o aluno ${
          studentToDelete?.nome || studentToDelete?.name || ''
        } do sistema?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalVisible(false)}
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
    backgroundColor: colors.studentBadge,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },

  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.studentText
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