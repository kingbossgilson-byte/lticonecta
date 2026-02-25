const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'SEGREDO_SUPER_FORTE';


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


// professionalregister
exports.professionalregister = async (req, res) => {

  const { username, email, password, profilePic, cellphone, designation, accountType } = req.body;
  const hash = await bcrypt.hash(password, 10);
  const data = new Date();
  let imagem = profilePic
  
  if (req.file) {
    imagem = `assets/images/${req.file.filename}`;
  }
  console.log("FILE:", imagem);


  db.query(
    'INSERT INTO dummy_user (username, email, password, profilePic, cellphone, designation, accountType, dataCreate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [username, email, hash, imagem, cellphone, designation, accountType, data],
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
      try {
        if (err) {
          console.error("Erro MySQL:", err);
          return res.status(500).json({ error: "Erro no servidor" });
        }

        if (results.length === 0) {
          return res.status(401).json({ error: "Usuário não encontrado" });
        }

        const user = results[0];

        const valid = await bcrypt.compare(password.trim(), user.password);
        if (!valid) {
          return res.status(401).json({ error: "Senha inválida" });
        }

        if (user.accountType !== accountType) {
          return res.status(403).json({
            error: "Você não tem permissão para acessar esta conta",
          });
        }
        console.log("JWT:", process.env.JWT_SECRET);
        const token = jwt.sign(
          { id: user.id, username: user.username, accountType: user.accountType },
          JWT_SECRET,
          { expiresIn: "1d" }
        );

        return res.json({
          token,
          user: {
            id: user.id,
            name: user.username,
            enterprise: user.enterprise,
            summary: user.summary,
            email: user.email,
            accountType: user.accountType,
            designation: user.designation,
            score: user.score,
            profilePic: user.profilePic,
            isAdministrator: user.isAdministrator,
          },
        });

      } catch (error) {
        console.error("Erro interno login:", error);
        return res.status(500).json({ error: "Erro interno no servidor" });
      }
    }
  );
};
