export const dimensions = {
  inputHeight: 48,
  buttonHeight: 48,
  minTouchTarget: 48,
  bottomNavigationHeight: 64, // Estimate for typical bottom nav
  avatar: {
    sm: 32,
    md: 48,
    lg: 64,
  },
  icon: {
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
  },
} as const;

export type Dimensions = typeof dimensions;
