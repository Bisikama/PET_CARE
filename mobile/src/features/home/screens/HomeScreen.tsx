import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Screen } from '../../../core/components/Screen';
import { Button } from '../../../core/components/Button';
import { useAuth } from '../../auth/context/AuthContext';
import { typography } from '../../../core/theme/typography';
import { colors } from '../../../core/theme/colors';
import { spacing } from '../../../core/theme/spacing';

export default function HomeScreen() {
  const { user, logout } = useAuth();

  return (
    <Screen style={styles.container} >
      <View style={styles.header}>
        <Text style={[typography.h1, { color: colors.text.primary }]}>
          Xin chào, {user?.full_name || 'bạn'}!
        </Text>
      </View>
      
      <View style={styles.content}>
        <Text style={[typography.bodyLg, { marginBottom: spacing[4] }]}>
          Đây là màn hình trang chủ của Khách Hàng.
        </Text>
        
        <Button label="Đăng xuất" 
          variant="outline" 
          onPress={logout} 
          style={{ marginTop: spacing[8] }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing[6],
  },
  header: {
    marginTop: spacing[8],
    marginBottom: spacing[6],
  },
  content: {
    flex: 1,
  },
});
