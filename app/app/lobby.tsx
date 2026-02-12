import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { useSocket } from '../src/hooks/useSocket';
import { useAppStore } from '../src/store/useAppStore';
import { useGameStore } from '../src/store/useGameStore';
import { colors, spacing, fontSize, borderRadius } from '../src/theme';
import RoomCodeCard from '../src/components/RoomCodeCard';

export default function LobbyScreen() {
  const router = useRouter();
  const { playerReady } = useSocket();
  const { roomCode, isHost, nickname } = useAppStore();
  const { phase } = useGameStore();

  const [opponentName, setOpponentName] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const { getSocket } = require('../src/services/socket');
    const socket = getSocket();

    const onOpponentJoined = (data: { opponentNickname: string }) => {
      setOpponentName(data.opponentNickname);
    };

    const onRoomJoined = (data: { opponentNickname: string }) => {
      setOpponentName(data.opponentNickname);
    };

    socket.on('opponent-joined', onOpponentJoined);
    socket.on('room-joined', onRoomJoined);

    return () => {
      socket.off('opponent-joined', onOpponentJoined);
      socket.off('room-joined', onRoomJoined);
    };
  }, []);

  useEffect(() => {
    if (phase === 'playing') {
      router.replace('/game');
    }
  }, [phase]);

  const handleCopy = async () => {
    if (roomCode) {
      await Clipboard.setStringAsync(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleStart = () => {
    playerReady();
  };

  const bothReady = opponentName !== null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Game Lobby</Text>

      {roomCode && (
        <RoomCodeCard code={roomCode} onCopy={handleCopy} copied={copied} />
      )}

      <View style={styles.playersSection}>
        <View style={styles.playerRow}>
          <View style={[styles.dot, styles.dotActive]} />
          <Text style={styles.playerName}>{nickname} (You)</Text>
        </View>

        <View style={styles.playerRow}>
          <View style={[styles.dot, opponentName ? styles.dotActive : styles.dotInactive]} />
          <Text style={styles.playerName}>
            {opponentName || 'Waiting for opponent...'}
          </Text>
          {!opponentName && (
            <ActivityIndicator color={colors.textDim} size="small" style={{ marginLeft: spacing.sm }} />
          )}
        </View>
      </View>

      {bothReady && (
        <TouchableOpacity style={styles.startButton} onPress={handleStart}>
          <Text style={styles.startButtonText}>Start Game</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.xl,
  },
  playersSection: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
  },
  dotActive: {
    backgroundColor: colors.success,
  },
  dotInactive: {
    backgroundColor: colors.textMuted,
  },
  playerName: {
    fontSize: fontSize.lg,
    color: colors.text,
  },
  startButton: {
    width: '100%',
    backgroundColor: colors.success,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  startButtonText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
});
