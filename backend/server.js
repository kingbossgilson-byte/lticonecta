const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Servir arquivos estáticos ou rotas da sua API
app.use(express.static('public'));

// WebSocket para sinalização
io.on('connection', (socket) => {
  console.log('Novo cliente conectado:', socket.id);

  // Quando um peer envia uma oferta
  socket.on('offer', (data) => {
    socket.to(data.target).emit('offer', {
      sdp: data.sdp,
      from: socket.id
    });
  });

  // Quando um peer envia uma resposta
  socket.on('answer', (data) => {
    socket.to(data.target).emit('answer', {
      sdp: data.sdp,
      from: socket.id
    });
  });

  // Quando um peer envia ICE candidate
  socket.on('ice-candidate', (data) => {
    socket.to(data.target).emit('ice-candidate', {
      candidate: data.candidate,
      from: socket.id
    });
  });

  // Entrar em uma sala
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-joined', socket.id);
  });

  // Sair da sala quando desconectar
socket.on('disconnect', () => {
  console.log('Cliente desconectado:', socket.id);
  // Remove de todas as salas
  const rooms = Array.from(socket.rooms);
  rooms.forEach(roomId => {
    socket.to(roomId).emit('user-left', socket.id);
  });
});
});
server.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});