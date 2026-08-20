const express = require('express');
const { PrismaClient } = require('@prisma/client');
const autenticarToken = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * RF-04 e RF-05: CRUD de Tarefas + Vínculo de Dados
 * Todas as rotas são protegidas.
 * Um usuário só consegue ver/criar/editar/excluir as próprias tarefas.
 */

// Todas as rotas usam autenticação
router.use(autenticarToken);

/**
 * GET /tasks
 * Lista todas as tarefas do usuário autenticado
 */
router.get('/', async (req, res) => {
  try {
    const tarefas = await prisma.task.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json(tarefas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao listar tarefas.' });
  }
});

/**
 * GET /tasks/:id
 * Busca uma tarefa específica (somente se pertencer ao usuário)
 */
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const tarefa = await prisma.task.findFirst({
      where: {
        id,
        userId: req.userId // Garante que é do usuário logado
      }
    });

    if (!tarefa) {
      return res.status(404).json({ erro: 'Tarefa não encontrada ou você não tem permissão.' });
    }

    res.json(tarefa);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao buscar tarefa.' });
  }
});

/**
 * POST /tasks
 * Cria uma nova tarefa vinculada ao usuário autenticado
 * Título e descrição são obrigatórios (RF-04)
 */
router.post('/', async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ erro: 'Título e descrição são obrigatórios.' });
    }

    if (title.trim().length === 0 || description.trim().length === 0) {
      return res.status(400).json({ erro: 'Título e descrição não podem ser vazios.' });
    }

    const novaTarefa = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        userId: req.userId // Vínculo obrigatório (RF-05)
      }
    });

    res.status(201).json({
      mensagem: 'Tarefa criada com sucesso!',
      tarefa: novaTarefa
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao criar tarefa.' });
  }
});

/**
 * PUT /tasks/:id
 * Atualiza uma tarefa (somente se pertencer ao usuário)
 */
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { title, description } = req.body;

    // Verifica se a tarefa existe e pertence ao usuário
    const tarefaExistente = await prisma.task.findFirst({
      where: { id, userId: req.userId }
    });

    if (!tarefaExistente) {
      return res.status(404).json({ erro: 'Tarefa não encontrada ou você não tem permissão.' });
    }

    // Monta os dados a atualizar
    const data = {};
    if (title !== undefined) {
      if (title.trim().length === 0) {
        return res.status(400).json({ erro: 'Título não pode ser vazio.' });
      }
      data.title = title.trim();
    }
    if (description !== undefined) {
      if (description.trim().length === 0) {
        return res.status(400).json({ erro: 'Descrição não pode ser vazia.' });
      }
      data.description = description.trim();
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ erro: 'Nenhum dado para atualizar.' });
    }

    const tarefaAtualizada = await prisma.task.update({
      where: { id },
      data
    });

    res.json({
      mensagem: 'Tarefa atualizada com sucesso!',
      tarefa: tarefaAtualizada
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao atualizar tarefa.' });
  }
});

/**
 * DELETE /tasks/:id
 * Exclui uma tarefa (somente se pertencer ao usuário)
 */
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // Verifica se a tarefa existe e pertence ao usuário
    const tarefaExistente = await prisma.task.findFirst({
      where: { id, userId: req.userId }
    });

    if (!tarefaExistente) {
      return res.status(404).json({ erro: 'Tarefa não encontrada ou você não tem permissão.' });
    }

    await prisma.task.delete({ where: { id } });

    res.json({ mensagem: 'Tarefa excluída com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao excluir tarefa.' });
  }
});

module.exports = router;
