import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Images } from 'lucide-react-native';
import { theme } from '@/core/theme';

interface ProviderGallerySectionProps {
  photos?: string[];
  totalCount?: number;
  onViewAll?: () => void;
}

const defaultPhotos = [
  'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=300&q=80',
];

export function ProviderGallerySection({
  photos = defaultPhotos,
  totalCount = 38,
  onViewAll,
}: ProviderGallerySectionProps) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={styles.iconCircle}>
              <Images size={15} color={theme.colors.secondary.onContainer} />
            </View>
            <Text style={styles.title}>Recent Service Gallery</Text>
          </View>

          <TouchableOpacity activeOpacity={0.7} onPress={onViewAll}>
            <Text style={styles.viewAllText}>View all ({totalCount})</Text>
          </TouchableOpacity>
        </View>

        {/* 3-column Grid */}
        <View style={styles.photoGrid}>
          {photos.slice(0, 3).map((url, idx) => (
            <View key={idx} style={styles.photoWrapper}>
              <Image source={{ uri: url }} style={styles.photo} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing[5],
    paddingTop: theme.spacing[4],
  },
  card: {
    backgroundColor: theme.colors.surface.lowest,
    borderRadius: theme.radius.xl,
    padding: theme.spacing[4],
    gap: theme.spacing[3],
    ...theme.shadows.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.subdued,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface.container,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...theme.typography.h4,
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary.navy,
  },
  viewAllText: {
    ...theme.typography.label,
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary.navy,
  },
  photoGrid: {
    flexDirection: 'row',
    gap: theme.spacing[2],
  },
  photoWrapper: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface.container,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
});
