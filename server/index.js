
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ==========================================
// ARQUIVOS E PERSISTÊNCIA
// ==========================================

const DATA_DIR = path.join(__dirname, 'data');

const POSTS_FILE = path.join(DATA_DIR, 'posts.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Arquivos antigos, usados somente na migração inicial
const TEACHERS_FILE = path.join(DATA_DIR, 'teachers.json');
const STUDENTS_FILE = path.join(DATA_DIR, 'students.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const loadData = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([], null, 2), 'utf-8');
      return [];
    }

    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw);

    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(`Erro ao carregar ${filePath}:`, error);
    return [];
  }
};

const saveData = (filePath, data) => {
  try {
    fs.writeFileSync(
      filePath,
      JSON.stringify(data, null, 2),
      'utf-8'
    );

    return true;
  } catch (error) {
    console.error(`Erro ao salvar ${filePath}:`, error);
    return false;
  }
};

// ==========================================
// CARREGAMENTO DOS DADOS
// ==========================================

let posts = loadData(POSTS_FILE);
let users = [];

// Migra os dados antigos somente se users.json ainda não existir
if (fs.existsSync(USERS_FILE)) {
  users = loadData(USERS_FILE);
} else {
  const oldTeachers = loadData(TEACHERS_FILE);
  const oldStudents = loadData(STUDENTS_FILE);

  const teachers = oldTeachers.map(teacher => ({
    ...teacher,
    role: 'docente'
  }));

  const students = oldStudents.map(student => ({
    ...student,
    role: 'aluno'
  }));

  users = [...teachers, ...students];

  saveData(USERS_FILE, users);

  console.log('Migração inicial de usuários concluída.');
}

const VALID_ROLES = ['docente', 'aluno', 'admin'];

const normalizeEmail = (email) => {
  return String(email || '').trim().toLowerCase();
};

const normalizeRole = (role) => {
  if (role === 'teacher') return 'docente';
  if (role === 'student') return 'aluno';

  return role;
};

const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

// ==========================================
// LOGIN
// ==========================================

app.post('/login', (req, res) => {
  const { email, role } = req.body;

  if (!email || !String(email).trim()) {
    return res.status(400).json({
      message: 'E-mail é obrigatório'
    });
  }

  const normalizedEmail = normalizeEmail(email);

  let user = users.find(
    item => normalizeEmail(item.email) === normalizedEmail
  );

  // Mantém a criação automática usada no login atual
  if (!user) {
    let selectedRole = normalizeRole(role);

    if (!selectedRole) {
      selectedRole = normalizedEmail.includes('aluno')
        ? 'aluno'
        : 'docente';
    }

    // Não permite criar administrador pelo login automático
    if (!['docente', 'aluno'].includes(selectedRole)) {
      return res.status(400).json({
        message: 'Tipo de usuário inválido para login'
      });
    }

    const extractedName = normalizedEmail
      .split('@')[0]
      .replace(/[._-]/g, ' ');

    const formattedName =
      extractedName.charAt(0).toUpperCase() +
      extractedName.slice(1);

    user = {
      id: generateId(),
      name: formattedName,
      email: normalizedEmail,
      role: selectedRole
    };

    if (selectedRole === 'docente') {
      user.department = 'Docência';
      user.title = 'Professor(a)';
    }

    if (selectedRole === 'aluno') {
      user.registrationNumber =
        'RM' + Math.floor(10000 + Math.random() * 90000);

      user.course = 'Graduação';
    }

    users.push(user);
    saveData(USERS_FILE, users);
  }

  res.json({
    token: 'demo-token-' + Date.now(),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

// ==========================================
// POSTS - LISTAR E PESQUISAR
// ==========================================

// GET /posts
// GET /posts?search=palavra
app.get('/posts', (req, res) => {
  const search = String(req.query.search || '').toLowerCase();

  let filtered = [...posts];

  if (search) {
    filtered = filtered.filter(post =>
      (post.title || '').toLowerCase().includes(search) ||
      (post.description || '').toLowerCase().includes(search) ||
      (post.author || '').toLowerCase().includes(search) ||
      (post.content || '').toLowerCase().includes(search)
    );
  }

  res.json(filtered);
});

// GET /posts/search?q=palavra
// Esta rota deve ficar antes de /posts/:id
app.get('/posts/search', (req, res) => {
  const search = String(
    req.query.q || req.query.search || ''
  ).toLowerCase();

  if (!search.trim()) {
    return res.status(400).json({
      message: 'Informe uma palavra para pesquisar'
    });
  }

  const filtered = posts.filter(post =>
    (post.title || '').toLowerCase().includes(search) ||
    (post.description || '').toLowerCase().includes(search) ||
    (post.author || '').toLowerCase().includes(search) ||
    (post.content || '').toLowerCase().includes(search)
  );

  res.json(filtered);
});

// ==========================================
// POSTS - CONSULTAR POR ID
// ==========================================

app.get('/posts/:id', (req, res) => {
  const post = posts.find(
    item => item.id === req.params.id
  );

  if (!post) {
    return res.status(404).json({
      message: 'Post não encontrado'
    });
  }

  res.json(post);
});

// ==========================================
// POSTS - CRIAR
// ==========================================

app.post('/posts', (req, res) => {
  const { title, content, author, description } = req.body;

  if (!title || !content || !author) {
    return res.status(400).json({
      message: 'Título, conteúdo e autor são obrigatórios'
    });
  }

  const newPost = {
    id: generateId(),
    title,
    content,
    author,
    description:
      description || content.substring(0, 100) + '...',
    createdAt: new Date().toISOString(),
    comments: []
  };

  posts.unshift(newPost);

  if (!saveData(POSTS_FILE, posts)) {
    posts.shift();

    return res.status(500).json({
      message: 'Erro ao salvar postagem'
    });
  }

  res.status(201).json(newPost);
});

// ==========================================
// POSTS - EDITAR
// ==========================================

app.put('/posts/:id', (req, res) => {
  const index = posts.findIndex(
    item => item.id === req.params.id
  );

  if (index === -1) {
    return res.status(404).json({
      message: 'Post não encontrado'
    });
  }

  const { title, content, author, description } = req.body;

  const updatedPost = {
    ...posts[index],
    title: title ?? posts[index].title,
    content: content ?? posts[index].content,
    author: author ?? posts[index].author,
    description: description ?? posts[index].description
  };

  posts[index] = updatedPost;

  if (!saveData(POSTS_FILE, posts)) {
    return res.status(500).json({
      message: 'Erro ao salvar alteração da postagem'
    });
  }

  res.json(updatedPost);
});

// ==========================================
// POSTS - EXCLUIR
// ==========================================

app.delete('/posts/:id', (req, res) => {
  const index = posts.findIndex(
    item => item.id === req.params.id
  );

  if (index === -1) {
    return res.status(404).json({
      message: 'Post não encontrado'
    });
  }

  const deleted = posts.splice(index, 1)[0];

  if (!saveData(POSTS_FILE, posts)) {
    posts.splice(index, 0, deleted);

    return res.status(500).json({
      message: 'Erro ao excluir postagem'
    });
  }

  res.json({
    message: 'Post excluído com sucesso',
    post: deleted
  });
});

// ==========================================
// COMENTÁRIOS DOS POSTS
// ==========================================

app.post('/posts/:id/comments', (req, res) => {
  const post = posts.find(
    item => item.id === req.params.id
  );

  if (!post) {
    return res.status(404).json({
      message: 'Post não encontrado'
    });
  }

  const { author, content, authorRole } = req.body;

  if (!author || !content) {
    return res.status(400).json({
      message: 'Autor e conteúdo são obrigatórios'
    });
  }

  const normalizedAuthorRole = normalizeRole(authorRole);

  const newComment = {
    id: 'c' + generateId(),
    author,
    authorRole: VALID_ROLES.includes(normalizedAuthorRole)
      ? normalizedAuthorRole
      : 'aluno',
    content,
    createdAt: new Date().toISOString()
  };

  if (!Array.isArray(post.comments)) {
    post.comments = [];
  }

  post.comments.push(newComment);

  if (!saveData(POSTS_FILE, posts)) {
    post.comments.pop();

    return res.status(500).json({
      message: 'Erro ao salvar comentário'
    });
  }

  res.status(201).json(newComment);
});

// ==========================================
// USERS - LISTAR
// ==========================================

// GET /users
// GET /users?role=docente
// GET /users?role=aluno
// GET /users?role=admin
// GET /users?search=nome&page=1&limit=4

app.get('/users', (req, res) => {
  const page = Math.max(
    1,
    parseInt(req.query.page, 10) || 1
  );

  const limit = Math.max(
    1,
    Math.min(100, parseInt(req.query.limit, 10) || 4)
  );

  const search = String(req.query.search || '').toLowerCase();
  const role = req.query.role
    ? normalizeRole(req.query.role)
    : '';

  let filtered = [...users];

  if (role) {
    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({
        message: 'Tipo de usuário inválido'
      });
    }

    filtered = filtered.filter(
      user => user.role === role
    );
  }

  if (search) {
    filtered = filtered.filter(user =>
      (user.name || '').toLowerCase().includes(search) ||
      (user.email || '').toLowerCase().includes(search) ||
      (user.department || '').toLowerCase().includes(search) ||
      (user.title || '').toLowerCase().includes(search) ||
      (user.course || '').toLowerCase().includes(search) ||
      (user.registrationNumber || '').toLowerCase().includes(search)
    );
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const startIndex = (page - 1) * limit;

  const data = filtered.slice(
    startIndex,
    startIndex + limit
  );

  res.json({
    data,
    total,
    page,
    limit,
    totalPages
  });
});

// ==========================================
// USERS - CONSULTAR POR ID
// ==========================================

app.get('/users/:id', (req, res) => {
  const user = users.find(
    item => item.id === req.params.id
  );

  if (!user) {
    return res.status(404).json({
      message: 'Usuário não encontrado'
    });
  }

  res.json(user);
});

// ==========================================
// USERS - CADASTRAR
// ==========================================

app.post('/users', (req, res) => {
  const {
    name,
    email,
    role,
    department,
    title,
    registrationNumber,
    course
  } = req.body;

  if (!name || !email || !role) {
    return res.status(400).json({
      message: 'Nome, e-mail e tipo de usuário são obrigatórios'
    });
  }

  const normalizedRole = normalizeRole(role);

  if (!VALID_ROLES.includes(normalizedRole)) {
    return res.status(400).json({
      message: 'Tipo de usuário inválido'
    });
  }

  const normalizedEmail = normalizeEmail(email);

  if (users.some(
    user => normalizeEmail(user.email) === normalizedEmail
  )) {
    return res.status(409).json({
      message: 'Já existe um usuário com esse e-mail'
    });
  }

  const newUser = {
    id: generateId(),
    name: String(name).trim(),
    email: normalizedEmail,
    role: normalizedRole
  };

  if (normalizedRole === 'docente') {
    newUser.department = department || 'Geral';
    newUser.title = title || 'Professor(a)';
  }

  if (normalizedRole === 'aluno') {
    newUser.registrationNumber =
      registrationNumber ||
      'RM' + Math.floor(10000 + Math.random() * 90000);

    newUser.course = course || 'Tecnologia';
  }

  users.push(newUser);

  if (!saveData(USERS_FILE, users)) {
    users.pop();

    return res.status(500).json({
      message: 'Erro ao salvar usuário'
    });
  }

  res.status(201).json(newUser);
});

// ==========================================
// USERS - EDITAR
// ==========================================

app.put('/users/:id', (req, res) => {
  const index = users.findIndex(
    item => item.id === req.params.id
  );

  if (index === -1) {
    return res.status(404).json({
      message: 'Usuário não encontrado'
    });
  }

  const {
    name,
    email,
    role,
    department,
    title,
    registrationNumber,
    course
  } = req.body;

  const normalizedRole = role
    ? normalizeRole(role)
    : users[index].role;

  if (!VALID_ROLES.includes(normalizedRole)) {
    return res.status(400).json({
      message: 'Tipo de usuário inválido'
    });
  }

  const normalizedEmail = email
    ? normalizeEmail(email)
    : users[index].email;

  const emailAlreadyUsed = users.some(
    (user, userIndex) =>
      userIndex !== index &&
      normalizeEmail(user.email) === normalizedEmail
  );

  if (emailAlreadyUsed) {
    return res.status(409).json({
      message: 'Esse e-mail já pertence a outro usuário'
    });
  }

  const updatedUser = {
    ...users[index],
    name: name !== undefined ? String(name).trim() : users[index].name,
    email: normalizedEmail,
    role: normalizedRole
  };

  if (normalizedRole === 'docente') {
    updatedUser.department =
      department ?? users[index].department ?? 'Geral';

    updatedUser.title =
      title ?? users[index].title ?? 'Professor(a)';

    delete updatedUser.registrationNumber;
    delete updatedUser.course;
  }

  if (normalizedRole === 'aluno') {
    updatedUser.registrationNumber =
      registrationNumber ??
      users[index].registrationNumber ??
      ('RM' + Math.floor(10000 + Math.random() * 90000));

    updatedUser.course =
      course ?? users[index].course ?? 'Tecnologia';

    delete updatedUser.department;
    delete updatedUser.title;
  }

  if (normalizedRole === 'admin') {
    delete updatedUser.department;
    delete updatedUser.title;
    delete updatedUser.registrationNumber;
    delete updatedUser.course;
  }

  const previousUser = users[index];
  users[index] = updatedUser;

  if (!saveData(USERS_FILE, users)) {
    users[index] = previousUser;

    return res.status(500).json({
      message: 'Erro ao salvar alteração do usuário'
    });
  }

  res.json(updatedUser);
});

// ==========================================
// USERS - EXCLUIR
// ==========================================

app.delete('/users/:id', (req, res) => {
  const index = users.findIndex(
    item => item.id === req.params.id
  );

  if (index === -1) {
    return res.status(404).json({
      message: 'Usuário não encontrado'
    });
  }

  const deleted = users.splice(index, 1)[0];

  if (!saveData(USERS_FILE, users)) {
    users.splice(index, 0, deleted);

    return res.status(500).json({
      message: 'Erro ao excluir usuário'
    });
  }

  res.json({
    message: 'Usuário excluído com sucesso',
    user: deleted
  });
});

// ==========================================
// ROTA INICIAL
// ==========================================

app.get('/', (req, res) => {
  res.json({
    message: 'TechChallenge Fase 4 - API funcionando',
    endpoints: {
      login: '/login',
      posts: '/posts',
      users: '/users'
    }
  });
});

// ==========================================
// INICIALIZAÇÃO DO SERVIDOR
// ==========================================

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend REST API rodando na porta ${PORT}`);
  console.log(`Usuários cadastrados: ${users.length}`);
  console.log(`Posts cadastrados: ${posts.length}`);
});
