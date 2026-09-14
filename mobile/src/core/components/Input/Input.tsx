import React, { useState, forwardRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  StyleProp,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { theme } from '@/core/theme';
import { Icon, IconName } from '../Icon';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: IconName;
  rightIcon?: IconName;
  onRightIconPress?: () => void;
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
}

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      onRightIconPress,
      style,
      containerStyle,
      editable = true,
      secureTextEntry,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const isSecure = secureTextEntry && !isPasswordVisible;
    const hasError = !!error;
    const isDisabled = editable === false;

    const handleFocus = (e: any) => {
      setIsFocused(true);
      if (onFocus) onFocus(e);
    };

    const handleBlur = (e: any) => {
      setIsFocused(false);
      if (onBlur) onBlur(e);
    };

    const togglePasswordVisibility = () => {
      setIsPasswordVisible(!isPasswordVisible);
    };

    const getBorderColor = () => {
      if (hasError) return theme.colors.semantic.error;
      if (isFocused) return theme.colors.primary.default;
      if (isDisabled) return theme.colors.border.subdued;
      return theme.colors.border.default;
    };

    const getBackgroundColor = () => {
      if (hasError) return theme.colors.semantic.errorContainer;
      if (isFocused) return theme.colors.primary.container;
      if (isDisabled) return theme.colors.surface.subdued;
      return theme.colors.surface.default;
    };

    return (
      <View style={[styles.container, containerStyle]}>
        {label && (
          <Text style={[theme.typography.label, styles.label, hasError && { color: theme.colors.semantic.error }]}>
            {label}
          </Text>
        )}
        
        <View
          style={[
            styles.inputContainer,
            {
              borderColor: getBorderColor(),
              backgroundColor: getBackgroundColor(),
              borderWidth: isFocused ? 2 : 1,
            },
            style,
          ]}
        >
          {leftIcon && (
            <Icon
              name={leftIcon}
              size={theme.dimensions.icon.md}
              color={hasError ? theme.colors.semantic.error : theme.colors.text.muted}
              style={styles.leftIcon}
            />
          )}
          
          <TextInput
            ref={ref}
            editable={editable}
            secureTextEntry={isSecure}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholderTextColor={theme.colors.text.muted}
            style={[
              styles.input,
              theme.typography.input,
              { color: isDisabled ? theme.colors.text.muted : theme.colors.text.primary },
            ]}
            {...props}
          />

          {(rightIcon || secureTextEntry) && (
            <TouchableOpacity
              activeOpacity={0.7}
              disabled={!onRightIconPress && !secureTextEntry}
              onPress={secureTextEntry ? togglePasswordVisibility : onRightIconPress}
              style={styles.rightIconContainer}
            >
              <Icon
                name={secureTextEntry ? (isPasswordVisible ? 'eye-off' : 'eye') : rightIcon!}
                size={theme.dimensions.icon.md}
                color={hasError ? theme.colors.semantic.error : theme.colors.text.muted}
              />
            </TouchableOpacity>
          )}
        </View>

        {(helperText || error) && (
          <Text
            style={[
              theme.typography.caption,
              styles.helperText,
              { color: hasError ? theme.colors.semantic.error : theme.colors.text.muted },
            ]}
          >
            {error || helperText}
          </Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: theme.spacing[4],
  },
  label: {
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: theme.dimensions.inputHeight,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing[4],
  },
  input: {
    flex: 1,
    height: '100%',
    padding: 0, // override default android padding
  },
  leftIcon: {
    marginRight: theme.spacing[2],
  },
  rightIconContainer: {
    marginLeft: theme.spacing[2],
    padding: theme.spacing[1],
  },
  helperText: {
    marginTop: theme.spacing[1],
  },
});
