import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../theme';

interface TurnIndicatorProps {
  isMyTurn: boolean;
}

export default function TurnIndicator({ isMyTurn }: TurnIndicatorProps) {
  return (
    <View style={[styles.container, isMyTurn ? styles.myTurn : styles.opponentTurn]}>
      <Text style={styles.text}>
        {isMyTurn ? 'Your Turn' : "Opponent's Turn"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
    alignSelf: 'center',
  },
  myTurn: {
    backgroundColor: colors.success,
  },
  opponentTurn: {
    backgroundColor: colors.surface,
  },
  text: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
});
