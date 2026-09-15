export const colors = {
  primary: {
    default: '#00152D',
    navy: '#0B2A4A',
    container: '#0B2A4A',
    onContainer: '#7892B7',
    surface: '#D3E4FF',
    active: '#000E20',
  },
  secondary: {
    default: '#7B5800',
    container: '#F5B82E',
    onContainer: '#6E4F00',
    active: '#E0A320',
    gold: '#F5B82E',
    dim: '#FABC33',
  },
  tertiary: {
    default: '#10B981',
    container: '#00301E',
    onContainer: '#00A472',
    dim: '#4EDEA3',
    sanctuary: '#10B981',
  },
  accent: {
    default: '#F5B82E',
    gold: '#F5B82E',
    emerald: '#10B981',
  },
  background: {
    default: '#F8F9FF',
    canvas: '#F4F7FA',
    subtle: '#EEF2F6',
  },
  surface: {
    default: '#FFFFFF',
    subdued: '#EFF4FF',
    container: '#E5EEFF',
    containerHigh: '#DCE9FF',
    containerHighest: '#D3E4FE',
    lowest: '#FFFFFF',
  },
  border: {
    default: '#E2E8F0',
    subdued: '#EFF2F6',
    outline: '#74777F',
    outlineVariant: '#C4C6CF',
  },
  text: {
    primary: '#0B1C30',
    secondary: '#43474E',
    muted: '#64748B',
    light: '#94A3B8',
    inverse: '#FFFFFF',
  },
  semantic: {
    success: '#10B981',
    successContainer: '#D1FAE5',
    warning: '#F59E0B',
    warningContainer: '#FEF3C7',
    error: '#EF4444',
    errorContainer: '#FEE2E2',
    info: '#3B82F6',
    infoContainer: '#DBEAFE',
  },
} as const;

export type Colors = typeof colors;
