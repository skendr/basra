export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  id: string;        // e.g. "7-diamonds"
  suit: Suit;
  rank: Rank;
  value: number;     // A=1, 2-10=face, J/Q/K=0
}

export interface PlayerState {
  id: string;
  nickname: string;
  hand: Card[];
  capturedCards: Card[];
  capturedCount: number;
  basras: number;
  jackBasras: number;
  score: number;       // cumulative across rounds
  roundScore: number;  // current round score
}

export interface LastCapture {
  playerId: string;
  card: Card;
  capturedCards: Card[];
  isBasra: boolean;
  isJackBasra: boolean;
}

export type GamePhase = 'waiting' | 'dealing' | 'playing' | 'round-end' | 'game-over';

export interface GameState {
  roomCode: string;
  phase: GamePhase;
  table: Card[];
  deck: Card[];
  deckRemaining: number;
  currentTurn: string;
  dealer: string;
  players: [PlayerState, PlayerState];
  targetScore: number;
  roundNumber: number;
  lastCapture: LastCapture | null;
  lastCapturePlayerId: string | null; // tracks who last captured for end-of-round
  dealsLeft: number;
}

export type BasraType = 'none' | 'basra' | 'jack-basra';

export interface CaptureResult {
  captured: Card[];
  basraType: BasraType;
}

export interface RoundScoreResult {
  player1Cards: number;
  player2Cards: number;
  player1RoundPoints: number;
  player2RoundPoints: number;
}

// Socket event payloads
export interface CreateRoomPayload {
  nickname: string;
  targetScore?: number;
}

export interface JoinRoomPayload {
  roomCode: string;
  nickname: string;
}

export interface PlayCardPayload {
  cardId: string;
}

export interface RoomCreatedPayload {
  roomCode: string;
  playerId: string;
}

export interface RoomJoinedPayload {
  roomCode: string;
  playerId: string;
  opponentNickname: string;
}

export interface OpponentJoinedPayload {
  opponentNickname: string;
}

export interface GameStartPayload {
  hand: Card[];
  tableCards: Card[];
  deckRemaining: number;
  currentTurn: string;
  dealer: string;
  opponentCardCount: number;
  roundNumber: number;
  targetScore: number;
  players: { id: string; nickname: string; score: number }[];
}

export interface CardsDealtPayload {
  hand: Card[];
  deckRemaining: number;
  opponentCardCount: number;
}

export interface CardPlayedPayload {
  playerId: string;
  card: Card;
  capturedCards: Card[];
  isBasra: boolean;
  isJackBasra: boolean;
  tableAfter: Card[];
  currentTurn: string;
  playerCapturedCount: number;
}

export interface RoundEndPayload {
  players: {
    id: string;
    nickname: string;
    capturedCount: number;
    basras: number;
    jackBasras: number;
    roundPoints: number;
    totalScore: number;
  }[];
  roundNumber: number;
}

export interface GameOverPayload {
  winnerId: string;
  winnerNickname: string;
  players: {
    id: string;
    nickname: string;
    totalScore: number;
  }[];
}

export interface ErrorPayload {
  message: string;
}
