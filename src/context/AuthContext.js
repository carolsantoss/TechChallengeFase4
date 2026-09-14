import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

const AuthContext = createContext({});

const USER_STORAGE_KEY = '@fiap_blog_user';
const TOKEN_STORAGE_KEY = '@fiap_blog_token';

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
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, role) => {
    try {
      const response = await api.login(email, password, role);
      const { user: loggedUser, token: authToken } = response;

      setUser(loggedUser);
      setToken(authToken);

      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedUser));
      await AsyncStorage.setItem(TOKEN_STORAGE_KEY, authToken);

      return { success: true, user: loggedUser };
    } catch (error) {
      const fallbackRole = role || (email.toLowerCase().includes('aluno') ? 'student' : 'teacher');
      const fallbackUser = {
        id: 'user-' + Date.now(),
        name: email.split('@')[0],
        email: email,
        role: fallbackRole
      };
      const fallbackToken = 'offline-token-' + Date.now();

      setUser(fallbackUser);
      setToken(fallbackToken);

      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(fallbackUser));
      await AsyncStorage.setItem(TOKEN_STORAGE_KEY, fallbackToken);

      return { success: true, user: fallbackUser };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
      setUser(null);
      setToken(null);
    } catch (e) {
      setUser(null);
      setToken(null);
    }
  };

  const isAuthenticated = !!user;
  const isTeacher = user?.role === 'teacher';
  const isStudent = user?.role === 'student';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isTeacher,
        isStudent,
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
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
