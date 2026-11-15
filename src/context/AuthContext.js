
import React, {
  createContext,
  useState,
  useEffect,
  useContext
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

const AuthContext = createContext(null);

const USER_STORAGE_KEY = '@fiap_blog_user';
const TOKEN_STORAGE_KEY = '@fiap_blog_token';

// Padroniza os papéis utilizados pelo aplicativo e pelo backend.
const normalizeRole = (role) => {
  if (role === 'teacher') return 'docente';
  if (role === 'student') return 'aluno';
  return role;
};

// Mantém compatibilidade com telas que utilizam user.name
// e com o backend, que retorna user.nome.
const normalizeUser = (usuario) => {
  const role = normalizeRole(usuario.role);

  return {
    ...usuario,
    role,
    name: usuario.name || usuario.nome || '',
    nome: usuario.nome || usuario.name || ''
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
      const storedToken = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);

      if (storedUser && storedToken) {
        const parsedUser = normalizeUser(JSON.parse(storedUser));

        setUser(parsedUser);
        setToken(storedToken);
      }
    } catch (error) {
      console.log('Erro ao recuperar autenticação:', error);

      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, role) => {
    try {
      // Converte teacher/student para docente/aluno antes de enviar.
      const backendRole = normalizeRole(role);

      const response = await api.login(
        email,
        password,
        backendRole
      );

      // O backend retorna { token, usuario }.
      const authToken = response?.token;
      const loggedUser = response?.usuario;

      if (!authToken || !loggedUser) {
        throw new Error(
          'Resposta inválida do servidor. Token ou usuário não encontrado.'
        );
      }

      const normalizedUser = normalizeUser(loggedUser);

      // Salva os dados antes de atualizar o estado.
      await AsyncStorage.setItem(
        USER_STORAGE_KEY,
        JSON.stringify(normalizedUser)
      );

      await AsyncStorage.setItem(
        TOKEN_STORAGE_KEY,
        authToken
      );

      setUser(normalizedUser);
      setToken(authToken);

      return {
        success: true,
        user: normalizedUser
      };

    } catch (error) {
      console.log('Erro no login:', error);

      // Não cria usuário ou token fictício.
      // Se o servidor rejeitar o login, o aplicativo também rejeita.
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
    } finally {
      setUser(null);
      setToken(null);
    }
  };

  const isAuthenticated = !!user && !!token;

  const isAdmin = user?.role === 'admin';
  const isDocente = user?.role === 'docente';

  // Admin também pode acessar as funcionalidades de docente.
  const isTeacher = isDocente || isAdmin;
  const isStudent = user?.role === 'aluno';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isTeacher,
        isDocente,
        isStudent,
        isAdmin,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth deve ser usado dentro de um AuthProvider'
    );
  }

  return context;
};
