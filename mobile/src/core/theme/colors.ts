export const colors = {
  primary: {
    default: '#FF6B4A',
    container: '#FFEAE4',
    active: '#D94827',
  },
  secondary: {
    default: '#2D8A68',
    container: '#E6F5EF',
    active: '#1E6148',
  },
  accent: {
    default: '#F5A623',
  },
  background: {
    default: '#FCFBF9',
  },
  surface: {
    default: '#FCFBF9',
    subdued: '#F7F4EF',
  },
  border: {
    default: '#E2DDD6',
    subdued: '#EFECE6',
  },
  text: {
    primary: '#1A1613',
    secondary: '#3A352F',
    muted: '#8C857B',
  },
  semantic: {
    success: '#2D8A68',
    successContainer: '#E6F5EF',
    warning: '#F5A623',
    warningContainer: '#FEF6E7',
    error: '#E53935',
    errorContainer: '#FDEBEB',
    info: '#2575FC',
    infoContainer: '#EBF3FF',
  },
} as const;

export type Colors = typeof colors;
