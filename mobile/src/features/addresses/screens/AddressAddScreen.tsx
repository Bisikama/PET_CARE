import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import MapView, { Marker, Region } from 'react-native-maps';
import { Home, Briefcase, MapPin } from 'lucide-react-native';

import { Screen } from '../../../core/components/Screen';
import { ScreenHeader } from '../../../core/components/ScreenHeader';
import { Input } from '../../../core/components/Input';
import { Button } from '../../../core/components/Button';
import { theme } from '../../../core/theme';
import { useAuth } from '../../auth/context/AuthContext';
import { addressApi } from '../api/addressApi';

const DEFAULT_REGION: Region = {
  latitude: 10.762622,
  longitude: 106.660172, // Ho Chi Minh City center
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

type AddressType = 'HOME' | 'WORK' | 'OTHER';

export default function AddressAddScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [coordinate, setCoordinate] = useState({ latitude: DEFAULT_REGION.latitude, longitude: DEFAULT_REGION.longitude });
  
  const [addressType, setAddressType] = useState<AddressType>('HOME');
  const [receiverName, setReceiverName] = useState(user?.full_name || user?.fullName || '');
  const [phone, setPhone] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [ward, setWard] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleMapPress = (e: any) => {
    setCoordinate(e.nativeEvent.coordinate);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!receiverName.trim()) newErrors.receiverName = 'Vui lòng nhập tên người nhận';
    if (!phone.trim()) newErrors.phone = 'Vui lòng nhập số điện thoại';
    if (!addressLine.trim()) newErrors.addressLine = 'Vui lòng nhập địa chỉ chi tiết';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    
    setLoading(true);
    try {
      await addressApi.createAddress({
        addressType,
        receiverName,
        phone,
        addressLine,
        ward,
        district,
        city,
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        isDefault,
        label: addressType === 'HOME' ? 'Nhà riêng' : addressType === 'WORK' ? 'Cơ quan' : 'Khác'
      });
      
      Alert.alert('Thành công', 'Đã thêm địa chỉ mới', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (err: any) {
      Alert.alert('Lỗi', err?.message || 'Không thể tạo địa chỉ, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen style={styles.container}>
      <ScreenHeader title="Thêm địa chỉ mới" />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Map Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chọn vị trí trên bản đồ</Text>
          <Text style={styles.sectionDesc}>Chạm vào bản đồ để ghim vị trí chính xác của bạn</Text>
          
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={region}
              onPress={handleMapPress}
            >
              <Marker coordinate={coordinate} />
            </MapView>
          </View>
        </View>

        {/* Address Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Loại địa chỉ</Text>
          <View style={styles.typeContainer}>
            <TouchableOpacity 
              style={[styles.typeButton, addressType === 'HOME' && styles.typeButtonActive]}
              onPress={() => setAddressType('HOME')}
            >
              <Home size={20} color={addressType === 'HOME' ? 'white' : theme.colors.text.secondary} />
              <Text style={[styles.typeText, addressType === 'HOME' && styles.typeTextActive]}>Nhà riêng</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.typeButton, addressType === 'WORK' && styles.typeButtonActive]}
              onPress={() => setAddressType('WORK')}
            >
              <Briefcase size={20} color={addressType === 'WORK' ? 'white' : theme.colors.text.secondary} />
              <Text style={[styles.typeText, addressType === 'WORK' && styles.typeTextActive]}>Cơ quan</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.typeButton, addressType === 'OTHER' && styles.typeButtonActive]}
              onPress={() => setAddressType('OTHER')}
            >
              <MapPin size={20} color={addressType === 'OTHER' ? 'white' : theme.colors.text.secondary} />
              <Text style={[styles.typeText, addressType === 'OTHER' && styles.typeTextActive]}>Khác</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Form Fields */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin chi tiết</Text>
          
          <Input 
            label="Tên người nhận" 
            placeholder="Nhập tên người nhận"
            value={receiverName}
            onChangeText={(t) => { setReceiverName(t); setErrors({...errors, receiverName: ''}); }}
            error={errors.receiverName}
          />

          <View style={styles.spacer} />
          
          <Input 
            label="Số điện thoại" 
            placeholder="Nhập số điện thoại liên hệ"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={(t) => { setPhone(t); setErrors({...errors, phone: ''}); }}
            error={errors.phone}
          />

          <View style={styles.spacer} />
          
          <Input 
            label="Địa chỉ chi tiết (Số nhà, tên đường)" 
            placeholder="VD: Số 123 Đường Nguyễn Văn Linh"
            value={addressLine}
            onChangeText={(t) => { setAddressLine(t); setErrors({...errors, addressLine: ''}); }}
            error={errors.addressLine}
          />

          <View style={styles.spacer} />

          <View style={styles.row}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Input 
                label="Phường/Xã" 
                placeholder="Nhập Phường/Xã"
                value={ward}
                onChangeText={setWard}
              />
            </View>
            <View style={{ flex: 1, paddingLeft: 8 }}>
              <Input 
                label="Quận/Huyện" 
                placeholder="Nhập Quận/Huyện"
                value={district}
                onChangeText={setDistrict}
              />
            </View>
          </View>

          <View style={styles.spacer} />

          <Input 
            label="Tỉnh/Thành phố" 
            placeholder="Nhập Tỉnh/Thành phố"
            value={city}
            onChangeText={setCity}
          />
        </View>

        {/* Default Switch */}
        <View style={styles.switchContainer}>
          <View style={styles.switchTextContainer}>
            <Text style={styles.switchTitle}>Đặt làm địa chỉ mặc định</Text>
            <Text style={styles.switchDesc}>Hệ thống sẽ ưu tiên chọn địa chỉ này cho các dịch vụ mới</Text>
          </View>
          <Switch 
            value={isDefault}
            onValueChange={setIsDefault}
            trackColor={{ false: theme.colors.surface.subdued, true: theme.colors.primary.navy }}
          />
        </View>

        <Button 
          label="Lưu địa chỉ" 
          onPress={handleSave} 
          isLoading={loading}
          style={styles.saveButton}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8FAFC', // Consistent with AddressListScreen
  },
  scrollContent: {
    padding: theme.spacing[5],
    paddingBottom: theme.spacing[10],
  },
  section: {
    backgroundColor: theme.colors.surface.lowest,
    borderRadius: theme.radius.xl,
    padding: theme.spacing[5],
    marginBottom: theme.spacing[4],
    ...theme.shadows.sm,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  },
  sectionDesc: {
    ...theme.typography.bodySm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[4],
  },
  mapContainer: {
    height: 200,
    width: '100%',
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border.subdued,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  typeContainer: {
    flexDirection: 'row',
    gap: theme.spacing[3],
    marginTop: theme.spacing[2],
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: theme.spacing[3],
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface.subdued,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
  },
  typeButtonActive: {
    backgroundColor: theme.colors.primary.navy,
    borderColor: theme.colors.primary.navy,
  },
  typeText: {
    ...theme.typography.bodyMdMedium,
    color: theme.colors.text.secondary,
  },
  typeTextActive: {
    color: 'white',
  },
  spacer: {
    height: theme.spacing[4],
  },
  row: {
    flexDirection: 'row',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface.lowest,
    borderRadius: theme.radius.xl,
    padding: theme.spacing[5],
    marginBottom: theme.spacing[6],
    ...theme.shadows.sm,
  },
  switchTextContainer: {
    flex: 1,
    paddingRight: theme.spacing[4],
  },
  switchTitle: {
    ...theme.typography.bodyLg,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  switchDesc: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  saveButton: {
    marginBottom: theme.spacing[6],
  }
});
