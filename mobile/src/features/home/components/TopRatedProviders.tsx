import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Star } from 'lucide-react-native';
import { theme } from '@/core/theme';
import { RecommendedProvider } from '@/infrastructure/api/services.api';
import { ProviderCard } from './ProviderCard';

interface TopRatedProvidersProps {
  providers: RecommendedProvider[];
  onExplore?: () => void;
  onProviderPress?: (providerId: string) => void;
  onToggleFavorite?: (providerId: string) => void;
}

export function TopRatedProviders({
  providers,
  onExplore,
  onProviderPress,
  onToggleFavorite,
}: TopRatedProvidersProps) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleWithIcon}>
          <Star
            size={20}
            color={theme.colors.secondary.default}
            fill={theme.colors.secondary.container}
          />
          <Text style={styles.sectionTitle}>Top Rated Providers</Text>
        </View>
        <TouchableOpacity activeOpacity={0.7} onPress={onExplore}>
          <Text style={styles.exploreText}>Explore</Text>
        </TouchableOpacity>
      </View>

      {/* List of Provider Cards */}
      <View style={styles.list}>
        {providers.map((provider) => (
          <ProviderCard
            key={provider.id}
            provider={provider}
            onPress={onProviderPress}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing[5],
    marginBottom: theme.spacing[6],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing[3],
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  sectionTitle: {
    ...theme.typography.h4,
    color: theme.colors.text.primary,
    fontWeight: '700',
  },
  exploreText: {
    ...theme.typography.bodySm,
    color: theme.colors.secondary.container,
    fontWeight: '700',
  },
  list: {
    gap: theme.spacing[1],
  },
});
