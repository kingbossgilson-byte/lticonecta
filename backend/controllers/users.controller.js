const db = require('../db');
const bcrypt = require("bcrypt");

exports.getUser = (req, res) => {
  const { email } = req.params;

  db.query(
    `SELECT 
      id,
      username,
      cellphone,
      email,
      enterprise,
      accountType,
      isAdministrator,
      profilePic,
      summary,
      designation,
      score
     FROM dummy_user
     WHERE email = ?`,
    [email],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      res.json(results[0]);
    }
  );
};

exports.getByType = (req, res) => {
  db.query(
    `SELECT 
      id,
      username,
      cellphone,
      email,
      enterprise,
      accountType,
      isAdministrator,
      profilePic,
      summary,
      designation,
      score
     FROM dummy_user
     WHERE accountType = 'Profissional'`,
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(results);
    }
  );
};


exports.getById = (req, res) => {
  const { id } = req.params;

  db.query(
    `SELECT 
      id,
      username,
      cellphone,
      email,
      enterprise,
      accountType,
      isAdministrator,
      profilePic,
      summary,
      designation,
      score
     FROM dummy_user
     WHERE id = ?`,
    [id],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      res.json(results[0]);
    }
  );
};


exports.updateUser = (req, res) => {
  const { id } = req.params;
  const { username, email, summary, designation } = req.body;

  let profilePic = null;

  if (req.file) {
    profilePic = `assets/images/${req.file.filename}`;
  }

  db.query(
    `UPDATE dummy_user 
     SET username = ?, 
         email = ?, 
         summary = ?, 
         designation = ?, 
         profilePic = COALESCE(?, profilePic)
     WHERE id = ?`,
    [username, email, summary, designation, profilePic, id],
    (err, result) => {

      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({ message: "Usuário atualizado com sucesso" });
    }
  );
};


exports.updateProfile = (req, res) => {
    const { id } = req.params;
    const { senhaAtual, novaSenha } = req.body;

    if (!senhaAtual || !novaSenha) {
        return res.status(400).json({ error: "Preencha todos os campos" });
    }

    // 1️⃣ Buscar senha atual no banco
    db.query(
        "SELECT password FROM dummy_user WHERE id = ?",
        [id],
        async (err, results) => {

            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (results.length === 0) {
                return res.status(404).json({ error: "Usuário não encontrado" });
            }

            const senhaHashBanco = results[0].password;

            // 2️⃣ Comparar senha atual
            const senhaValida = await bcrypt.compare(
                senhaAtual,
                senhaHashBanco
            );

            if (!senhaValida) {
                return res.status(400).json({ error: "Senha atual incorreta" });
            }

            // 3️⃣ Gerar nova senha hash
            const novaHash = await bcrypt.hash(novaSenha, 10);

            // 4️⃣ Atualizar no banco
            db.query(
                "UPDATE dummy_user SET password = ? WHERE id = ?",
                [novaHash, id],
                (err2) => {

                    if (err2) {
                        return res.status(500).json({ error: err2.message });
                    }

                    return res.json({
                        message: "Senha alterada com sucesso"
                    });
                }
            );
        }
    );
};