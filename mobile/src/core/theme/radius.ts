export const radius = {
  none: 0,
  sm: 8,
  md: 12, // For inputs and some cards
  lg: 16, // Standard cards
  xl: 24, // Bottom sheets
  full: 9999, // Pills, circular buttons
} as const;

export type Radius = typeof radius;
