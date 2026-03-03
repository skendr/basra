import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import type { CardEntity } from '../animation/types';
import { getSuitSymbol, getSuitColor, getDisplayRank } from '../utils/cardImages';
import { colors, cardDimensions } from '../theme';

interface AnimatedCardProps {
  entity: CardEntity;
  gesture?: ReturnType<typeof Gesture.Pan>;
}

const W = cardDimensions.width;
const H = cardDimensions.height;
const HALF_W = W / 2;
const HALF_H = H / 2;

function AnimatedCardInner({ entity, gesture }: AnimatedCardProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const dragging = entity.isDragging.value === 1;
    return {
      transform: [
        { translateX: entity.x.value + entity.dragOffsetX.value - HALF_W },
        { translateY: entity.y.value + entity.dragOffsetY.value - HALF_H },
        { rotate: `${entity.rotation.value}rad` },
        { scale: entity.scale.value },
        { scaleX: entity.scaleX.value },
      ],
      opacity: entity.opacity.value,
      zIndex: entity.zIndex.value,
      // Deeper shadow while dragging
      shadowOpacity: dragging ? 0.45 : 0.2,
      shadowRadius: dragging ? 12 : 3,
      shadowOffset: { width: 0, height: dragging ? 8 : 2 },
    };
  });

  const card = entity.card;
  const faceUp = entity.faceUp;

  const content = faceUp && card ? (
    <>
      <Text style={[styles.rankTop, { color: getSuitColor(card.suit) }]}>
        {getDisplayRank(card.rank)}
      </Text>
      <Text style={[styles.suitCenter, { color: getSuitColor(card.suit) }]}>
        {getSuitSymbol(card.suit)}
      </Text>
      <Text style={[styles.rankBottom, { color: getSuitColor(card.suit) }]}>
        {getDisplayRank(card.rank)}
      </Text>
    </>
  ) : (
    <View style={styles.backInner}>
      <View style={styles.backBorder}>
        <View style={styles.backDiamond}>
          <Text style={styles.backLogo}>B</Text>
        </View>
      </View>
    </View>
  );

  const cardView = (
    <Animated.View
      style={[
        styles.card,
        !faceUp && styles.cardBack,
        animatedStyle,
      ]}
    >
      {content}
    </Animated.View>
  );

  if (gesture) {
    return <GestureDetector gesture={gesture}>{cardView}</GestureDetector>;
  }

  return cardView;
}

export default memo(AnimatedCardInner);

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: W,
    height: H,
    backgroundColor: '#fff',
    borderRadius: cardDimensions.borderRadius,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
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
  // Card back design
  backInner: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  backBorder: {
    flex: 1,
    width: '100%',
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: colors.accent,
    opacity: 0.35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backDiamond: {
    width: 22,
    height: 22,
    transform: [{ rotate: '45deg' }],
    borderWidth: 1.5,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backLogo: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.accent,
    transform: [{ rotate: '-45deg' }],
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
