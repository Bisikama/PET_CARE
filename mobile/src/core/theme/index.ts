import { colors } from './colors';
import { dimensions } from './dimensions';
import { radius } from './radius';
import { shadows } from './shadows';
import { spacing } from './spacing';
import { typography } from './typography';

export const theme = {
  colors,
  typography,
  spacing,
  radius,
  shadows,
  dimensions,
} as const;

export type Theme = typeof theme;

// Optional utility if we want to hook into a theme context later
// Currently statically exported for immediate use.
