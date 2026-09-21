import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../theme';

interface ScreenHeaderProps {
  title?: string;
  transparent?: boolean;
}

export function ScreenHeader({ title, transparent = false }: ScreenHeaderProps) {
  const router = useRouter();
  
  return (
    <View style={[styles.container, transparent && styles.transparent]}>
      <TouchableOpacity 
        style={[styles.backButton, transparent && styles.backButtonTransparent]} 
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <ChevronLeft size={24} color={transparent ? 'white' : theme.colors.text.primary} />
      </TouchableOpacity>
      
      {title && <Text style={styles.title}>{title}</Text>}
      
      <View style={styles.placeholder} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[4],
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  transparent: {
    position: 'absolute',
    top: theme.spacing[4],
    left: 0,
    right: 0,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface.lowest,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border.subdued,
    ...theme.shadows.sm,
  },
  backButtonTransparent: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderWidth: 0,
    borderColor: 'transparent',
  },
  placeholder: {
    width: 40,
  },
  title: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    fontWeight: '700',
  }
});
