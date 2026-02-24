const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const db = require('./db');

const JWT_SECRET = 'tvlibras7784';


// register
exports.register = async (req, res) => {
  const { username, email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);

  db.query(
    'INSERT INTO dummy_user (username, email, password) VALUES (?, ?, ?)',
    [username, email, hash],
    (err) => {
      if (err) {
                console.error('ERRO MYSQL:', err);
                return res.status(500).json({
                    error: 'Erro ao criar usuário',
                    details: err.sqlMessage || err.message,
                    code: err.code,
                });
                }
      res.json({ message: 'Usuário criado com sucesso' });
    }
  );
};

// login
exports.login = (req, res) => {
  const { email, password, accountType } = req.body;

  db.query(
    'SELECT * FROM dummy_user WHERE email = ?',
    [email],
    async (err, results) => {
      if (err || results.length === 0) {
        return res.status(401).json({ error: 'Usuário não encontrado' });
      }

      const user = results[0];

      // 🔐 Valida senha
      const valid = await bcrypt.compare(password.trim(), user.password);
      if (!valid) {
        return res.status(401).json({ error: 'Senha inválida' });
      }

      // 🧠 Valida tipo de conta
      if (user.accountType !== accountType) {
        return res.status(403).json({
          error: 'Você não tem permissão para acessar esta conta',
        });
      }

      const token = jwt.sign(
        { id: user.id, accountType: user.accountType },
        JWT_SECRET,
        { expiresIn: '1d' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          name: user.username,
          email: user.email,
          accountType: user.accountType,
        },
      });
    }
  );
};