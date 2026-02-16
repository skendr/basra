# Basra - Project Init Summary

## What This Is
Online multiplayer Egyptian Basra card game. Two players connect via room codes on separate devices and play real-time rounds. Target: App Store + Play Store.

## Tech Stack
- **Monorepo**: npm workspaces (`shared/`, `server/`, `app/`)
- **Client**: Expo (React Native) + TypeScript, Expo Router, Zustand, Reanimated v3
- **Server**: Node.js + Express + Socket.io + TypeScript
- **Shared**: Pure game logic consumed by both server and client

## Architecture
Server is authoritative. Clients send intents (`play-card`), server validates, computes captures/basra, broadcasts results. Clients mirror state via Zustand stores.

```
Player A ── play-card ──> Server ── game-state-update ──> Player A
                            │                              Player B
                            └── validate, compute, broadcast
```

## Project Structure (35+ files)

### `shared/src/` — Pure Game Logic
| File | Purpose |
|------|---------|
| `types.ts` | All types: Card, GameState, PlayerState, socket event payloads |
| `constants.ts` | Scoring values, deck config, `DIAMOND_7_ID` |
| `deck.ts` | `createDeck()`, `shuffleDeck()` (Fisher-Yates), `dealCards()` |
| `capture.ts` | `findCaptures()` — J/Diamond7 sweep, Q/K match, numeral rank+sum via subset-sum backtracking |
| `basra.ts` | `detectBasra()` — regular (10pts), jack (30pts) |
| `scoring.ts` | `calculateRoundScores()` — most-cards bonus (30pts) + basra points; `checkWinner()` |

### `server/src/` — Authoritative Game Server
| File | Purpose |
|------|---------|
| `index.ts` | Express + Socket.io on port 3000, wires handlers, stale room cleanup |
| `room-manager.ts` | Room CRUD with 5-char codes, socket↔player↔room tracking |
| `game-engine.ts` | Full state machine: dealing (initial 4+4+4, then 5×4+4), turns, captures, round/game end |
| `handlers/connection.ts` | Disconnect → notify opponent |
| `handlers/lobby.ts` | `create-room`, `join-room`, `player-ready` → deals & starts game |
| `handlers/game.ts` | `play-card` → validate, broadcast, auto-deal when hands empty, round-end/game-over |

### `app/` — Expo React Native Client
**Screens** (`app/app/`): `index.tsx` (home), `lobby.tsx` (waiting room), `game.tsx` (gameplay), `score.tsx` (round/game results)

**Components** (`app/src/components/`): Card, CardHand, TableArea, OpponentHand, ScoreBar, DeckPile, BasraToast, TurnIndicator, RoomCodeCard

**State**: `useGameStore.ts` (game state mirror), `useAppStore.ts` (nickname, room, connection)

**Hooks**: `useSocket.ts` (connects to server, handles all events, exposes actions), `useCardAnimation.ts` (Reanimated helpers)

**Services**: `socket.ts` (Socket.io client singleton, reads `EXPO_PUBLIC_SERVER_URL`)

## Game Rules Implemented
- 52-card deck, 2 players
- Dealing: first deal = 4 each + 4 on table; subsequent = 4 each only; 6 total deals per round
- Capture: numeral matches rank + sum combos; Q→Q, K→K; J and Diamond 7 sweep all
- Basra: clearing the table = 10pts (regular/Diamond7) or 30pts (Jack)
- Round scoring: most cards = 30pts + basra points
- Win: first to 121 (configurable), dealer alternates each round
- End of round: remaining table cards go to last player who captured

## Socket Events
**Client → Server**: `create-room`, `join-room`, `player-ready`, `play-card`, `next-round`, `rematch`

**Server → Client**: `room-created`, `room-joined`, `opponent-joined`, `game-start`, `cards-dealt`, `your-turn`, `card-played`, `round-end`, `game-over`, `opponent-disconnected`, `error`

## Current Status
- All source code written and committed (`feat: scaffolding for the basra game`)
- Entire enabled (manual-commit mode)
- **Blocker**: Node.js not installed — need `brew install node` or nvm, then `npm install` from root
- One fix applied post-commit: added `"composite": true` to `shared/tsconfig.json` for TS project references
