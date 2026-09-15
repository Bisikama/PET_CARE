import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Bell } from 'lucide-react-native';
import { theme } from '@/core/theme';

interface GreetingHeaderProps {
  userName?: string;
  userAvatar?: string;
  hasUnreadNotifications?: boolean;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
}

export function GreetingHeader({
  userName = 'Sarah Nguyen',
  userAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  hasUnreadNotifications = true,
  onNotificationPress,
  onProfilePress,
}: GreetingHeaderProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.profileSection}
        activeOpacity={0.8}
        onPress={onProfilePress}
      >
        <View style={styles.avatarWrapper}>
          <Image
            source={{ uri: userAvatar }}
            style={styles.avatar}
          />
          <View style={styles.statusDot} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.greetingLabel}>GOOD MORNING</Text>
          <Text style={styles.userName} numberOfLines={1}>
            {userName}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.notificationButton}
        activeOpacity={0.8}
        onPress={onNotificationPress}
        accessibilityLabel="Notifications"
      >
        <Bell size={22} color={theme.colors.primary.navy} />
        {hasUnreadNotifications && <View style={styles.notificationDot} />}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[5],
    paddingTop: theme.spacing[3],
    paddingBottom: theme.spacing[2],
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
    flex: 1,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.surface.containerHigh,
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: theme.colors.tertiary.dim,
    borderWidth: 2,
    borderColor: theme.colors.surface.lowest,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  greetingLabel: {
    ...theme.typography.label,
    color: theme.colors.text.secondary,
    letterSpacing: 0.8,
  },
  userName: {
    ...theme.typography.h3,
    color: theme.colors.primary.navy,
    fontWeight: '700',
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surface.subdued,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.secondary.container,
    borderWidth: 1.5,
    borderColor: theme.colors.surface.lowest,
  },
});
