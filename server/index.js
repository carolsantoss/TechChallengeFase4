const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const DATA_DIR = path.join(__dirname, 'data');
const POSTS_FILE = path.join(DATA_DIR, 'posts.json');
const TEACHERS_FILE = path.join(DATA_DIR, 'teachers.json');
const STUDENTS_FILE = path.join(DATA_DIR, 'students.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const loadData = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(raw);
    }
    fs.writeFileSync(filePath, JSON.stringify([], null, 2), 'utf-8');
    return [];
  } catch (e) {
    return [];
  }
};

const saveData = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {}
};

let posts = loadData(POSTS_FILE);
let teachers = loadData(TEACHERS_FILE);
let students = loadData(STUDENTS_FILE);

app.post('/api/auth/login', (req, res) => {
  const { email, password, role } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'E-mail é obrigatório' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const selectedRole = role || (normalizedEmail.includes('aluno') ? 'student' : 'teacher');
  const extractedName = email.split('@')[0].replace(/[._-]/g, ' ');
  const formattedName = extractedName.charAt(0).toUpperCase() + extractedName.slice(1);

  if (selectedRole === 'teacher') {
    let teacher = teachers.find(t => t.email.toLowerCase() === normalizedEmail);
    if (!teacher) {
      teacher = {
        id: String(Date.now()),
        name: formattedName,
        email: normalizedEmail,
        department: 'Docência',
        title: 'Professor(a)'
      };
      teachers.push(teacher);
      saveData(TEACHERS_FILE, teachers);
    }

    return res.json({
      token: 'jwt-teacher-token-' + Date.now(),
      user: {
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        role: 'teacher'
      }
    });
  }

  let student = students.find(s => s.email.toLowerCase() === normalizedEmail);
  if (!student) {
    student = {
      id: String(Date.now()),
      name: formattedName,
      email: normalizedEmail,
      registrationNumber: 'RM' + Math.floor(10000 + Math.random() * 90000),
      course: 'Graduação'
    };
    students.push(student);
    saveData(STUDENTS_FILE, students);
  }

  return res.json({
    token: 'jwt-student-token-' + Date.now(),
    user: {
      id: student.id,
      name: student.name,
      email: student.email,
      role: 'student'
    }
  });
});

app.get('/api/posts', (req, res) => {
  const { search } = req.query;
  let filtered = [...posts];

  if (search) {
    const term = search.toLowerCase();
    filtered = filtered.filter(p =>
      (p.title && p.title.toLowerCase().includes(term)) ||
      (p.description && p.description.toLowerCase().includes(term)) ||
      (p.author && p.author.toLowerCase().includes(term)) ||
      (p.content && p.content.toLowerCase().includes(term))
    );
  }

  res.json(filtered);
});

app.get('/api/posts/:id', (req, res) => {
  const post = posts.find(p => p.id === req.params.id);
  if (!post) {
    return res.status(404).json({ message: 'Post não encontrado' });
  }
  res.json(post);
});

app.post('/api/posts', (req, res) => {
  const { title, content, author, description } = req.body;

  if (!title || !content || !author) {
    return res.status(400).json({ message: 'Título, conteúdo e autor são obrigatórios' });
  }

  const newPost = {
    id: String(Date.now()),
    title,
    content,
    author,
    description: description || content.substring(0, 100) + '...',
    createdAt: new Date().toISOString(),
    comments: []
  };

  posts.unshift(newPost);
  saveData(POSTS_FILE, posts);
  res.status(201).json(newPost);
});

app.put('/api/posts/:id', (req, res) => {
  const index = posts.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Post não encontrado' });
  }

  const { title, content, author, description } = req.body;

  posts[index] = {
    ...posts[index],
    title: title || posts[index].title,
    content: content || posts[index].content,
    author: author || posts[index].author,
    description: description || posts[index].description
  };

  saveData(POSTS_FILE, posts);
  res.json(posts[index]);
});

app.delete('/api/posts/:id', (req, res) => {
  const index = posts.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Post não encontrado' });
  }

  const deleted = posts.splice(index, 1);
  saveData(POSTS_FILE, posts);
  res.json({ message: 'Post excluído com sucesso', post: deleted[0] });
});

app.post('/api/posts/:id/comments', (req, res) => {
  const post = posts.find(p => p.id === req.params.id);
  if (!post) {
    return res.status(404).json({ message: 'Post não encontrado' });
  }

  const { author, content, authorRole } = req.body;
  if (!author || !content) {
    return res.status(400).json({ message: 'Autor e conteúdo são obrigatórios' });
  }

  const newComment = {
    id: 'c' + Date.now(),
    author,
    authorRole: authorRole || 'student',
    content,
    createdAt: new Date().toISOString()
  };

  if (!post.comments) {
    post.comments = [];
  }

  post.comments.push(newComment);
  saveData(POSTS_FILE, posts);
  res.status(201).json(newComment);
});

app.get('/api/teachers', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 4;
  const search = req.query.search || '';

  let filtered = [...teachers];
  if (search) {
    const term = search.toLowerCase();
    filtered = filtered.filter(t =>
      (t.name && t.name.toLowerCase().includes(term)) ||
      (t.email && t.email.toLowerCase().includes(term)) ||
      (t.department && t.department.toLowerCase().includes(term))
    );
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const startIndex = (page - 1) * limit;
  const data = filtered.slice(startIndex, startIndex + limit);

  res.json({
    data,
    total,
    page,
    limit,
    totalPages
  });
});

app.get('/api/teachers/:id', (req, res) => {
  const teacher = teachers.find(t => t.id === req.params.id);
  if (!teacher) {
    return res.status(404).json({ message: 'Professor não encontrado' });
  }
  res.json(teacher);
});

app.post('/api/teachers', (req, res) => {
  const { name, email, department, title } = req.body;
  if (!name || !email) {
    return res.status(400).json({ message: 'Nome e e-mail são obrigatórios' });
  }

  const newTeacher = {
    id: String(Date.now()),
    name,
    email,
    department: department || 'Geral',
    title: title || 'Professor'
  };

  teachers.push(newTeacher);
  saveData(TEACHERS_FILE, teachers);
  res.status(201).json(newTeacher);
});

app.put('/api/teachers/:id', (req, res) => {
  const index = teachers.findIndex(t => t.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Professor não encontrado' });
  }

  const { name, email, department, title } = req.body;

  teachers[index] = {
    ...teachers[index],
    name: name || teachers[index].name,
    email: email || teachers[index].email,
    department: department !== undefined ? department : teachers[index].department,
    title: title !== undefined ? title : teachers[index].title
  };

  saveData(TEACHERS_FILE, teachers);
  res.json(teachers[index]);
});

app.delete('/api/teachers/:id', (req, res) => {
  const index = teachers.findIndex(t => t.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Professor não encontrado' });
  }

  const deleted = teachers.splice(index, 1);
  saveData(TEACHERS_FILE, teachers);
  res.json({ message: 'Professor excluído com sucesso', teacher: deleted[0] });
});

app.get('/api/students', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 4;
  const search = req.query.search || '';

  let filtered = [...students];
  if (search) {
    const term = search.toLowerCase();
    filtered = filtered.filter(s =>
      (s.name && s.name.toLowerCase().includes(term)) ||
      (s.email && s.email.toLowerCase().includes(term)) ||
      (s.registrationNumber && s.registrationNumber.toLowerCase().includes(term)) ||
      (s.course && s.course.toLowerCase().includes(term))
    );
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const startIndex = (page - 1) * limit;
  const data = filtered.slice(startIndex, startIndex + limit);

  res.json({
    data,
    total,
    page,
    limit,
    totalPages
  });
});

app.get('/api/students/:id', (req, res) => {
  const student = students.find(s => s.id === req.params.id);
  if (!student) {
    return res.status(404).json({ message: 'Estudante não encontrado' });
  }
  res.json(student);
});

app.post('/api/students', (req, res) => {
  const { name, email, registrationNumber, course } = req.body;
  if (!name || !email) {
    return res.status(400).json({ message: 'Nome e e-mail são obrigatórios' });
  }

  const newStudent = {
    id: String(Date.now()),
    name,
    email,
    registrationNumber: registrationNumber || 'RM' + Math.floor(10000 + Math.random() * 90000),
    course: course || 'Tecnologia'
  };

  students.push(newStudent);
  saveData(STUDENTS_FILE, students);
  res.status(201).json(newStudent);
});

app.put('/api/students/:id', (req, res) => {
  const index = students.findIndex(s => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Estudante não encontrado' });
  }

  const { name, email, registrationNumber, course } = req.body;

  students[index] = {
    ...students[index],
    name: name || students[index].name,
    email: email || students[index].email,
    registrationNumber: registrationNumber !== undefined ? registrationNumber : students[index].registrationNumber,
    course: course !== undefined ? course : students[index].course
  };

  saveData(STUDENTS_FILE, students);
  res.json(students[index]);
});

app.delete('/api/students/:id', (req, res) => {
  const index = students.findIndex(s => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Estudante não encontrado' });
  }

  const deleted = students.splice(index, 1);
  saveData(STUDENTS_FILE, students);
  res.json({ message: 'Estudante excluído com sucesso', student: deleted[0] });
});

app.listen(PORT, () => {
  console.log(`Backend REST API rodando na porta ${PORT}`);
});
