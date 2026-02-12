import * as Haptics from 'expo-haptics';

export function lightTap() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export function mediumTap() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

export function heavyTap() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
}

export function successVibration() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

export function errorVibration() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
}

export function basraVibration() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}
