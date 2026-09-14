import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../../../core/components/Button';
import { Input } from '../../../core/components/Input';
import { Screen } from '../../../core/components/Screen';
import { colors } from '../../../core/theme/colors';
import { spacing } from '../../../core/theme/spacing';
import { typography } from '../../../core/theme/typography';
import { authApi } from '../api/authApi';

export default function ChangePasswordScreen() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const router = useRouter();

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }
    
    if (newPassword.length < 8) {
      setError('Mật khẩu mới phải có ít nhất 8 ký tự');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      await authApi.changePassword({ oldPassword, newPassword });
      setSuccess(true);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <Text style={[typography.h1, { color: colors.text.primary }]}>Đổi mật khẩu</Text>
        <Text style={[typography.bodyLg, { color: colors.text.secondary, marginTop: spacing[1] }]}>
          Vui lòng nhập mật khẩu cũ và mật khẩu mới
        </Text>
      </View>

      <View style={styles.form}>
        {success && (
          <View style={styles.successBox}>
            <Text style={[typography.bodyMd, { color: colors.semantic.success }]}>
              Mật khẩu đã được cập nhật thành công!
            </Text>
          </View>
        )}
        
        <Input
          label="Mật khẩu hiện tại"
          placeholder="Nhập mật khẩu cũ"
          value={oldPassword}
          onChangeText={setOldPassword}
          secureTextEntry
        />
        
        <Input
          label="Mật khẩu mới"
          placeholder="Nhập mật khẩu mới (ít nhất 8 ký tự)"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
        />

        <Input
          label="Xác nhận mật khẩu mới"
          placeholder="Nhập lại mật khẩu mới"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          error={error}
        />

        <Button label="Lưu Thay Đổi"
          onPress={handleChangePassword}
          isLoading={loading}
          style={{ marginTop: spacing[4] }}
        />
        
        <Button label="Quay Lại"
          onPress={() => router.back()}
          variant="outline"
          style={{ marginTop: spacing[2] }}
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
    marginTop: spacing[4],
    marginBottom: spacing[8],
  },
  form: {
    gap: spacing[4],
  },
  successBox: {
    padding: spacing[4],
    backgroundColor: colors.semantic.successContainer,
    borderRadius: spacing[2],
    marginBottom: spacing[2],
  },
});
