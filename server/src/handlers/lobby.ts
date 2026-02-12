import { Server, Socket } from 'socket.io';
import { RoomManager } from '../room-manager';
import {
  CreateRoomPayload,
  JoinRoomPayload,
  RoomCreatedPayload,
  RoomJoinedPayload,
  OpponentJoinedPayload,
} from '@basra/shared';

export function registerLobbyHandlers(
  io: Server,
  socket: Socket,
  roomManager: RoomManager
): void {
  socket.on('create-room', (data: CreateRoomPayload) => {
    try {
      const room = roomManager.createRoom(socket.id, data.nickname, data.targetScore);
      const playerId = roomManager.getPlayerId(socket.id)!;

      socket.join(room.code);

      const response: RoomCreatedPayload = {
        roomCode: room.code,
        playerId,
      };
      socket.emit('room-created', response);

      console.log(`Room ${room.code} created by ${data.nickname}`);
    } catch (err: any) {
      socket.emit('error', { message: err.message });
    }
  });

  socket.on('join-room', (data: JoinRoomPayload) => {
    try {
      const code = data.roomCode.toUpperCase().trim();
      const result = roomManager.joinRoom(socket.id, code, data.nickname);

      if (!result) {
        socket.emit('error', { message: 'Room not found or full' });
        return;
      }

      const { room, playerId } = result;
      socket.join(room.code);

      // Tell the joiner about the room
      const host = room.engine.getState().players[0];
      const joinedResponse: RoomJoinedPayload = {
        roomCode: room.code,
        playerId,
        opponentNickname: host.nickname,
      };
      socket.emit('room-joined', joinedResponse);

      // Tell the host about the joiner
      const hostSocketId = roomManager.getOpponentSocketId(room, playerId);
      if (hostSocketId) {
        const opponentJoined: OpponentJoinedPayload = {
          opponentNickname: data.nickname,
        };
        io.to(hostSocketId).emit('opponent-joined', opponentJoined);
      }

      console.log(`${data.nickname} joined room ${room.code}`);
    } catch (err: any) {
      socket.emit('error', { message: err.message });
    }
  });

  socket.on('player-ready', () => {
    try {
      const room = roomManager.getRoomBySocket(socket.id);
      if (!room) {
        socket.emit('error', { message: 'Not in a room' });
        return;
      }

      if (room.engine.getPlayerCount() < 2) {
        socket.emit('error', { message: 'Waiting for opponent' });
        return;
      }

      // Start the game
      room.engine.startGame();
      const state = room.engine.getState();

      // Send each player their own hand and the shared state
      for (const player of state.players) {
        const sid = room.playerSockets.get(player.id);
        if (!sid) continue;

        const opponent = state.players.find(p => p.id !== player.id)!;

        io.to(sid).emit('game-start', {
          hand: player.hand,
          tableCards: state.table,
          deckRemaining: state.deckRemaining,
          currentTurn: state.currentTurn,
          dealer: state.dealer,
          opponentCardCount: opponent.hand.length,
          roundNumber: state.roundNumber,
          targetScore: state.targetScore,
          players: state.players.map(p => ({
            id: p.id,
            nickname: p.nickname,
            score: p.score,
          })),
        });

        if (state.currentTurn === player.id) {
          io.to(sid).emit('your-turn', {});
        }
      }

      console.log(`Game started in room ${room.code}`);
    } catch (err: any) {
      socket.emit('error', { message: err.message });
    }
  });
}
