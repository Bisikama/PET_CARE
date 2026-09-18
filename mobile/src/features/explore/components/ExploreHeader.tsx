import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Bell, PawPrint } from 'lucide-react-native';
import { theme } from '@/core/theme';

interface ExploreHeaderProps {
  hasUnreadNotifications?: boolean;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
  avatarUrl?: string;
}

export function ExploreHeader({
  hasUnreadNotifications = true,
  onNotificationPress,
  onProfilePress,
  avatarUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
}: ExploreHeaderProps) {
  return (
    <View style={styles.container}>
      {/* Brand & Page Name */}
      <View style={styles.brandRow}>
        <View style={styles.logoIconWrapper}>
          <PawPrint size={18} color={theme.colors.primary.navy} />
        </View>
        <Text style={styles.brandTitle}>PawCare</Text>
        <Text style={styles.pageSubtitle}>• Explore</Text>
      </View>

      {/* Actions (Notifications + Avatar) */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.7}
          onPress={onNotificationPress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Bell size={20} color={theme.colors.text.secondary} />
          {hasUnreadNotifications && <View style={styles.badgeDot} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.avatarWrapper}
          activeOpacity={0.8}
          onPress={onProfilePress}
        >
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[5],
    paddingVertical: theme.spacing[3],
    backgroundColor: theme.colors.background.default,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  logoIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface.container,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    ...theme.typography.h4,
    fontWeight: '800',
    color: theme.colors.primary.navy,
  },
  pageSubtitle: {
    ...theme.typography.bodyMd,
    color: theme.colors.text.secondary,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface.default,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  badgeDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.semantic.error,
    borderWidth: 1.5,
    borderColor: theme.colors.surface.default,
  },
  avatarWrapper: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.full,
    borderWidth: 2,
    borderColor: theme.colors.secondary.container,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
});
