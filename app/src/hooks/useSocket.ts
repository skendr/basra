import { useEffect, useCallback, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { connectSocket, disconnectSocket } from '../services/socket';
import { useAppStore } from '../store/useAppStore';
import { useGameStore } from '../store/useGameStore';
import {
  RoomCreatedPayload,
  RoomJoinedPayload,
  OpponentJoinedPayload,
  GameStartPayload,
  CardsDealtPayload,
  CardPlayedPayload,
  RoundEndPayload,
  GameOverPayload,
  ErrorPayload,
} from '@basra/shared';

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);

  const { setPlayerId, setRoomCode, setConnected, playerId } = useAppStore();
  const {
    setMyId,
    onGameStart,
    onCardsDealt,
    onCardPlayed,
    onRoundEnd,
    onGameOver,
    setOpponentConnected,
  } = useGameStore();

  useEffect(() => {
    const socket = connectSocket();
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('room-created', (data: RoomCreatedPayload) => {
      setPlayerId(data.playerId);
      setRoomCode(data.roomCode);
      setMyId(data.playerId);
    });

    socket.on('room-joined', (data: RoomJoinedPayload) => {
      setPlayerId(data.playerId);
      setRoomCode(data.roomCode);
      setMyId(data.playerId);
    });

    socket.on('game-start', (data: GameStartPayload) => {
      const myId = useAppStore.getState().playerId;
      if (myId) {
        onGameStart(data, myId);
      }
    });

    socket.on('cards-dealt', (data: CardsDealtPayload) => {
      onCardsDealt(data);
    });

    socket.on('card-played', (data: CardPlayedPayload) => {
      onCardPlayed(data);
    });

    socket.on('round-end', (data: RoundEndPayload) => {
      onRoundEnd(data);
    });

    socket.on('game-over', (data: GameOverPayload) => {
      onGameOver(data);
    });

    socket.on('opponent-disconnected', () => {
      setOpponentConnected(false);
    });

    socket.on('opponent-reconnected', () => {
      setOpponentConnected(true);
    });

    socket.on('error', (data: ErrorPayload) => {
      console.warn('Server error:', data.message);
    });

    return () => {
      socket.removeAllListeners();
      disconnectSocket();
    };
  }, []);

  const createRoom = useCallback((nickname: string, targetScore?: number) => {
    socketRef.current?.emit('create-room', { nickname, targetScore });
  }, []);

  const joinRoom = useCallback((roomCode: string, nickname: string) => {
    socketRef.current?.emit('join-room', { roomCode, nickname });
  }, []);

  const playerReady = useCallback(() => {
    socketRef.current?.emit('player-ready', {});
  }, []);

  const playCard = useCallback((cardId: string) => {
    socketRef.current?.emit('play-card', { cardId });
  }, []);

  const nextRound = useCallback(() => {
    socketRef.current?.emit('next-round', {});
  }, []);

  const rematch = useCallback(() => {
    socketRef.current?.emit('rematch', {});
  }, []);

  return {
    createRoom,
    joinRoom,
    playerReady,
    playCard,
    nextRound,
    rematch,
  };
}
