import { create } from 'zustand';
import {
  Card,
  GamePhase,
  CardPlayedPayload,
  GameStartPayload,
  CardsDealtPayload,
  RoundEndPayload,
  GameOverPayload,
} from '@basra/shared';

interface PlayerInfo {
  id: string;
  nickname: string;
  score: number;
  capturedCount: number;
  basras: number;
  jackBasras: number;
}

interface GameStore {
  phase: GamePhase;
  hand: Card[];
  table: Card[];
  deckRemaining: number;
  currentTurn: string | null;
  dealer: string | null;
  myId: string | null;
  opponentCardCount: number;
  roundNumber: number;
  targetScore: number;
  players: PlayerInfo[];

  // Last play animation data
  lastPlay: CardPlayedPayload | null;

  // Round end data
  roundEndData: RoundEndPayload | null;

  // Game over data
  gameOverData: GameOverPayload | null;

  // Whether opponent is connected
  opponentConnected: boolean;

  // Actions
  setMyId: (id: string) => void;
  onGameStart: (data: GameStartPayload, myId: string) => void;
  onCardsDealt: (data: CardsDealtPayload) => void;
  onCardPlayed: (data: CardPlayedPayload) => void;
  onRoundEnd: (data: RoundEndPayload) => void;
  onGameOver: (data: GameOverPayload) => void;
  setOpponentConnected: (connected: boolean) => void;
  isMyTurn: () => boolean;
  reset: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  phase: 'waiting',
  hand: [],
  table: [],
  deckRemaining: 0,
  currentTurn: null,
  dealer: null,
  myId: null,
  opponentCardCount: 0,
  roundNumber: 0,
  targetScore: 121,
  players: [],
  lastPlay: null,
  roundEndData: null,
  gameOverData: null,
  opponentConnected: true,

  setMyId: (id) => set({ myId: id }),

  onGameStart: (data, myId) =>
    set({
      phase: 'playing',
      hand: data.hand,
      table: data.tableCards,
      deckRemaining: data.deckRemaining,
      currentTurn: data.currentTurn,
      dealer: data.dealer,
      myId,
      opponentCardCount: data.opponentCardCount,
      roundNumber: data.roundNumber,
      targetScore: data.targetScore,
      players: data.players.map((p) => ({
        id: p.id,
        nickname: p.nickname,
        score: p.score,
        capturedCount: 0,
        basras: 0,
        jackBasras: 0,
      })),
      lastPlay: null,
      roundEndData: null,
      gameOverData: null,
    }),

  onCardsDealt: (data) =>
    set({
      hand: data.hand,
      deckRemaining: data.deckRemaining,
      opponentCardCount: data.opponentCardCount,
    }),

  onCardPlayed: (data) => {
    const state = get();
    const isMe = data.playerId === state.myId;

    set({
      table: data.tableAfter,
      currentTurn: data.currentTurn,
      lastPlay: data,
      // If I played, remove the card from my hand
      hand: isMe
        ? state.hand.filter((c) => c.id !== data.card.id)
        : state.hand,
      // If opponent played, decrement their count
      opponentCardCount: isMe
        ? state.opponentCardCount
        : state.opponentCardCount - 1,
      // Update captured counts
      players: state.players.map((p) =>
        p.id === data.playerId
          ? { ...p, capturedCount: data.playerCapturedCount }
          : p
      ),
    });
  },

  onRoundEnd: (data) =>
    set({
      phase: 'round-end',
      roundEndData: data,
      players: data.players.map((p) => ({
        id: p.id,
        nickname: p.nickname,
        score: p.totalScore,
        capturedCount: p.capturedCount,
        basras: p.basras,
        jackBasras: p.jackBasras,
      })),
    }),

  onGameOver: (data) =>
    set({
      phase: 'game-over',
      gameOverData: data,
    }),

  setOpponentConnected: (connected) => set({ opponentConnected: connected }),

  isMyTurn: () => {
    const state = get();
    return state.currentTurn === state.myId;
  },

  reset: () =>
    set({
      phase: 'waiting',
      hand: [],
      table: [],
      deckRemaining: 0,
      currentTurn: null,
      dealer: null,
      myId: null,
      opponentCardCount: 0,
      roundNumber: 0,
      players: [],
      lastPlay: null,
      roundEndData: null,
      gameOverData: null,
      opponentConnected: true,
    }),
}));
