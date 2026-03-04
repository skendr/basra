import { useCallback, useRef } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { runOnJS, withSpring } from 'react-native-reanimated';
import type { Card } from '@basra/shared';
import { findCaptures } from '@basra/shared';
import type { CardEntity, GameLayout } from './types';
import type { CardEntitiesManager } from './useCardEntities';
import {
  DRAG_SCALE,
  PREVIEW_WOBBLE_SCALE,
  SPRING_SETTLE,
  SPRING_QUICK,
} from './springs';
import { animateSpring } from './utils';

interface DragToPlayOptions {
  entities: CardEntitiesManager;
  layout: GameLayout | null;
  isMyTurn: boolean;
  table: Card[];
  onPlayCard: (cardId: string) => void;
}

export function useDragToPlay({
  entities,
  layout,
  isMyTurn,
  table,
  onPlayCard,
}: DragToPlayOptions) {
  const previewingRef = useRef<string[]>([]);

  const clearPreview = useCallback(() => {
    const cs = layout?.cardScale ?? 1;
    for (const id of previewingRef.current) {
      const e = entities.getEntity(id);
      if (e) {
        e.scale.value = withSpring(0.7 * cs, SPRING_SETTLE);
      }
    }
    previewingRef.current = [];
  }, [entities, layout]);

  const showCapturePreview = useCallback(
    (card: Card) => {
      clearPreview();
      const cs = layout?.cardScale ?? 1;
      const captures = findCaptures(card, table);
      for (const captured of captures) {
        const e = entities.getEntity(captured.id);
        if (e) {
          animateSpring(e.scale, PREVIEW_WOBBLE_SCALE * cs, {
            damping: 4,
            stiffness: 200,
            mass: 0.5,
          });
          previewingRef.current.push(captured.id);
        }
      }
    },
    [entities, table, clearPreview, layout]
  );

  const createDragGesture = useCallback(
    (entity: CardEntity) => {
      if (!layout) return Gesture.Pan();

      const tableTop = layout.table.y;
      const tableBottom = layout.table.y + layout.table.height;
      const tableCenterX = layout.table.x + layout.table.width / 2;
      const tableCenterY = layout.table.y + layout.table.height / 2;
      const cs = layout.cardScale;

      return Gesture.Pan()
        .enabled(isMyTurn)
        .onBegin(() => {
          'worklet';
          entity.isDragging.value = 1;
          entity.zIndex.value = 1000;
          entity.scale.value = withSpring(DRAG_SCALE * cs, SPRING_SETTLE);
        })
        .onUpdate((e) => {
          'worklet';
          entity.dragOffsetX.value = e.translationX;
          entity.dragOffsetY.value = e.translationY;
          entity.rotation.value = e.velocityX * 0.00003;

          const currentY = entity.y.value + e.translationY;
          if (entity.card) {
            const inTable = currentY > tableTop && currentY < tableBottom;
            if (inTable) {
              runOnJS(showCapturePreview)(entity.card);
            } else {
              runOnJS(clearPreview)();
            }
          }
        })
        .onEnd((e) => {
          'worklet';
          const dropY = entity.y.value + e.translationY;
          const overTable = dropY > tableTop && dropY < tableBottom;

          // Transfer drag offset into base position so we can zero offsets
          // without a visual jump, then spring to the target.
          const visualX = entity.x.value + entity.dragOffsetX.value;
          const visualY = entity.y.value + entity.dragOffsetY.value;
          const origX = entity.x.value;
          const origY = entity.y.value;

          entity.dragOffsetX.value = 0;
          entity.dragOffsetY.value = 0;
          entity.isDragging.value = 0;

          if (overTable && entity.card) {
            // Set to current visual pos, then spring to table center
            entity.x.value = visualX;
            entity.y.value = visualY;
            entity.x.value = withSpring(tableCenterX, SPRING_QUICK);
            entity.y.value = withSpring(tableCenterY, SPRING_QUICK);
            entity.scale.value = withSpring(cs, SPRING_SETTLE);
            entity.rotation.value = withSpring(0, SPRING_SETTLE);
            runOnJS(clearPreview)();
            runOnJS(onPlayCard)(entity.card.id);
          } else {
            // Set to current visual pos, then spring back to origin
            entity.x.value = visualX;
            entity.y.value = visualY;
            entity.x.value = withSpring(origX, SPRING_SETTLE);
            entity.y.value = withSpring(origY, SPRING_SETTLE);
            entity.scale.value = withSpring(cs, SPRING_SETTLE);
            entity.rotation.value = withSpring(0, SPRING_SETTLE);
            entity.zIndex.value = 10;
            runOnJS(clearPreview)();
          }
        })
        .onFinalize(() => {
          'worklet';
          entity.isDragging.value = 0;
        });
    },
    [layout, isMyTurn, showCapturePreview, clearPreview, onPlayCard]
  );

  return { createDragGesture };
}
