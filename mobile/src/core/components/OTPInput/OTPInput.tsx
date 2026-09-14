import React, { useRef, useState } from 'react';
import { View, TextInput, StyleSheet, ViewStyle, StyleProp, Text, TouchableOpacity } from 'react-native';
import { theme } from '@/core/theme';

export interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  secure?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function OTPInput({
  length = 4,
  value,
  onChange,
  error,
  disabled = false,
  autoFocus = false,
  secure = false,
  style,
}: OTPInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const hasError = !!error;

  const handlePress = () => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  };

  const getBorderColor = (isActive: boolean) => {
    if (hasError) return theme.colors.semantic.error;
    if (isActive) return theme.colors.primary.default;
    if (disabled) return theme.colors.border.subdued;
    return theme.colors.border.default;
  };

  const getBackgroundColor = (isActive: boolean) => {
    if (hasError) return theme.colors.semantic.errorContainer;
    if (isActive) return theme.colors.primary.container;
    if (disabled) return theme.colors.surface.subdued;
    return theme.colors.surface.default;
  };

  const renderBoxes = () => {
    const boxes = [];
    for (let i = 0; i < length; i++) {
      const char = value[i] || '';
      const isCurrentActive = isFocused && value.length === i;
      const displayChar = secure && char ? '•' : char;

      boxes.push(
        <View
          key={i}
          style={[
            styles.box,
            {
              borderColor: getBorderColor(isCurrentActive),
              backgroundColor: getBackgroundColor(isCurrentActive),
              borderWidth: isCurrentActive ? 2 : 1,
            },
          ]}
        >
          <Text
            style={[
              theme.typography.h2,
              { color: disabled ? theme.colors.text.muted : theme.colors.text.primary },
            ]}
          >
            {displayChar}
          </Text>
        </View>
      );
    }
    return boxes;
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={handlePress}
        style={styles.boxesContainer}
        accessibilityRole="button"
      >
        {renderBoxes()}
      </TouchableOpacity>
      
      {/* Hidden input to handle actual typing */}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(text) => {
          if (text.length <= length) {
            onChange(text);
          }
        }}
        keyboardType="number-pad"
        maxLength={length}
        autoFocus={autoFocus}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        editable={!disabled}
        secureTextEntry={secure}
        style={styles.hiddenInput}
        caretHidden
      />

      {error && (
        <Text style={[theme.typography.caption, styles.errorText]}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: theme.spacing[4],
  },
  boxesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  box: {
    width: 48,
    height: 56,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  errorText: {
    color: theme.colors.semantic.error,
    marginTop: theme.spacing[2],
  },
});
