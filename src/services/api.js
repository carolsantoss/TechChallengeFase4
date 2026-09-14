import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const DEFAULT_PORT = '3000';
const DEFAULT_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const DEFAULT_URL = `http://${DEFAULT_HOST}:${DEFAULT_PORT}/api`;
const API_URL_KEY = '@fiap_blog_api_url';

export const getBaseUrl = async () => {
  try {
    const custom = await AsyncStorage.getItem(API_URL_KEY);
    if (custom) return custom;
  } catch (e) {}
  return DEFAULT_URL;
};

export const setBaseUrl = async (newUrl) => {
  try {
    const formatted = newUrl.replace(/\/+$/, '');
    const finalUrl = formatted.endsWith('/api') ? formatted : `${formatted}/api`;
    await AsyncStorage.setItem(API_URL_KEY, finalUrl);
    return finalUrl;
  } catch (e) {
    return DEFAULT_URL;
  }
};

export const resetBaseUrl = async () => {
  try {
    await AsyncStorage.removeItem(API_URL_KEY);
  } catch (e) {}
  return DEFAULT_URL;
};

const request = async (endpoint, options = {}) => {
  const baseUrl = await getBaseUrl();
  const url = `${baseUrl}${endpoint}`;

  const token = await AsyncStorage.getItem('@fiap_blog_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ message: 'Erro na requisição' }));
    throw new Error(errorBody.message || `Erro ${response.status}`);
  }

  return response.json();
};

export const api = {
  login: async (email, password, role) => {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role })
    });
  },

  getPosts: async (search = '') => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return request(`/posts${query}`, { method: 'GET' });
  },

  getPostById: async (id) => {
    return request(`/posts/${id}`, { method: 'GET' });
  },

  createPost: async (postData) => {
    return request('/posts', {
      method: 'POST',
      body: JSON.stringify(postData)
    });
  },

  updatePost: async (id, postData) => {
    return request(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(postData)
    });
  },

  deletePost: async (id) => {
    return request(`/posts/${id}`, {
      method: 'DELETE'
    });
  },

  addComment: async (postId, commentData) => {
    return request(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify(commentData)
    });
  },

  getTeachers: async (page = 1, limit = 4, search = '') => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...(search ? { search } : {})
    });
    return request(`/teachers?${params.toString()}`, { method: 'GET' });
  },

  getTeacherById: async (id) => {
    return request(`/teachers/${id}`, { method: 'GET' });
  },

  createTeacher: async (teacherData) => {
    return request('/teachers', {
      method: 'POST',
      body: JSON.stringify(teacherData)
    });
  },

  updateTeacher: async (id, teacherData) => {
    return request(`/teachers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(teacherData)
    });
  },

  deleteTeacher: async (id) => {
    return request(`/teachers/${id}`, {
      method: 'DELETE'
    });
  },

  getStudents: async (page = 1, limit = 4, search = '') => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...(search ? { search } : {})
    });
    return request(`/students?${params.toString()}`, { method: 'GET' });
  },

  getStudentById: async (id) => {
    return request(`/students/${id}`, { method: 'GET' });
  },

  createStudent: async (studentData) => {
    return request('/students', {
      method: 'POST',
      body: JSON.stringify(studentData)
    });
  },

  updateStudent: async (id, studentData) => {
    return request(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(studentData)
    });
  },

  deleteStudent: async (id) => {
    return request(`/students/${id}`, {
      method: 'DELETE'
    });
  }
};
