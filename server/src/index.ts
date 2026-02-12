import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import { RoomManager } from './room-manager';
import { registerConnectionHandlers } from './handlers/connection';
import { registerLobbyHandlers } from './handlers/lobby';
import { registerGameHandlers } from './handlers/game';

const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const roomManager = new RoomManager();

// Health check endpoint
app.get('/', (_req, res) => {
  res.json({ status: 'ok', game: 'Basra' });
});

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  registerConnectionHandlers(io, socket, roomManager);
  registerLobbyHandlers(io, socket, roomManager);
  registerGameHandlers(io, socket, roomManager);
});

// Cleanup stale rooms every 10 minutes
setInterval(() => {
  roomManager.cleanupStaleRooms();
}, 10 * 60 * 1000);

server.listen(PORT, () => {
  console.log(`Basra server running on port ${PORT}`);
});
