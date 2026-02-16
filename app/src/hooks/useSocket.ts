import { useEffect, useCallback, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { connectSocket, getSocket } from '../services/socket';
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

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    const onConnectError = (err: Error) => console.warn('Socket connect error:', err.message);

    const onRoomCreated = (data: RoomCreatedPayload) => {
      setPlayerId(data.playerId);
      setRoomCode(data.roomCode);
      setMyId(data.playerId);
    };

    const onRoomJoined = (data: RoomJoinedPayload) => {
      setPlayerId(data.playerId);
      setRoomCode(data.roomCode);
      setMyId(data.playerId);
    };

    const onGameStartHandler = (data: GameStartPayload) => {
      const myId = useAppStore.getState().playerId;
      if (myId) {
        onGameStart(data, myId);
      }
    };

    const onCardsDealtHandler = (data: CardsDealtPayload) => onCardsDealt(data);
    const onCardPlayedHandler = (data: CardPlayedPayload) => onCardPlayed(data);
    const onRoundEndHandler = (data: RoundEndPayload) => onRoundEnd(data);
    const onGameOverHandler = (data: GameOverPayload) => onGameOver(data);
    const onOpponentDisconnected = () => setOpponentConnected(false);
    const onOpponentReconnected = () => setOpponentConnected(true);
    const onError = (data: ErrorPayload) => console.warn('Server error:', data.message);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('room-created', onRoomCreated);
    socket.on('room-joined', onRoomJoined);
    socket.on('game-start', onGameStartHandler);
    socket.on('cards-dealt', onCardsDealtHandler);
    socket.on('card-played', onCardPlayedHandler);
    socket.on('round-end', onRoundEndHandler);
    socket.on('game-over', onGameOverHandler);
    socket.on('opponent-disconnected', onOpponentDisconnected);
    socket.on('opponent-reconnected', onOpponentReconnected);
    socket.on('error', onError);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('room-created', onRoomCreated);
      socket.off('room-joined', onRoomJoined);
      socket.off('game-start', onGameStartHandler);
      socket.off('cards-dealt', onCardsDealtHandler);
      socket.off('card-played', onCardPlayedHandler);
      socket.off('round-end', onRoundEndHandler);
      socket.off('game-over', onGameOverHandler);
      socket.off('opponent-disconnected', onOpponentDisconnected);
      socket.off('opponent-reconnected', onOpponentReconnected);
      socket.off('error', onError);
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
