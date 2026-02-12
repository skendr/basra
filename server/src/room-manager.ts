import { GameState, PlayerState, DEFAULT_TARGET_SCORE } from '@basra/shared';
import { generateRoomCode } from './utils/room-code';
import { GameEngine } from './game-engine';

export interface Room {
  code: string;
  engine: GameEngine;
  playerSockets: Map<string, string>; // playerId -> socketId
  createdAt: number;
}

export class RoomManager {
  private rooms = new Map<string, Room>();
  private socketToRoom = new Map<string, string>(); // socketId -> roomCode
  private socketToPlayer = new Map<string, string>(); // socketId -> playerId

  createRoom(socketId: string, nickname: string, targetScore?: number): Room {
    let code: string;
    do {
      code = generateRoomCode();
    } while (this.rooms.has(code));

    const engine = new GameEngine(code, targetScore ?? DEFAULT_TARGET_SCORE);
    const playerId = engine.addPlayer(nickname);

    const room: Room = {
      code,
      engine,
      playerSockets: new Map([[playerId, socketId]]),
      createdAt: Date.now(),
    };

    this.rooms.set(code, room);
    this.socketToRoom.set(socketId, code);
    this.socketToPlayer.set(socketId, playerId);

    return room;
  }

  joinRoom(socketId: string, roomCode: string, nickname: string): { room: Room; playerId: string } | null {
    const room = this.rooms.get(roomCode);
    if (!room) return null;

    if (room.engine.getPlayerCount() >= 2) return null;

    const playerId = room.engine.addPlayer(nickname);
    room.playerSockets.set(playerId, socketId);
    this.socketToRoom.set(socketId, roomCode);
    this.socketToPlayer.set(socketId, playerId);

    return { room, playerId };
  }

  getRoom(roomCode: string): Room | undefined {
    return this.rooms.get(roomCode);
  }

  getRoomBySocket(socketId: string): Room | undefined {
    const code = this.socketToRoom.get(socketId);
    if (!code) return undefined;
    return this.rooms.get(code);
  }

  getPlayerId(socketId: string): string | undefined {
    return this.socketToPlayer.get(socketId);
  }

  getSocketId(room: Room, playerId: string): string | undefined {
    return room.playerSockets.get(playerId);
  }

  getOpponentSocketId(room: Room, playerId: string): string | undefined {
    for (const [pid, sid] of room.playerSockets) {
      if (pid !== playerId) return sid;
    }
    return undefined;
  }

  removeSocket(socketId: string): { room: Room; playerId: string } | null {
    const roomCode = this.socketToRoom.get(socketId);
    const playerId = this.socketToPlayer.get(socketId);
    if (!roomCode || !playerId) return null;

    const room = this.rooms.get(roomCode);
    if (!room) return null;

    room.playerSockets.delete(playerId);
    this.socketToRoom.delete(socketId);
    this.socketToPlayer.delete(socketId);

    // If room is empty, clean it up
    if (room.playerSockets.size === 0) {
      this.rooms.delete(roomCode);
    }

    return { room, playerId };
  }

  deleteRoom(roomCode: string): void {
    const room = this.rooms.get(roomCode);
    if (!room) return;

    for (const [, socketId] of room.playerSockets) {
      this.socketToRoom.delete(socketId);
      this.socketToPlayer.delete(socketId);
    }
    this.rooms.delete(roomCode);
  }

  /** Clean up rooms older than maxAge (ms) with no active connections */
  cleanupStaleRooms(maxAge: number = 30 * 60 * 1000): void {
    const now = Date.now();
    for (const [code, room] of this.rooms) {
      if (room.playerSockets.size === 0 && now - room.createdAt > maxAge) {
        this.rooms.delete(code);
      }
    }
  }
}
