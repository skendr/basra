export const colors = {
  // Background
  bg: '#1a1a2e',
  bgLight: '#16213e',
  bgCard: '#0f3460',
  surface: '#1f2b47',

  // Primary
  primary: '#e94560',
  primaryLight: '#ff6b81',

  // Accent
  accent: '#f0c040',
  accentDim: '#c4993d',

  // Text
  text: '#ffffff',
  textDim: '#8892b0',
  textMuted: '#5a6380',

  // Cards
  cardRed: '#e74c3c',
  cardBlack: '#2c3e50',
  cardBack: '#0f3460',
  cardBorder: '#2a3a5c',

  // Status
  success: '#2ecc71',
  warning: '#f39c12',
  error: '#e74c3c',

  // Table
  tableGreen: '#1b4332',
  tableBorder: '#2d6a4f',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const fontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 32,
  huge: 48,
} as const;

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 999,
} as const;

export const cardDimensions = {
  width: 60,
  height: 84,
  borderRadius: 6,
} as const;
