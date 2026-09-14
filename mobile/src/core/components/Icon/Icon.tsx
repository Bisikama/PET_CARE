import React from 'react';
import * as icons from 'lucide-react-native';
import { theme } from '@/core/theme';
import { ViewStyle, StyleProp } from 'react-native';

export type IconName = keyof typeof icons | string;

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export function Icon({ name, size = 24, color = theme.colors.text.primary, style }: IconProps) {
  const pascalName = typeof name === 'string'
    ? name.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('')
    : String(name);

  const LucideIcon = (icons as any)[pascalName];
  
  if (!LucideIcon) {
    console.warn(`Icon ${String(name)} (resolved to ${pascalName}) not found in lucide-react-native`);
    return null;
  }
  
  return <LucideIcon size={size} color={color} style={style} />;
}
