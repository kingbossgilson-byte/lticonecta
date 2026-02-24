const fs = require('fs');
const https = require('https');

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const initSignaling = require('./signaling/signaling');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/users.routes');
const agendaRoutes = require('./routes/agenda.routes');

const app = express();

app.use(cors());
app.use(express.json());
const path = require('path');
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res) => {
  res.send('API rodando 🚀');
});

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/agenda', agendaRoutes);

// 🔹 Criar servidor HTTP real
const server = http.createServer(app);

// Inicializar sinalização
initSignaling(server);

// 🔹 Rodar servidor HTTP
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
