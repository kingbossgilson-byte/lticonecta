const axios = require('axios');
const db = require('../db');

async function createDailyRoom(roomName) {
  const response = await axios.post(
    'https://api.daily.co/v1/rooms',
    {
      name: roomName,
      privacy: 'public'
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.DAILY_API_KEY.trim()}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data;
}
exports.session = async (req, res) => {
    const {
            idCliente,
            clientName,
            sessionName,
            name,
            image,
            designation,
            date,
            startTime,
            endTime,
            duration,
            cellphone,
            callType,
            fullImage,
            isCompleted,
            isCanceled,
            roomUrl
           } = req.body;
    const novaSessao = sessionName.toLowerCase().replace(/[^a-z0-9]/g, '');
    let dailyRoom;

      try {
            // ✅ Só cria sala se callType for "Remoto"
            if (callType === "Remoto") {
              dailyRoom = await createDailyRoom(novaSessao);
              console.log("Sala Daily criada:", dailyRoom.url);
            } else {
              console.log("Sala Daily não criada, tipo de chamada:", callType);
            }

      } catch (error) {
        console.error("Erro ao criar sala Daily:", error.response?.data || error.message);
        return res.status(500).json({ error: "Erro ao criar sala na Daily" });
      }

    db.query(
      'INSERT INTO session (idCliente,clientName,sessionName,name,image,designation,date,startTime,endTime,duration,cellphone,callType,fullImage,isCompleted,isCanceled,roomUrl) VALUES (?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?,?)',
      [
        idCliente,
        clientName,
        sessionName,  
        name,
        image,
        designation,
        date,
        startTime,
        endTime,
        duration,
        cellphone,
        callType,
        fullImage,
        isCompleted,
        isCanceled,
        dailyRoom?.url || roomUrl || null
      ],
      async (err, result) =>  {
        if (err) {
                  console.error('ERRO MYSQL:', err);
                  return res.status(500).json({
                      error: 'Erro ao criar session',
                      details: err.sqlMessage || err.message,
                      code: err.code,
                  });
                  }
        try {

              await axios.post('https://multifaceted-gabriella-subconcavely.ngrok-free.dev/whatsapp/send', {
                to: cellphone,
                text: `Olá ${name}, foi agendada uma reuniao!

                Solicitante: ${clientName}
                Data: ${date}
                Horário: ${startTime}
                Link da sala: ${dailyRoom?.url ?? 'Presencial'}`
              });
            } catch (error) {
              console.error('Erro ao enviar WhatsApp:', error.message);
            }
        res.json({ message: 'Sessão criada com sucesso', roomUrl: dailyRoom.url });
      }
    );
  };


  exports.getAgenda = (req, res) => {

  const userId = req.user.id;
  const userName = req.user.username;
  const accountType = req.user.accountType;

  let query;
  let value;
  if (accountType === "Profissional") {
    query = "SELECT * FROM session WHERE name = ?";
    value = userName;
  } else {
    query = "SELECT * FROM session WHERE idCliente = ?";
    value = userId;
  }

  db.query(query, [value], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

  // para flutter
  exports.getById = (req, res) => {
  const { idCliente } = req.params;

  db.query(
    `SELECT 
        id,
        idCliente,
        clientName,
        sessionName,
        name,
        image,
        designation,
        date,
        startTime,
        endTime,
        checkInTime,
        duration,
        callType,
        fullImage,
        isCompleted,
        isCanceled,
        roomUrl
      FROM session
      WHERE idCliente = ?`,
    [idCliente],
    async (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      try {
        // Para cada sessão, buscar dados da Daily
        const sessionsWithDaily = await Promise.all(
          results.map(async (session) => {

            if (!session.roomUrl) return session;

            const roomName = session.roomUrl.split("/").pop();

            const dailyResponse = await axios.get(
              "https://api.daily.co/v1/meetings",
              {
                params: { room: roomName },
                headers: {
                  Authorization: `Bearer ${process.env.DAILY_API_KEY?.trim()}`
                }
              }
            );

            const meetings = dailyResponse.data.data;

            if (meetings && meetings.length > 0) {

              return {
                ...session,
                daily: meetings.map(meeting => ({
                  meetingId: meeting.id,
                  startTime: meeting.start_time,
                  duration: meeting.duration,
                  participants: meeting.participants,
                  maxParticipants: meeting.max_participants,
                  totalParticipantMinutes: meeting.total_participant_minutes,
                  ended: meeting.ended
                }))
              };
            }
            return session;

          })
        );

        res.json(sessionsWithDaily);

      } catch (error) {
        console.error(error.response?.data || error.message);
        res.status(500).json({ error: "Erro ao buscar dados da Daily" });
      }
    }
  );
};

exports.updateSession = (req, res) => {
  const { id } = req.params;
  const fields = [];
  const values = [];

  if (req.body.startTime !== undefined) {
    fields.push("startTime = ?");
    values.push(req.body.startTime);
  }

  if (req.body.endTime !== undefined) {
    fields.push("endTime = ?");
    values.push(req.body.endTime);
  }

  if (req.body.isCanceled !== undefined) {
    fields.push("isCanceled = ?");
    values.push(req.body.isCanceled);
  }

  if (req.body.isCompleted !== undefined) {
    fields.push("isCompleted = ?");
    values.push(req.body.isCompleted);
  }

  if (req.body.checkInTime !== undefined) {
    fields.push("checkInTime = ?");
    values.push(req.body.checkInTime);
  }

  if (fields.length === 0) {
    return res.status(400).json({ error: "Nada para atualizar" });
  }

  const query = `
    UPDATE session
    SET ${fields.join(", ")}
    WHERE id = ?
  `;

  values.push(id);

  db.query(query, values, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json({ message: "Sessão atualizada com sucesso" });
  });
};

function finalizarSessaoPorRoom(roomName) {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const endTime = `${hours}:${minutes}`;

  const query = `
    UPDATE session
    SET endTime = ?, 
        isCompleted = 1
    WHERE roomUrl LIKE ?
  `;

  db.query(query, [endTime, `%/${roomName}`], (err, result) => {
    if (err) {
      console.error("Erro ao finalizar sessão:", err);
      return;
    }

    
  });
}

exports.finalizarSessaoManual = (req, res) => {
  const { roomName } = req.body;

  console.log("Sessão finalizada:", roomName);

  if (!roomName) {
    return res.status(400).json({ error: "roomName é obrigatório" });
  }

  finalizarSessaoPorRoom(roomName);

  res.json({ message: "Sessão finalizada manualmente" });
};

/* exports.getById = (req, res) => {

  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  const decoded = jwt.verify(token, JWT_SECRET);
  const idCliente = decoded.id; // 👈 id vem do login

  db.query(
    `SELECT 
      id,
      idCliente,
      clientName,
      sessionName,
      name,
      image,
      designation,
      date,
      startTime,
      endTime,
      duration,
      callType,
      fullImage,
      isCompleted,
      isCanceled,
      roomUrl
    FROM session
    WHERE idCliente = ?`,
    [idCliente],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(results);
    }
  );
}; */


  /* exports.getById = (req, res) => {
    db.query(
      `SELECT 
        id,
        idCliente,
        clientName,
        sessionName,
        name,
        image,
        designation,
        date,
        startTime,
        endTime,
        duration,
        callType,
        fullImage,
        isCompleted,
        isCanceled,
        roomUrl
      FROM session`,
      (err, results) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json(results);
      }
    );

}; */
