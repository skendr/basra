import { Server, Socket } from 'socket.io';
import { RoomManager, Room } from '../room-manager';
import { PlayCardPayload, CardPlayedPayload, CardsDealtPayload } from '@basra/shared';

function emitDeal(io: Server, room: Room): void {
  const state = room.engine.getState();

  for (const player of state.players) {
    const sid = room.playerSockets.get(player.id);
    if (!sid) continue;

    const opponent = state.players.find(p => p.id !== player.id)!;

    const dealtPayload: CardsDealtPayload = {
      hand: player.hand,
      deckRemaining: state.deckRemaining,
      opponentCardCount: opponent.hand.length,
    };
    io.to(sid).emit('cards-dealt', dealtPayload);

    if (state.currentTurn === player.id) {
      io.to(sid).emit('your-turn', {});
    }
  }
}

function emitRoundEnd(io: Server, room: Room): void {
  const { scores, gameOver, winnerId } = room.engine.endRound();
  const state = room.engine.getState();

  const roundEndPayload = {
    players: state.players.map((p, i) => ({
      id: p.id,
      nickname: p.nickname,
      capturedCount: p.capturedCount,
      basras: p.basras,
      jackBasras: p.jackBasras,
      roundPoints: i === 0 ? scores.player1RoundPoints : scores.player2RoundPoints,
      totalScore: p.score,
    })),
    roundNumber: state.roundNumber,
  };

  // Broadcast round-end to all players in room
  for (const [, sid] of room.playerSockets) {
    io.to(sid).emit('round-end', roundEndPayload);
  }

  if (gameOver) {
    const winner = state.players.find(p => p.id === winnerId)!;
    const gameOverPayload = {
      winnerId: winner.id,
      winnerNickname: winner.nickname,
      players: state.players.map(p => ({
        id: p.id,
        nickname: p.nickname,
        totalScore: p.score,
      })),
    };

    for (const [, sid] of room.playerSockets) {
      io.to(sid).emit('game-over', gameOverPayload);
    }
  }
}

export function registerGameHandlers(
  io: Server,
  socket: Socket,
  roomManager: RoomManager
): void {
  socket.on('play-card', (data: PlayCardPayload) => {
    try {
      const room = roomManager.getRoomBySocket(socket.id);
      const playerId = roomManager.getPlayerId(socket.id);
      if (!room || !playerId) {
        socket.emit('error', { message: 'Not in a room' });
        return;
      }

      const result = room.engine.playCard(playerId, data.cardId);
      const player = room.engine.getPlayer(playerId)!;

      const playedPayload: CardPlayedPayload = {
        playerId,
        card: result.card,
        capturedCards: result.captured,
        isBasra: result.basraType === 'basra',
        isJackBasra: result.basraType === 'jack-basra',
        tableAfter: result.tableAfter,
        currentTurn: room.engine.getState().currentTurn,
        playerCapturedCount: player.capturedCount,
      };

      // Broadcast to all players in room
      for (const [, sid] of room.playerSockets) {
        io.to(sid).emit('card-played', playedPayload);
      }

      if (result.roundOver) {
        // Short delay before showing round results
        setTimeout(() => emitRoundEnd(io, room), 500);
      } else if (result.needsDeal) {
        // Deal next hand
        setTimeout(() => {
          const dealt = room.engine.dealNextHand();
          if (dealt) {
            emitDeal(io, room);
          }
        }, 500);
      } else {
        // Notify next player it's their turn
        const nextTurn = room.engine.getState().currentTurn;
        const nextSid = room.playerSockets.get(nextTurn);
        if (nextSid) {
          io.to(nextSid).emit('your-turn', {});
        }
      }
    } catch (err: any) {
      socket.emit('error', { message: err.message });
    }
  });

  socket.on('next-round', () => {
    try {
      const room = roomManager.getRoomBySocket(socket.id);
      if (!room) {
        socket.emit('error', { message: 'Not in a room' });
        return;
      }

      room.engine.startNextRound();
      const state = room.engine.getState();

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
    } catch (err: any) {
      socket.emit('error', { message: err.message });
    }
  });

  socket.on('rematch', () => {
    try {
      const room = roomManager.getRoomBySocket(socket.id);
      if (!room) {
        socket.emit('error', { message: 'Not in a room' });
        return;
      }

      room.engine.resetForRematch();
      const state = room.engine.getState();

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
    } catch (err: any) {
      socket.emit('error', { message: err.message });
    }
  });
}
