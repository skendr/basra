import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSocket } from '../src/hooks/useSocket';
import { useGameStore } from '../src/store/useGameStore';
import { useAppStore } from '../src/store/useAppStore';
import { colors, spacing, fontSize, borderRadius } from '../src/theme';
import { BASRA_POINTS, JACK_BASRA_POINTS, MOST_CARDS_BONUS } from '@basra/shared';

export default function ScoreScreen() {
  const router = useRouter();
  const { nextRound, rematch } = useSocket();
  const { phase, roundEndData, gameOverData, players, myId } = useGameStore();

  const isGameOver = phase === 'game-over';

  const handleNextRound = () => {
    nextRound();
    router.replace('/game');
  };

  const handleRematch = () => {
    rematch();
    router.replace('/game');
  };

  const handleHome = () => {
    useGameStore.getState().reset();
    useAppStore.getState().reset();
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>
        {isGameOver ? 'Game Over!' : `Round ${roundEndData?.roundNumber} Complete`}
      </Text>

      {/* Winner announcement for game over */}
      {isGameOver && gameOverData && (
        <View style={styles.winnerSection}>
          <Text style={styles.winnerLabel}>
            {gameOverData.winnerId === myId ? 'You Win!' : `${gameOverData.winnerNickname} Wins!`}
          </Text>
        </View>
      )}

      {/* Round score breakdown */}
      {roundEndData && (
        <View style={styles.scoresContainer}>
          {roundEndData.players.map((player) => {
            const isMe = player.id === myId;
            return (
              <View key={player.id} style={[styles.playerCard, isMe && styles.myCard]}>
                <Text style={styles.playerName}>
                  {player.nickname} {isMe ? '(You)' : ''}
                </Text>

                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Cards captured</Text>
                  <Text style={styles.statValue}>{player.capturedCount}</Text>
                </View>

                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Most cards bonus</Text>
                  <Text style={styles.statValue}>
                    {(() => {
                      const other = roundEndData.players.find(p => p.id !== player.id)!;
                      return player.capturedCount > other.capturedCount ? `+${MOST_CARDS_BONUS}` : '0';
                    })()}
                  </Text>
                </View>

                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Basras ({player.basras}x)</Text>
                  <Text style={styles.statValue}>+{player.basras * BASRA_POINTS}</Text>
                </View>

                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Jack Basras ({player.jackBasras}x)</Text>
                  <Text style={styles.statValue}>+{player.jackBasras * JACK_BASRA_POINTS}</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.statRow}>
                  <Text style={styles.roundTotalLabel}>Round Points</Text>
                  <Text style={styles.roundTotalValue}>+{player.roundPoints}</Text>
                </View>

                <View style={styles.statRow}>
                  <Text style={styles.totalLabel}>Total Score</Text>
                  <Text style={styles.totalValue}>{player.totalScore}</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Action buttons */}
      <View style={styles.actions}>
        {isGameOver ? (
          <>
            <TouchableOpacity style={styles.primaryButton} onPress={handleRematch}>
              <Text style={styles.buttonText}>Rematch</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleHome}>
              <Text style={styles.secondaryButtonText}>Home</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={styles.primaryButton} onPress={handleNextRound}>
            <Text style={styles.buttonText}>Next Round</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.lg,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  winnerSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  winnerLabel: {
    fontSize: fontSize.xl,
    fontWeight: '900',
    color: colors.accent,
  },
  scoresContainer: {
    gap: spacing.md,
    flex: 1,
  },
  playerCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  myCard: {
    borderColor: colors.primary,
  },
  playerName: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: fontSize.md,
    color: colors.textDim,
  },
  statValue: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.cardBorder,
    marginVertical: spacing.sm,
  },
  roundTotalLabel: {
    fontSize: fontSize.md,
    color: colors.primaryLight,
    fontWeight: '600',
  },
  roundTotalValue: {
    fontSize: fontSize.md,
    color: colors.primaryLight,
    fontWeight: '700',
  },
  totalLabel: {
    fontSize: fontSize.lg,
    color: colors.accent,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: fontSize.lg,
    color: colors.accent,
    fontWeight: '800',
  },
  actions: {
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.textDim,
  },
  secondaryButtonText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.textDim,
  },
});
