import { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Card as CardType } from '@basra/shared';
import { useSocket } from '../src/hooks/useSocket';
import { useGameStore } from '../src/store/useGameStore';
import { useAppStore } from '../src/store/useAppStore';
import { lightTap, mediumTap, successVibration } from '../src/utils/haptics';
import Card from '../src/components/Card';
import CardHand from '../src/components/CardHand';
import TableArea from '../src/components/TableArea';
import OpponentHand from '../src/components/OpponentHand';
import ScoreBar from '../src/components/ScoreBar';
import DeckPile from '../src/components/DeckPile';
import BasraToast from '../src/components/BasraToast';
import TurnIndicator from '../src/components/TurnIndicator';
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

  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
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

  // Haptic feedback on capture
  useEffect(() => {
    if (lastPlay && lastPlay.capturedCards.length > 0) {
      if (lastPlay.isBasra || lastPlay.isJackBasra) {
        successVibration();
      } else {
        mediumTap();
      }
    }
  }, [lastPlay]);

  const handleCardPress = useCallback(
    (card: CardType) => {
      if (!isMyTurn) return;

      if (selectedCardId === card.id) {
        // Double tap / confirm: play the card
        lightTap();
        emitPlayCard(card.id);
        setSelectedCardId(null);
      } else {
        // Select the card
        lightTap();
        setSelectedCardId(card.id);
      }
    },
    [isMyTurn, selectedCardId, emitPlayCard]
  );

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

      {/* Opponent Hand */}
      <OpponentHand
        cardCount={opponentCardCount}
        nickname={opponent.nickname}
        score={opponent.score}
        capturedCount={opponent.capturedCount}
      />

      {/* Disconnection Warning */}
      {!opponentConnected && (
        <View style={styles.disconnectBanner}>
          <Text style={styles.disconnectText}>Opponent disconnected...</Text>
        </View>
      )}

      {/* Turn Indicator */}
      <TurnIndicator isMyTurn={isMyTurn} />

      {/* Table */}
      <TableArea cards={table} />

      {/* My capture pile info */}
      <DeckPile
        myCapturedCount={me.capturedCount}
        myBasras={me.basras}
        myJackBasras={me.jackBasras}
      />

      {/* My Hand */}
      <View style={styles.handSection}>
        <CardHand
          cards={hand}
          onCardPress={handleCardPress}
          selectedCardId={selectedCardId}
          disabled={!isMyTurn}
        />
        {selectedCardId && isMyTurn && (
          <Text style={styles.hint}>Tap again to play</Text>
        )}
      </View>

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
  handSection: {
    alignItems: 'center',
    paddingBottom: spacing.md,
  },
  hint: {
    fontSize: fontSize.xs,
    color: colors.accent,
    marginTop: spacing.xs,
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
