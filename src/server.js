require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const tasksRoutes = require('./routes/tasks');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors()); // Permite requisições do frontend (React)
app.use(express.json()); // Parse do body JSON

// Rotas
app.use('/auth', authRoutes);       // POST /auth/register , POST /auth/login
app.use('/users', usersRoutes);     // CRUD de usuários (protegido)
app.use('/tasks', tasksRoutes);     // CRUD de tarefas (protegido + vínculo)

// Rota de health check
app.get('/', (req, res) => {
  res.json({
    mensagem: 'API To-Do List funcionando!',
    endpoints: {
      auth: ['POST /auth/register', 'POST /auth/login'],
      users: ['GET /users', 'GET /users/:id', 'PUT /users/:id', 'DELETE /users/:id'],
      tasks: ['GET /tasks', 'GET /tasks/:id', 'POST /tasks', 'PUT /tasks/:id', 'DELETE /tasks/:id']
    }
  });
});

// Middleware de erro genérico
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ erro: 'Erro interno do servidor.' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📋 Documentação rápida em http://localhost:${PORT}/`);
});
