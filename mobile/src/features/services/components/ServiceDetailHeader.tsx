import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { ArrowLeft, PawPrint } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { theme } from '@/core/theme';

interface ServiceDetailHeaderProps {
  title?: string;
  onBack?: () => void;
  avatarUrl?: string;
}

export function ServiceDetailHeader({
  title = 'Service Details',
  onBack,
  avatarUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
}: ServiceDetailHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftGroup}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={handleBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={22} color={theme.colors.text.primary} />
        </TouchableOpacity>

        <View style={styles.logoIconWrapper}>
          <PawPrint size={16} color={theme.colors.primary.navy} />
        </View>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
      </View>

      <TouchableOpacity style={styles.avatarWrapper} activeOpacity={0.8}>
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[5],
    backgroundColor: theme.colors.background.default,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
    flex: 1,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -theme.spacing[2],
  },
  logoIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface.container,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...theme.typography.h4,
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.primary.navy,
    flex: 1,
  },
  avatarWrapper: {
    width: 34,
    height: 34,
    borderRadius: theme.radius.full,
    borderWidth: 1.5,
    borderColor: theme.colors.secondary.container,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
});
