/* const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'vlibras'
});

db.connect(err => {
  if (err) throw err;
  console.log('MySQL conectado');
});

module.exports = db;
 */

const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createPool(process.env.DATABASE_URL);

// Teste de conexão
db.getConnection((err, connection) => {
  if (err) {
    console.error('Erro ao conectar no MySQL:', err);
  } else {
    console.log('MySQL conectado 🚀');
    connection.release();
  }
});

module.exports = db.promise();
