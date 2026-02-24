const { io } = require("socket.io-client");

const socket = io("http://gilson-1.tailb6453c.ts.net:3000", {
  transports: ["websocket"], // força WebSocket
});

socket.on("connect", () => {
  console.log("Conectado ao servidor com ID:", socket.id);
  socket.emit("join-room", "sala-teste");
});

socket.on("user-joined", (id) => {
  console.log("Novo usuário entrou na sala:", id);
});

socket.on("connect_error", (err) => {
  console.error("Erro de conexão:", err.message);
});
