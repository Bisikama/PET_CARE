import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  CalendarCheck,
  CalendarDays,
  MessageSquare,
  Coins,
  UserCheck,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@/core/theme';

interface ProviderTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

const tabIcons: Record<string, { label: string; Icon: any }> = {
  jobs: { label: 'Jobs', Icon: CalendarCheck },
  schedule: { label: 'Schedule', Icon: CalendarDays },
  messages: { label: 'Messages', Icon: MessageSquare },
  earnings: { label: 'Earnings', Icon: Coins },
  profile: { label: 'Profile', Icon: UserCheck },
};

export function ProviderTabBar({
  state,
  descriptors,
  navigation,
}: ProviderTabBarProps) {
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
            Icon: CalendarCheck,
          };

          const { label, Icon } = tabConfig;
          const iconColor = isFocused
            ? theme.colors.primary.navy
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
                <Icon size={22} color={iconColor} strokeWidth={isFocused ? 2.3 : 1.8} />
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
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EFF4FF',
    shadowColor: '#0B2A4A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 8,
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
    width: 6,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#FDBF35',
  },
  tabLabel: {
    ...theme.typography.label,
    fontSize: 11,
    marginTop: 2,
  },
});
