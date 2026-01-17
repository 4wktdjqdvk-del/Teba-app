export const Colors = {
  primary: '#0891B2',
  primaryDark: '#0E7490',
  secondary: '#10B981',
  secondaryDark: '#059669',
  background: '#F0F9FF',
  card: '#FFFFFF',
  text: '#0F172A',
  textLight: '#64748B',
  border: '#E2E8F0',
  error: '#EF4444',
  success: '#10B981',
  white: '#FFFFFF',
  black: '#000000',
  gradientStart: '#0891B2',
  gradientEnd: '#10B981',
};

export const DarkColors = {
  primary: '#22D3EE',
  primaryDark: '#0891B2',
  secondary: '#34D399',
  secondaryDark: '#10B981',
  background: '#0F172A',
  card: '#1E293B',
  text: '#F8FAFC',
  textLight: '#94A3B8',
  border: '#334155',
  error: '#F87171',
  success: '#34D399',
  white: '#FFFFFF',
  black: '#000000',
  gradientStart: '#22D3EE',
  gradientEnd: '#34D399',
};

export const getColors = (isDark: boolean) => isDark ? DarkColors : Colors;
