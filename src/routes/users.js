const express = require('express');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const autenticarToken = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * RF-03: CRUD de Usuários
 * Todas as rotas abaixo (exceto criação que está em /auth/register)
 * exigem autenticação. Por segurança, um usuário só pode ler/atualizar/deletar
 * o próprio perfil (exceto listagem que retorna apenas o próprio).
 */

// GET /users - Lista o próprio usuário autenticado (ou todos se for demo, mas aqui só próprio)
router.get('/', autenticarToken, async (req, res) => {
  try {
    const usuario = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { tasks: true } }
      }
    });

    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    res.json(usuario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao buscar usuário.' });
  }
});

// GET /users/:id - Lê um usuário específico (somente o próprio)
router.get('/:id', autenticarToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (id !== req.userId) {
      return res.status(403).json({ erro: 'Você só pode visualizar o próprio perfil.' });
    }

    const usuario = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    res.json(usuario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao buscar usuário.' });
  }
});

// PUT /users/:id - Atualiza o próprio usuário
router.put('/:id', autenticarToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (id !== req.userId) {
      return res.status(403).json({ erro: 'Você só pode atualizar o próprio perfil.' });
    }

    const { email, password } = req.body;
    const data = {};

    if (email) {
      // Verifica se o novo e-mail já existe em outro usuário
      const existe = await prisma.user.findFirst({
        where: { email, NOT: { id } }
      });
      if (existe) {
        return res.status(409).json({ erro: 'E-mail já está em uso.' });
      }
      data.email = email;
    }

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ erro: 'A senha deve ter no mínimo 6 caracteres.' });
      }
      data.password = await bcrypt.hash(password, 10);
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ erro: 'Nenhum dado para atualizar.' });
    }

    const usuarioAtualizado = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        updatedAt: true
      }
    });

    res.json({
      mensagem: 'Usuário atualizado com sucesso!',
      usuario: usuarioAtualizado
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao atualizar usuário.' });
  }
});

// DELETE /users/:id - Exclui o próprio usuário (e suas tarefas por cascade)
router.delete('/:id', autenticarToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (id !== req.userId) {
      return res.status(403).json({ erro: 'Você só pode excluir o próprio perfil.' });
    }

    await prisma.user.delete({ where: { id } });

    res.json({ mensagem: 'Usuário e suas tarefas foram excluídos com sucesso.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao excluir usuário.' });
  }
});

module.exports = router;
