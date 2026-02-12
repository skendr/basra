import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../theme';

interface RoomCodeCardProps {
  code: string;
  onCopy: () => void;
  copied: boolean;
}

export default function RoomCodeCard({ code, onCopy, copied }: RoomCodeCardProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onCopy} activeOpacity={0.7}>
      <Text style={styles.label}>ROOM CODE</Text>
      <Text style={styles.code}>{code}</Text>
      <Text style={styles.hint}>{copied ? 'Copied!' : 'Tap to copy'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.accent,
    borderStyle: 'dashed',
  },
  label: {
    fontSize: fontSize.xs,
    color: colors.textDim,
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  code: {
    fontSize: fontSize.huge,
    fontWeight: '900',
    color: colors.accent,
    letterSpacing: 8,
  },
  hint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
