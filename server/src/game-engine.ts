import {
  Card,
  GameState,
  GamePhase,
  PlayerState,
  BasraType,
  CaptureResult,
  RoundScoreResult,
  createDeck,
  shuffleDeck,
  dealCards,
  processPlay,
  calculateRoundScores,
  checkWinner,
  CARDS_PER_DEAL,
  INITIAL_TABLE_CARDS,
} from '@basra/shared';

let playerIdCounter = 0;

function createPlayerId(): string {
  return `player_${++playerIdCounter}_${Date.now()}`;
}

function createPlayerState(id: string, nickname: string): PlayerState {
  return {
    id,
    nickname,
    hand: [],
    capturedCards: [],
    capturedCount: 0,
    basras: 0,
    jackBasras: 0,
    score: 0,
    roundScore: 0,
  };
}

export class GameEngine {
  private state: GameState;

  constructor(roomCode: string, targetScore: number) {
    this.state = {
      roomCode,
      phase: 'waiting',
      table: [],
      deck: [],
      deckRemaining: 0,
      currentTurn: '',
      dealer: '',
      players: [null as any, null as any],
      targetScore,
      roundNumber: 0,
      lastCapture: null,
      lastCapturePlayerId: null,
      dealsLeft: 0,
    };
  }

  addPlayer(nickname: string): string {
    const id = createPlayerId();
    const player = createPlayerState(id, nickname);

    if (!this.state.players[0]) {
      this.state.players[0] = player;
    } else if (!this.state.players[1]) {
      this.state.players[1] = player;
    } else {
      throw new Error('Room is full');
    }

    return id;
  }

  getPlayerCount(): number {
    return this.state.players.filter(p => p != null).length;
  }

  getState(): GameState {
    return this.state;
  }

  getPlayer(playerId: string): PlayerState | undefined {
    return this.state.players.find(p => p?.id === playerId);
  }

  getOpponent(playerId: string): PlayerState | undefined {
    return this.state.players.find(p => p && p.id !== playerId);
  }

  startGame(): void {
    if (this.getPlayerCount() < 2) throw new Error('Need 2 players');

    // First dealer is player 0 (host)
    this.state.dealer = this.state.players[0].id;
    this.state.roundNumber = 1;
    this.startRound();
  }

  private startRound(): void {
    // Reset round-specific state
    for (const player of this.state.players) {
      player.hand = [];
      player.capturedCards = [];
      player.capturedCount = 0;
      player.basras = 0;
      player.jackBasras = 0;
      player.roundScore = 0;
    }

    this.state.table = [];
    this.state.lastCapture = null;
    this.state.lastCapturePlayerId = null;

    // Shuffle deck
    this.state.deck = shuffleDeck(createDeck());
    this.state.deckRemaining = this.state.deck.length;

    // Non-dealer plays first
    const nonDealer = this.state.players.find(p => p.id !== this.state.dealer)!;
    this.state.currentTurn = nonDealer.id;

    // First deal: 4 to each player + 4 on table
    this.dealInitial();

    this.state.phase = 'playing';
  }

  private dealInitial(): void {
    const nonDealer = this.state.players.find(p => p.id !== this.state.dealer)!;
    const dealer = this.state.players.find(p => p.id === this.state.dealer)!;

    // Deal 4 to non-dealer
    const deal1 = dealCards(this.state.deck, CARDS_PER_DEAL);
    nonDealer.hand = deal1.dealt;
    this.state.deck = deal1.remaining;

    // Deal 4 to dealer
    const deal2 = dealCards(this.state.deck, CARDS_PER_DEAL);
    dealer.hand = deal2.dealt;
    this.state.deck = deal2.remaining;

    // Deal 4 to table
    const deal3 = dealCards(this.state.deck, INITIAL_TABLE_CARDS);
    this.state.table = deal3.dealt;
    this.state.deck = deal3.remaining;

    this.state.deckRemaining = this.state.deck.length;
    // 52 - 4 - 4 - 4 = 40 remaining, 5 more deals of 8 cards = 40
    this.state.dealsLeft = 5;
  }

  dealNextHand(): { hand1: Card[]; hand2: Card[] } | null {
    if (this.state.deck.length < CARDS_PER_DEAL * 2) return null;
    if (this.state.dealsLeft <= 0) return null;

    const nonDealer = this.state.players.find(p => p.id !== this.state.dealer)!;
    const dealer = this.state.players.find(p => p.id === this.state.dealer)!;

    // Deal 4 to non-dealer
    const deal1 = dealCards(this.state.deck, CARDS_PER_DEAL);
    nonDealer.hand = deal1.dealt;
    this.state.deck = deal1.remaining;

    // Deal 4 to dealer
    const deal2 = dealCards(this.state.deck, CARDS_PER_DEAL);
    dealer.hand = deal2.dealt;
    this.state.deck = deal2.remaining;

    this.state.deckRemaining = this.state.deck.length;
    this.state.dealsLeft--;

    // Non-dealer plays first
    this.state.currentTurn = nonDealer.id;

    return {
      hand1: nonDealer.hand,
      hand2: dealer.hand,
    };
  }

  playCard(playerId: string, cardId: string): {
    card: Card;
    captured: Card[];
    basraType: BasraType;
    tableAfter: Card[];
    needsDeal: boolean;
    roundOver: boolean;
  } {
    if (this.state.phase !== 'playing') {
      throw new Error('Game is not in playing phase');
    }

    if (this.state.currentTurn !== playerId) {
      throw new Error('Not your turn');
    }

    const player = this.getPlayer(playerId)!;
    const cardIndex = player.hand.findIndex(c => c.id === cardId);
    if (cardIndex === -1) {
      throw new Error('Card not in your hand');
    }

    // Remove card from hand
    const [card] = player.hand.splice(cardIndex, 1);

    // Process capture
    const { captured, basraType } = processPlay(card, this.state.table);

    if (captured.length > 0) {
      // Remove captured cards from table
      this.state.table = this.state.table.filter(c => !captured.some(cap => cap.id === c.id));

      // Add captured cards + the played card to player's pile
      player.capturedCards.push(card, ...captured);
      player.capturedCount = player.capturedCards.length;
      this.state.lastCapturePlayerId = playerId;

      // Track basras
      if (basraType === 'basra') {
        player.basras++;
      } else if (basraType === 'jack-basra') {
        player.jackBasras++;
      }

      this.state.lastCapture = {
        playerId,
        card,
        capturedCards: captured,
        isBasra: basraType === 'basra',
        isJackBasra: basraType === 'jack-basra',
      };
    } else {
      // Card stays on table
      this.state.table.push(card);
      this.state.lastCapture = null;
    }

    const tableAfter = [...this.state.table];

    // Switch turns
    const opponent = this.getOpponent(playerId)!;
    this.state.currentTurn = opponent.id;

    // Check if both players' hands are empty
    const bothHandsEmpty = this.state.players.every(p => p.hand.length === 0);
    let needsDeal = false;
    let roundOver = false;

    if (bothHandsEmpty) {
      if (this.state.dealsLeft > 0) {
        needsDeal = true;
      } else {
        roundOver = true;
      }
    }

    return {
      card,
      captured,
      basraType,
      tableAfter,
      needsDeal,
      roundOver,
    };
  }

  endRound(): {
    scores: RoundScoreResult;
    gameOver: boolean;
    winnerId?: string;
  } {
    // Remaining table cards go to last player who captured
    if (this.state.lastCapturePlayerId && this.state.table.length > 0) {
      const lastCapturer = this.getPlayer(this.state.lastCapturePlayerId)!;
      lastCapturer.capturedCards.push(...this.state.table);
      lastCapturer.capturedCount = lastCapturer.capturedCards.length;
      this.state.table = [];
    }

    // Calculate scores
    const scores = calculateRoundScores(this.state.players[0], this.state.players[1]);

    this.state.players[0].roundScore = scores.player1RoundPoints;
    this.state.players[1].roundScore = scores.player2RoundPoints;
    this.state.players[0].score += scores.player1RoundPoints;
    this.state.players[1].score += scores.player2RoundPoints;

    // Check winner
    const winner = checkWinner(this.state.players, this.state.targetScore);

    this.state.phase = winner ? 'game-over' : 'round-end';

    return {
      scores,
      gameOver: !!winner,
      winnerId: winner?.id,
    };
  }

  startNextRound(): void {
    // Swap dealer
    this.state.dealer = this.state.players.find(p => p.id !== this.state.dealer)!.id;
    this.state.roundNumber++;
    this.startRound();
  }

  resetForRematch(): void {
    for (const player of this.state.players) {
      player.score = 0;
    }
    this.state.roundNumber = 0;
    this.state.dealer = this.state.players[0].id;
    this.state.roundNumber = 1;
    this.startRound();
  }
}
