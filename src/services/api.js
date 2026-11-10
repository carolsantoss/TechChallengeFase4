
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEFAULT_URL = 'https://techchallenger.duckdns.org';
const API_URL_KEY = '@fiap_blog_api_url';

export const getBaseUrl = async () => {
  try {
    const custom = await AsyncStorage.getItem(API_URL_KEY);
    if (custom) return custom.replace(/\/+$/, '');
  } catch (e) {}

  return DEFAULT_URL;
};

export const setBaseUrl = async (newUrl) => {
  try {
    const formatted = newUrl.trim().replace(/\/+$/, '');
    await AsyncStorage.setItem(API_URL_KEY, formatted);
    return formatted;
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

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({
      message: 'Erro na requisição'
    }));

    throw new Error(errorBody.message || `Erro ${response.status}`);
  }

  return response.json();
};

const buildUserParams = (role, page, limit, search) => {
  const params = new URLSearchParams({
    role,
    page: String(page),
    limit: String(limit)
  });

  if (search) {
    params.append('search', search);
  }

  return params.toString();
};

export const api = {
  // AUTENTICAÇÃO
  login: async (email, password, role) => {
  return request('/login', {
    method: 'POST',
    body: JSON.stringify({
      email,
      senha: password
    })
  });
},

  // POSTS
  getPosts: async (search = '') => {
    const query = search
      ? `?search=${encodeURIComponent(search)}`
      : '';

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

  // USUÁRIOS
  getUsers: async (page = 1, limit = 4, search = '', role = '') => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit)
    });

    if (role) params.append('role', role);
    if (search) params.append('search', search);

    return request(`/users?${params.toString()}`, {
      method: 'GET'
    });
  },

  getUserById: async (id) => {
    return request(`/users/${id}`, { method: 'GET' });
  },

  createUser: async (userData) => {
    return request('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  updateUser: async (id, userData) => {
    return request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  },

  deleteUser: async (id) => {
    return request(`/users/${id}`, {
      method: 'DELETE'
    });
  },

  // DOCENTES
  getTeachers: async (page = 1, limit = 4, search = '') => {
    const params = buildUserParams('docente', page, limit, search);

    return request(`/users?${params}`, { method: 'GET' });
  },

  getTeacherById: async (id) => {
    return request(`/users/${id}`, { method: 'GET' });
  },

  createTeacher: async (teacherData) => {
    return request('/users', {
      method: 'POST',
      body: JSON.stringify({
        ...teacherData,
        role: 'docente'
      })
    });
  },

  updateTeacher: async (id, teacherData) => {
    return request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...teacherData,
        role: 'docente'
      })
    });
  },

  deleteTeacher: async (id) => {
    return request(`/users/${id}`, {
      method: 'DELETE'
    });
  },

  // ALUNOS
  getStudents: async (page = 1, limit = 4, search = '') => {
    const params = buildUserParams('aluno', page, limit, search);

    return request(`/users?${params}`, { method: 'GET' });
  },

  getStudentById: async (id) => {
    return request(`/users/${id}`, { method: 'GET' });
  },

  createStudent: async (studentData) => {
    return request('/users', {
      method: 'POST',
      body: JSON.stringify({
        ...studentData,
        role: 'aluno'
      })
    });
  },

  updateStudent: async (id, studentData) => {
    return request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...studentData,
        role: 'aluno'
      })
    });
  },

  deleteStudent: async (id) => {
    return request(`/users/${id}`, {
      method: 'DELETE'
    });
  },
};
