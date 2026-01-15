import { Colors as LightColors } from './Colors';

export const DarkColors = {
  primary: '#06B6D4',
  primaryDark: '#0891B2',
  secondary: '#34D399',
  secondaryDark: '#10B981',
  background: '#0F172A',
  card: '#1E293B',
  text: '#F1F5F9',
  textLight: '#94A3B8',
  border: '#334155',
  error: '#EF4444',
  success: '#10B981',
  white: '#FFFFFF',
  black: '#000000',
  gradientStart: '#06B6D4',
  gradientEnd: '#34D399',
};

export { LightColors };

export const getColors = (isDark: boolean) => isDark ? DarkColors : LightColors;
