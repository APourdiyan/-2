export const THEME_COLORS = {
  primary: '#0E7C86',
  primaryHover: '#0b666e',
  primaryDark: '#084c53',
  lightBg: '#F0EAE1',
  darkBg: '#0F172A',
  lightText: '#1A1A1A',
  darkText: '#F1F5F9',
  accent: '#C4B9A7',
  accentHover: '#b5a894',
  dezfulBrick: '#C26D47',
  dezfulBrickDark: '#9E4E2C',
} as const;

export type ThemeColor = keyof typeof THEME_COLORS;
