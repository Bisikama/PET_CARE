import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../../core/components/Screen';
import { Button } from '../../../core/components/Button';
import { Icon } from '../../../core/components/Icon';
import { theme } from '../../../core/theme';
import { useAuth } from '../../auth/context/AuthContext';

export default function PendingApprovalScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const handleSwitchToCustomer = () => {
    // Navigate back to customer home
    router.replace('/(customer)/(tabs)/home');
  };

  const handleRefresh = () => {
    // Ideally we would fetch the latest user profile here to see if status changed to ACTIVE
    // For now, we can just reload or do a simple api call
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <View style={styles.badge}>
          <Icon name="clock" size={16} color={theme.colors.semantic.warning} />
          <Text style={styles.badgeText}>PENDING REVIEW</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.illustrationBox}>
          <Icon name="file-search" size={64} color={theme.colors.primary.navy} />
        </View>
        
        <Text style={styles.title}>Account Under Review</Text>
        
        <Text style={styles.subtitle}>
          Hi {(user as any)?.fullName || (user as any)?.full_name || 'there'}, your application to become a provider is currently being reviewed by our team.
        </Text>
        
        <View style={styles.timeline}>
          <View style={styles.timelineItem}>
            <View style={styles.timelineDotActive} />
            <View style={styles.timelineLine} />
            <Text style={styles.timelineTextActive}>Application Submitted</Text>
          </View>
          <View style={styles.timelineItem}>
            <View style={[styles.timelineDotActive, { backgroundColor: theme.colors.semantic.warning }]} />
            <View style={styles.timelineLine} />
            <Text style={[styles.timelineTextActive, { color: theme.colors.semantic.warning }]}>Under Review (1-2 days)</Text>
          </View>
          <View style={styles.timelineItem}>
            <View style={styles.timelineDotInactive} />
            <Text style={styles.timelineTextInactive}>Approval & Onboarding</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Button 
          label="Refresh Status" 
          onPress={handleRefresh} 
          variant="outline"
          style={styles.refreshButton}
        />
        <Button 
          label="Return to Customer App" 
          onPress={handleSwitchToCustomer} 
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.default,
  },
  header: {
    padding: theme.spacing[5],
    alignItems: 'center',
    paddingTop: theme.spacing[8],
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.semantic.warningContainer,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[1],
    borderRadius: 16,
    gap: 6,
  },
  badgeText: {
    ...theme.typography.caption,
    fontWeight: 'bold',
    color: theme.colors.semantic.warning,
  },
  content: {
    flex: 1,
    padding: theme.spacing[5],
    alignItems: 'center',
  },
  illustrationBox: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.primary.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing[6],
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[3],
    textAlign: 'center',
  },
  subtitle: {
    ...theme.typography.bodyLg,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing[8],
  },
  timeline: {
    width: '100%',
    paddingHorizontal: theme.spacing[4],
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    height: 60,
  },
  timelineDotActive: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.semantic.success,
    marginTop: 2,
    zIndex: 1,
  },
  timelineDotInactive: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.border.default,
    marginTop: 2,
    zIndex: 1,
  },
  timelineLine: {
    position: 'absolute',
    left: 7,
    top: 18,
    bottom: -2,
    width: 2,
    backgroundColor: theme.colors.border.subdued,
  },
  timelineTextActive: {
    ...theme.typography.bodyMdMedium,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing[4],
  },
  timelineTextInactive: {
    ...theme.typography.bodyMd,
    color: theme.colors.text.muted,
    marginLeft: theme.spacing[4],
  },
  footer: {
    padding: theme.spacing[5],
    paddingBottom: 40,
    backgroundColor: theme.colors.surface.default,
  },
  refreshButton: {
    marginBottom: theme.spacing[3],
  },
});
