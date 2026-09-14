import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Divider,
  EmptyState,
  ErrorState,
  FilterChip,
  IconButton,
  Input,
  Loading,
  OTPInput,
  Screen,
  SearchBar,
  SegmentedControl,
  Skeleton,
  StatusBadge,
} from '@/core/components';
import { theme } from './index';

export function DesignSystemPreview() {
  const [segment, setSegment] = useState('1');
  const [otp, setOtp] = useState('');
  const [search, setSearch] = useState('');

  const renderSection = (title: string, children: React.ReactNode) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Divider marginVertical={theme.spacing[4]} />
      {children}
    </View>
  );

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={[theme.typography.h1, { marginBottom: theme.spacing[6] }]}>
          Design System
        </Text>

        {renderSection(
          'Typography',
          <View style={styles.gap}>
            <Text style={theme.typography.display}>Display 32px</Text>
            <Text style={theme.typography.h1}>Heading H1 28px</Text>
            <Text style={theme.typography.h2}>Heading H2 24px</Text>
            <Text style={theme.typography.h3}>Heading H3 20px</Text>
            <Text style={theme.typography.h4}>Heading H4 18px</Text>
            <Text style={theme.typography.bodyLg}>Body Large 16px</Text>
            <Text style={theme.typography.bodyMd}>Body Medium 14px</Text>
            <Text style={theme.typography.bodySm}>Body Small 13px</Text>
            <Text style={theme.typography.button}>Button 15px</Text>
            <Text style={theme.typography.label}>LABEL 11PX</Text>
          </View>
        )}

        {renderSection(
          'Colors',
          <View style={styles.row}>
            <View style={[styles.colorBox, { backgroundColor: theme.colors.primary.default }]} />
            <View style={[styles.colorBox, { backgroundColor: theme.colors.secondary.default }]} />
            <View style={[styles.colorBox, { backgroundColor: theme.colors.accent.default }]} />
            <View style={[styles.colorBox, { backgroundColor: theme.colors.semantic.error }]} />
          </View>
        )}

        {renderSection(
          'Buttons',
          <View style={styles.gap}>
            <Button label="Primary Button" />
            <Button label="Secondary Button" variant="secondary" />
            <Button label="Outline Button" variant="outline" />
            <Button label="Ghost Button" variant="ghost" />
            <Button label="Loading Button" isLoading />
            <Button label="Disabled Button" disabled />
          </View>
        )}

        {renderSection(
          'Icon Buttons',
          <View style={styles.row}>
            <IconButton icon="search" variant="ghost" />
            <IconButton icon="heart" variant="surface" />
            <IconButton icon="plus" variant="primary" />
            <IconButton icon="map" variant="fab" />
          </View>
        )}

        {renderSection(
          'Inputs',
          <View style={styles.gap}>
            <Input label="Standard Input" placeholder="Enter text..." />
            <Input label="With Icon" leftIcon="mail" placeholder="Email" />
            <Input label="Password" secureTextEntry placeholder="Password" />
            <Input label="Error State" error="This field is required" />
            <SearchBar value={search} onChangeText={setSearch} onClear={() => setSearch('')} />
            <OTPInput value={otp} onChange={setOtp} />
          </View>
        )}

        {renderSection(
          'Badges & Avatars',
          <View style={styles.gap}>
            <View style={styles.row}>
              <Avatar initials="JD" />
              <Avatar initials="AB" shape="square" />
            </View>
            <View style={styles.row}>
              <Badge label="New" />
              <StatusBadge label="Verified" variant="success" icon="shield-check" />
              <StatusBadge label="Pending" variant="warning" icon="clock" />
              <StatusBadge label="Failed" variant="error" icon="x-circle" />
            </View>
          </View>
        )}

        {renderSection(
          'Controls',
          <View style={styles.gap}>
            <SegmentedControl
              segments={[
                { label: 'Map', value: '1' },
                { label: 'List', value: '2' },
              ]}
              selectedValue={segment}
              onValueChange={setSegment}
            />
            <View style={styles.row}>
              <FilterChip label="Dogs" selected />
              <FilterChip label="Cats" />
              <FilterChip label="Birds" />
            </View>
          </View>
        )}

        {renderSection(
          'Cards & Layout',
          <View style={styles.gap}>
            <Card variant="default">
              <Text style={theme.typography.h4}>Default Card</Text>
              <Text style={theme.typography.bodyMd}>Level 1 elevation</Text>
            </Card>
            <Card variant="elevated">
              <Text style={theme.typography.h4}>Elevated Card</Text>
              <Text style={theme.typography.bodyMd}>Level 2 elevation</Text>
            </Card>
            <Skeleton height={100} />
          </View>
        )}

        {renderSection(
          'States',
          <View style={styles.gap}>
            <Card>
              <EmptyState title="No items found" description="Try adjusting your filters" icon="search" />
            </Card>
            <Card>
              <ErrorState title="Connection failed" />
            </Card>
            <Loading />
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingVertical: theme.spacing[6],
  },
  section: {
    marginBottom: theme.spacing[8],
  },
  sectionTitle: {
    ...theme.typography.h2,
    color: theme.colors.text.secondary,
  },
  gap: {
    gap: theme.spacing[4],
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[4],
    alignItems: 'center',
  },
  colorBox: {
    width: 60,
    height: 60,
    borderRadius: theme.radius.sm,
    ...theme.shadows.sm,
  },
});
