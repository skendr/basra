import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

async function safeHaptic(fn: () => Promise<void>) {
  if (isWeb) return;
  try {
    const Haptics = require('expo-haptics');
    await fn.call(null);
  } catch {}
}

export function lightTap() {
  if (isWeb) return;
  const Haptics = require('expo-haptics');
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export function mediumTap() {
  if (isWeb) return;
  const Haptics = require('expo-haptics');
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

export function heavyTap() {
  if (isWeb) return;
  const Haptics = require('expo-haptics');
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
}

export function successVibration() {
  if (isWeb) return;
  const Haptics = require('expo-haptics');
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

export function errorVibration() {
  if (isWeb) return;
  const Haptics = require('expo-haptics');
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
}

export function basraVibration() {
  if (isWeb) return;
  const Haptics = require('expo-haptics');
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}
