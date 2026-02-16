import { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useSocket } from '../src/hooks/useSocket';
import { useGameStore } from '../src/store/useGameStore';
import { useAppStore } from '../src/store/useAppStore';
import ScoreBar from '../src/components/ScoreBar';
import TurnIndicator from '../src/components/TurnIndicator';
import GameBoard from '../src/components/GameBoard';
import BasraToast from '../src/components/BasraToast';
import { colors, spacing, fontSize } from '../src/theme';

export default function GameScreen() {
  const router = useRouter();
  const { playCard: emitPlayCard } = useSocket();
  const {
    hand,
    table,
    deckRemaining,
    currentTurn,
    myId,
    opponentCardCount,
    roundNumber,
    targetScore,
    players,
    lastPlay,
    phase,
    opponentConnected,
  } = useGameStore();

  const [showBasra, setShowBasra] = useState(false);
  const [isJackBasra, setIsJackBasra] = useState(false);

  const isMyTurn = currentTurn === myId;
  const me = players.find((p) => p.id === myId);
  const opponent = players.find((p) => p.id !== myId);

  // Navigate to score screen on round end or game over
  useEffect(() => {
    if (phase === 'round-end' || phase === 'game-over') {
      router.push('/score');
    }
  }, [phase]);

  // Show basra toast when a basra occurs
  useEffect(() => {
    if (lastPlay && (lastPlay.isBasra || lastPlay.isJackBasra)) {
      setIsJackBasra(lastPlay.isJackBasra);
      setShowBasra(true);
    }
  }, [lastPlay]);

  if (!me || !opponent) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Score Bar */}
      <ScoreBar
        myScore={me.score}
        opponentScore={opponent.score}
        myName={me.nickname}
        opponentName={opponent.nickname}
        targetScore={targetScore}
        roundNumber={roundNumber}
        deckRemaining={deckRemaining}
      />

      {/* Disconnection Warning */}
      {!opponentConnected && (
        <View style={styles.disconnectBanner}>
          <Text style={styles.disconnectText}>Opponent disconnected...</Text>
        </View>
      )}

      {/* Turn Indicator */}
      <TurnIndicator isMyTurn={isMyTurn} />

      {/* Game Board — single flat card layer with all animations */}
      <GameBoard
        hand={hand}
        table={table}
        opponentCardCount={opponentCardCount}
        deckRemaining={deckRemaining}
        isMyTurn={isMyTurn}
        myId={myId}
        myCapturedCount={me.capturedCount}
        myBasras={me.basras}
        myJackBasras={me.jackBasras}
        opponentCapturedCount={opponent.capturedCount}
        opponentBasras={opponent.basras}
        opponentJackBasras={opponent.jackBasras}
        onPlayCard={emitPlayCard}
      />

      {/* Basra Toast */}
      <BasraToast
        visible={showBasra}
        isJackBasra={isJackBasra}
        onHide={() => setShowBasra(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  loadingText: {
    color: colors.text,
    fontSize: fontSize.lg,
    textAlign: 'center',
    marginTop: 100,
  },
  disconnectBanner: {
    backgroundColor: colors.error,
    paddingVertical: spacing.xs,
    alignItems: 'center',
  },
  disconnectText: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
});
