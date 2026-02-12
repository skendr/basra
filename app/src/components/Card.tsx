import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Card as CardType } from '@basra/shared';
import { getSuitSymbol, getSuitColor, getDisplayRank } from '../utils/cardImages';
import { colors, cardDimensions } from '../theme';

interface CardProps {
  card: CardType;
  faceUp?: boolean;
  onPress?: (card: CardType) => void;
  selected?: boolean;
  disabled?: boolean;
  small?: boolean;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function Card({
  card,
  faceUp = true,
  onPress,
  selected = false,
  disabled = false,
  small = false,
}: CardProps) {
  const scale = useSharedValue(1);

  const suitColor = getSuitColor(card.suit);
  const suitSymbol = getSuitSymbol(card.suit);
  const displayRank = getDisplayRank(card.rank);

  const w = small ? cardDimensions.width * 0.7 : cardDimensions.width;
  const h = small ? cardDimensions.height * 0.7 : cardDimensions.height;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: selected ? -10 : 0 },
    ],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = () => {
    if (!disabled && onPress) {
      onPress(card);
    }
  };

  if (!faceUp) {
    return (
      <View style={[styles.card, styles.cardBack, { width: w, height: h }]}>
        <View style={styles.backPattern}>
          <Text style={styles.backText}>B</Text>
        </View>
      </View>
    );
  }

  return (
    <AnimatedTouchable
      style={[
        styles.card,
        { width: w, height: h },
        selected && styles.cardSelected,
        disabled && styles.cardDisabled,
        animatedStyle,
      ]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.8}
      disabled={disabled}
    >
      <Text style={[styles.rankTop, { color: suitColor }]}>
        {displayRank}
      </Text>
      <Text style={[styles.suitCenter, { color: suitColor, fontSize: small ? 18 : 24 }]}>
        {suitSymbol}
      </Text>
      <Text style={[styles.rankBottom, { color: suitColor }]}>
        {displayRank}
      </Text>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: cardDimensions.borderRadius,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  cardBack: {
    backgroundColor: colors.cardBack,
    borderColor: colors.cardBorder,
  },
  backPattern: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.accent,
    opacity: 0.4,
  },
  cardSelected: {
    borderColor: colors.accent,
    borderWidth: 2,
    shadowColor: colors.accent,
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  cardDisabled: {
    opacity: 0.5,
  },
  rankTop: {
    position: 'absolute',
    top: 3,
    left: 4,
    fontSize: 11,
    fontWeight: '700',
  },
  suitCenter: {
    fontSize: 24,
  },
  rankBottom: {
    position: 'absolute',
    bottom: 3,
    right: 4,
    fontSize: 11,
    fontWeight: '700',
    transform: [{ rotate: '180deg' }],
  },
});
