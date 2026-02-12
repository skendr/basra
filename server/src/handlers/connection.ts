import { Server, Socket } from 'socket.io';
import { RoomManager } from '../room-manager';

export function registerConnectionHandlers(
  io: Server,
  socket: Socket,
  roomManager: RoomManager
): void {
  socket.on('disconnect', () => {
    const result = roomManager.removeSocket(socket.id);
    if (!result) return;

    const { room, playerId } = result;

    // Notify opponent about disconnection
    for (const [pid, sid] of room.playerSockets) {
      if (pid !== playerId) {
        io.to(sid).emit('opponent-disconnected', {});
      }
    }

    console.log(`Player ${playerId} disconnected from room ${room.code}`);
  });
}
