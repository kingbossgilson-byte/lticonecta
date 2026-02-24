const { Server } = require('socket.io');

function initSignaling(server) {
  // Inicializa o Socket.io com CORS
  const io = new Server(server, {
    cors: {
      origin: "*",  // permite qualquer origem, ajuste depois para produção
      methods: ["GET", "POST"]
    }
  });

  // Eventos de sinalização
  io.on('connection', (socket) => {
    console.log('Novo cliente conectado:', socket.id);

    socket.on('join-room', (roomId) => {
      socket.join(roomId);
      socket.to(roomId).emit('user-joined', socket.id);
    });

    socket.on('offer', (data) => {
      socket.to(data.target).emit('offer', { sdp: data.sdp, from: socket.id });
    });

    socket.on('answer', (data) => {
      socket.to(data.target).emit('answer', { sdp: data.sdp, from: socket.id });
    });

    socket.on('ice-candidate', (data) => {
      socket.to(data.target).emit('ice-candidate', { candidate: data.candidate, from: socket.id });
    });
  });

  return io;
}

module.exports = initSignaling;
