import { create } from 'zustand';

interface AppState {
  nickname: string;
  targetScore: number;
  playerId: string | null;
  roomCode: string | null;
  isHost: boolean;
  connected: boolean;

  setNickname: (nickname: string) => void;
  setTargetScore: (score: number) => void;
  setPlayerId: (id: string) => void;
  setRoomCode: (code: string) => void;
  setIsHost: (isHost: boolean) => void;
  setConnected: (connected: boolean) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  nickname: '',
  targetScore: 121,
  playerId: null,
  roomCode: null,
  isHost: false,
  connected: false,

  setNickname: (nickname) => set({ nickname }),
  setTargetScore: (targetScore) => set({ targetScore }),
  setPlayerId: (playerId) => set({ playerId }),
  setRoomCode: (roomCode) => set({ roomCode }),
  setIsHost: (isHost) => set({ isHost }),
  setConnected: (connected) => set({ connected }),
  reset: () =>
    set({
      playerId: null,
      roomCode: null,
      isHost: false,
    }),
}));
