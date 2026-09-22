import React, { forwardRef } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import GorhomBottomSheet, {
  BottomSheetBackdrop,
  BottomSheetProps as GorhomBottomSheetProps,
} from '@gorhom/bottom-sheet';
import { theme } from '@/core/theme';

export interface BottomSheetProps extends Omit<GorhomBottomSheetProps, 'children'> {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const BottomSheet = forwardRef<GorhomBottomSheet, BottomSheetProps>(
  ({ children, style, ...props }, ref) => {
    return (
      <GorhomBottomSheet
        ref={ref}
        enablePanDownToClose
        handleIndicatorStyle={styles.handle}
        backgroundStyle={[styles.background, style]}
        backdropComponent={(backdropProps) => (
          <BottomSheetBackdrop
            {...backdropProps}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            pressBehavior="close"
          />
        )}
        {...props}
      >
        {children}
      </GorhomBottomSheet>
    );
  }
);

BottomSheet.displayName = 'BottomSheet';

const styles = StyleSheet.create({
  background: {
    backgroundColor: theme.colors.surface.default,
    borderRadius: theme.radius.xl,
    ...theme.shadows.lg,
  },
  handle: {
    backgroundColor: theme.colors.border.default,
    width: 40,
    height: 4,
  },
});
