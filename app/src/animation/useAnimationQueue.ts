import { useRef, useCallback } from 'react';
import type { CardEntitiesManager } from './useCardEntities';
import type { AnimationEvent, GameLayout } from './types';
import * as animations from './animations';

/**
 * Sequential event queue. Events are processed one at a time.
 * Each animation function returns a Promise; next event fires after it resolves.
 */
export function useAnimationQueue(
  entities: CardEntitiesManager,
  layout: GameLayout | null
) {
  const queueRef = useRef<AnimationEvent[]>([]);
  const processingRef = useRef(false);

  const processNext = useCallback(async () => {
    if (processingRef.current) return;
    if (queueRef.current.length === 0) return;
    if (!layout) return;

    processingRef.current = true;
    const event = queueRef.current.shift()!;

    try {
      switch (event.type) {
        case 'game-start':
          await animations.gameStartSequence(entities, layout, event.payload);
          break;
        case 'cards-dealt':
          await animations.dealSequence(entities, layout, event.payload);
          break;
        case 'my-play':
          await animations.myPlaySequence(entities, layout, event.payload);
          break;
        case 'opponent-play':
          await animations.opponentPlaySequence(entities, layout, event.payload);
          break;
        case 'round-end':
          await animations.roundEndSequence(entities, layout, event.payload);
          break;
      }
    } catch (err) {
      console.warn('Animation error:', err);
    }

    processingRef.current = false;

    // Process next event if queued
    if (queueRef.current.length > 0) {
      processNext();
    }
  }, [entities, layout]);

  const enqueue = useCallback(
    (event: AnimationEvent) => {
      queueRef.current.push(event);
      processNext();
    },
    [processNext]
  );

  const clear = useCallback(() => {
    queueRef.current = [];
    processingRef.current = false;
  }, []);

  return { enqueue, clear };
}
