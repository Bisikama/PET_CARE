import React, { forwardRef } from 'react';
import { TextInput } from 'react-native';
import { Input, InputProps } from '../Input';
import { theme } from '@/core/theme';

export interface SearchBarProps extends Omit<InputProps, 'leftIcon' | 'rightIcon' | 'secureTextEntry'> {
  onClear?: () => void;
}

export const SearchBar = forwardRef<TextInput, SearchBarProps>(
  ({ value, onClear, style, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        value={value}
        leftIcon="search"
        rightIcon={value && value.length > 0 ? 'x' : undefined}
        onRightIconPress={onClear}
        placeholder="Search..."
        returnKeyType="search"
        containerStyle={{ marginBottom: 0 }}
        style={[{ borderRadius: theme.radius.full }, style]}
        {...props}
      />
    );
  }
);

SearchBar.displayName = 'SearchBar';
