import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import type { CardEntity } from '../animation/types';
import { getSuitSymbol, getSuitColor, getDisplayRank } from '../utils/cardImages';
import { colors, cardDimensions } from '../theme';

interface AnimatedCardProps {
  entity: CardEntity;
  small?: boolean;
  gesture?: ReturnType<typeof Gesture.Pan>;
}

const CARD_W = cardDimensions.width;
const CARD_H = cardDimensions.height;

function AnimatedCardInner({ entity, small, gesture }: AnimatedCardProps) {
  const scale = small ? 0.7 : 1;
  const w = CARD_W * scale;
  const h = CARD_H * scale;

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: entity.x.value + entity.dragOffsetX.value - w / 2 },
        { translateY: entity.y.value + entity.dragOffsetY.value - h / 2 },
        { rotate: `${entity.rotation.value}rad` },
        { scale: entity.scale.value },
        { scaleX: entity.scaleX.value },
      ],
      opacity: entity.opacity.value,
      zIndex: entity.zIndex.value,
    };
  });

  const card = entity.card;
  const faceUp = entity.faceUp;

  const content = faceUp && card ? (
    <>
      <Text
        style={[
          styles.rankTop,
          { color: getSuitColor(card.suit) },
        ]}
      >
        {getDisplayRank(card.rank)}
      </Text>
      <Text
        style={[
          styles.suitCenter,
          {
            color: getSuitColor(card.suit),
            fontSize: small ? 18 : 24,
          },
        ]}
      >
        {getSuitSymbol(card.suit)}
      </Text>
      <Text
        style={[
          styles.rankBottom,
          { color: getSuitColor(card.suit) },
        ]}
      >
        {getDisplayRank(card.rank)}
      </Text>
    </>
  ) : (
    <View style={styles.backPattern}>
      <Text style={styles.backText}>B</Text>
    </View>
  );

  const cardView = (
    <Animated.View
      style={[
        styles.card,
        { width: w, height: h, position: 'absolute' },
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
