import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  PawPrint,
  Compass,
  CalendarDays,
  MessageSquare,
  User,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@/core/theme';

interface CustomerTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

const tabIcons: Record<string, { label: string; Icon: any }> = {
  home: { label: 'Home', Icon: PawPrint },
  explore: { label: 'Explore', Icon: Compass },
  bookings: { label: 'Bookings', Icon: CalendarDays },
  messages: { label: 'Messages', Icon: MessageSquare },
  profile: { label: 'Profile', Icon: User },
};

export function CustomerTabBar({
  state,
  descriptors,
  navigation,
}: CustomerTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: Math.max(insets.bottom, 10) },
      ]}
    >
      <View style={styles.tabBar}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const routeName = route.name.toLowerCase();
          const tabConfig = tabIcons[routeName] || {
            label: options.title || route.name,
            Icon: PawPrint,
          };

          const { label, Icon } = tabConfig;
          const iconColor = isFocused
            ? theme.colors.secondary.container
            : theme.colors.text.muted;
          const textColor = isFocused
            ? theme.colors.primary.navy
            : theme.colors.text.muted;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel || label}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabButton}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <Icon size={22} color={iconColor} />
                {isFocused && <View style={styles.activeIndicator} />}
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: textColor,
                    fontWeight: isFocused ? '700' : '500',
                  },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface.lowest,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.default,
    ...theme.shadows.md,
  },
  tabBar: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: theme.spacing[2],
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    height: 26,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.secondary.container,
  },
  tabLabel: {
    ...theme.typography.label,
    fontSize: 11,
    marginTop: 2,
  },
});
