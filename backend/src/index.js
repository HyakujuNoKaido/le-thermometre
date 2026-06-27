require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { generateQuestions } = require('./services/ai.service');

const app = express();
const server = http.createServer(app);

// Accepte les connexions du frontend
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

const rooms = new Map();

io.on('connection', (socket) => {
  console.log(`🔌 Joueur connecté : ${socket.id}`);

  socket.on('join_room', ({ roomId }) => {
    socket.join(roomId);
    if (!rooms.has(roomId)) {
      rooms.set(roomId, { id: roomId, mode: 'Chill' });
    }
  });

  socket.on('request_ai_questions', async ({ roomId, mode, players }) => {
    try {
      const questions = await generateQuestions(mode, players, 3);
      io.to(roomId).emit('ai_questions_ready', questions);
    } catch (error) {
      console.error("❌ Erreur IA:", error);
      io.to(roomId).emit('ai_error'); 
    }
  });

  socket.on('disconnect', () => console.log(`🔴 Déconnecté : ${socket.id}`));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`🚀 Serveur lancé sur le port ${PORT}`));
