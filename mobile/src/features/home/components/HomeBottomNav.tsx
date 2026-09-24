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

export type TabKey = 'home' | 'explore' | 'bookings' | 'messages' | 'profile';

interface HomeBottomNavProps {
  activeTab?: TabKey;
  onTabPress?: (tab: TabKey) => void;
}

interface TabConfig {
  key: TabKey;
  label: string;
  IconComponent: any;
}

const tabs: TabConfig[] = [
  { key: 'home', label: 'Home', IconComponent: PawPrint },
  { key: 'explore', label: 'Explore', IconComponent: Compass },
  { key: 'bookings', label: 'Bookings', IconComponent: CalendarDays },
  { key: 'messages', label: 'Messages', IconComponent: MessageSquare },
  { key: 'profile', label: 'Profile', IconComponent: User },
];

export function HomeBottomNav({
  activeTab = 'home',
  onTabPress,
}: HomeBottomNavProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: Math.max(insets.bottom, 10) },
      ]}
    >
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const Icon = tab.IconComponent;
          const iconColor = isActive
            ? theme.colors.secondary.container
            : theme.colors.text.muted;
          const textColor = isActive
            ? theme.colors.primary.navy
            : theme.colors.text.muted;

          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabButton}
              activeOpacity={0.7}
              onPress={() => onTabPress?.(tab.key)}
            >
              <View style={styles.iconContainer}>
                <Icon size={22} color={iconColor} />
                {isActive && <View style={styles.activeIndicator} />}
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  { color: textColor, fontWeight: isActive ? '700' : '500' },
                ]}
              >
                {tab.label}
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
    height: 56,
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
