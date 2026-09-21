import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import MapView, { Marker, Region } from 'react-native-maps';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Upload, CheckCircle2, MapPin, Check, Briefcase, Scissors, Stethoscope, FileText, Trash2, Shield } from 'lucide-react-native';

import { Screen } from '../../../core/components/Screen';
import { ScreenHeader } from '../../../core/components/ScreenHeader';
import { Input } from '../../../core/components/Input';
import { Button } from '../../../core/components/Button';
import { theme } from '../../../core/theme';
import { providerApi } from '../api/providerApi';
import { ProviderType } from '../types/provider.types';

const DEFAULT_REGION: Region = {
  latitude: 10.762622,
  longitude: 106.660172,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function BecomeProviderFormScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // -- Step 1: Profile --
  const [providerType, setProviderType] = useState<ProviderType>(ProviderType.SITTER);
  const [experience, setExperience] = useState('');
  const [bio, setBio] = useState('');

  // -- Step 2: Location --
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [coordinate, setCoordinate] = useState({ latitude: DEFAULT_REGION.latitude, longitude: DEFAULT_REGION.longitude });
  const [baseAddressLine, setBaseAddressLine] = useState('');
  const [baseCity, setBaseCity] = useState('');
  const [radiusKm, setRadiusKm] = useState('5');

  // -- Step 3: KYC --
  const [idNumber, setIdNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [frontImage, setFrontImage] = useState<any>(null);
  const [backImage, setBackImage] = useState<any>(null);
  const [faceImage, setFaceImage] = useState<any>(null);

  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleMapPress = (e: any) => {
    setCoordinate(e.nativeEvent.coordinate);
  };

  const pickImage = async (setImage: (img: any) => void) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể mở thư viện ảnh');
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    // Profile
    if (experience && isNaN(Number(experience))) newErrors.experience = 'Phải là số';
    
    // Location
    if (!baseAddressLine.trim()) newErrors.baseAddressLine = 'Vui lòng nhập địa chỉ';
    if (!baseCity.trim()) newErrors.baseCity = 'Vui lòng nhập Tỉnh/TP';
    if (!radiusKm || isNaN(Number(radiusKm))) newErrors.radiusKm = 'Bán kính không hợp lệ';

    // KYC
    if (!fullName.trim()) newErrors.fullName = 'Bắt buộc';
    if (!idNumber.trim()) newErrors.idNumber = 'Bắt buộc';
    if (!dob.trim()) newErrors.dob = 'Bắt buộc';
    if (!issueDate.trim()) newErrors.issueDate = 'Bắt buộc';

    setErrors(newErrors);

    if (!frontImage || !backImage || !faceImage) {
      Alert.alert('Thiếu thông tin', 'Vui lòng tải lên đủ 3 ảnh (Mặt trước, mặt sau CCCD và Ảnh chân dung).');
      return false;
    }
    
    if (!agreed) {
      Alert.alert('Chưa xác nhận', 'Vui lòng đồng ý với các điều khoản của PetCare.');
      return false;
    }

    if (Object.keys(newErrors).length > 0) {
      Alert.alert('Lỗi nhập liệu', 'Vui lòng kiểm tra lại các trường báo đỏ.');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    setLoading(true);
    try {
      // 1. Create Profile
      try {
        await providerApi.createProfile({
          providerType,
          experienceYears: experience ? Number(experience) : undefined,
          bio: bio || undefined,
        });
      } catch (e: any) {
        if (e?.statusCode !== 409 && !e?.message?.includes('exists')) throw e; // Ignore if profile exists
      }

      // 2. Update Location
      await providerApi.updateBaseAddress({
        baseAddressLine,
        baseCity,
        baseLatitude: coordinate.latitude,
        baseLongitude: coordinate.longitude,
        serviceRadiusKm: Number(radiusKm),
      });

      // 3. Upload KYC
      const frontFile = { uri: frontImage.uri, type: 'image/jpeg', name: `front_${Date.now()}.jpg` };
      const backFile = { uri: backImage.uri, type: 'image/jpeg', name: `back_${Date.now()}.jpg` };
      const faceFile = { uri: faceImage.uri, type: 'image/jpeg', name: `face_${Date.now()}.jpg` };

      await providerApi.uploadKyc(
        { idNumber, fullName, dob, issueDate },
        frontFile, backFile, faceFile
      );
      
      router.replace('/(customer)/become-provider/success');
    } catch (err: any) {
      Alert.alert('Lỗi hệ thống', err?.message || 'Có lỗi xảy ra khi nộp hồ sơ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // UI Helpers
  const SectionHeader = ({ icon: Icon, title, desc }: { icon: any, title: string, desc?: string }) => (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionIconBox}>
        <Icon size={18} color={theme.colors.primary.navy} />
      </View>
      <View>
        <Text style={styles.sectionTitle}>{title} <Text style={{color: theme.colors.semantic.error}}>*</Text></Text>
        {desc && <Text style={styles.sectionDesc}>{desc}</Text>}
      </View>
    </View>
  );

  const FileItem = ({ title, image, onRemove }: { title: string, image: any, onRemove: () => void }) => {
    if (!image) return null;
    return (
      <View style={styles.fileItem}>
        <Image source={{ uri: image.uri }} style={styles.fileIcon} />
        <View style={styles.fileInfo}>
          <Text style={styles.fileName}>{title}</Text>
          <Text style={styles.fileStatus}><CheckCircle2 size={12} color={theme.colors.semantic.success} /> Đã tải lên</Text>
        </View>
        <TouchableOpacity onPress={onRemove} style={styles.removeBtn}>
          <Trash2 size={18} color={theme.colors.semantic.error} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Screen style={styles.container}>
      <ScreenHeader title="Đăng ký Đối tác" />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Progress Bar */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View style={styles.progressStep}>
              <Text style={styles.stepNum}>1</Text>
            </View>
            <Text style={styles.progressTitle}>Bước 1/1: Hồ sơ đối tác</Text>
            <View style={styles.apiModeTag}>
              <Text style={styles.apiModeText}>100% Hoàn thành</Text>
            </View>
          </View>
          <View style={styles.progressBarBg}>
            <View style={styles.progressBarFill} />
          </View>
          <Text style={styles.progressDesc}>Điền đầy đủ thông tin cơ sở chăm sóc để nhận huy hiệu kiểm duyệt PetCare Partner trong 24 giờ.</Text>
        </View>

        {/* 1. DỊCH VỤ CUNG CẤP */}
        <View style={styles.card}>
          <SectionHeader icon={Briefcase} title="DỊCH VỤ CUNG CẤP" desc="Chọn dịch vụ chính bạn muốn đăng ký." />
          <View style={styles.servicesGrid}>
            <TouchableOpacity 
              style={[styles.serviceBox, providerType === ProviderType.SITTER && styles.serviceBoxActive]}
              onPress={() => setProviderType(ProviderType.SITTER)}
            >
              {providerType === ProviderType.SITTER && <View style={styles.checkIcon}><Check size={12} color="white" /></View>}
              <View style={styles.serviceIconWrap}><Briefcase size={20} color={providerType === ProviderType.SITTER ? theme.colors.primary.navy : '#64748B'} /></View>
              <Text style={styles.serviceBoxTitle}>Trông giữ thú cưng</Text>
              <Text style={styles.serviceBoxSub}>Giữ & chăm sóc tại nhà</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.serviceBox, providerType === ProviderType.GROOMER && styles.serviceBoxActive]}
              onPress={() => setProviderType(ProviderType.GROOMER)}
            >
              {providerType === ProviderType.GROOMER && <View style={styles.checkIcon}><Check size={12} color="white" /></View>}
              <View style={styles.serviceIconWrap}><Scissors size={20} color={providerType === ProviderType.GROOMER ? theme.colors.primary.navy : '#64748B'} /></View>
              <Text style={styles.serviceBoxTitle}>Tắm sấy & Vệ sinh</Text>
              <Text style={styles.serviceBoxSub}>Grooming chuyên sâu</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.serviceBox, providerType === ProviderType.VET && styles.serviceBoxActive]}
              onPress={() => setProviderType(ProviderType.VET)}
            >
              {providerType === ProviderType.VET && <View style={styles.checkIcon}><Check size={12} color="white" /></View>}
              <View style={styles.serviceIconWrap}><Stethoscope size={20} color={providerType === ProviderType.VET ? theme.colors.primary.navy : '#64748B'} /></View>
              <Text style={styles.serviceBoxTitle}>Thú y & Khám bệnh</Text>
              <Text style={styles.serviceBoxSub}>Tiêm phòng, chữa bệnh</Text>
            </TouchableOpacity>
          </View>

          <Input 
            placeholder="Số năm kinh nghiệm (VD: 3)"
            keyboardType="numeric"
            value={experience}
            onChangeText={(t) => { setExperience(t); setErrors({...errors, experience: ''}) }}
            error={errors.experience}
            style={{marginTop: 12}}
          />
          <Input 
            placeholder="Tiểu sử / Giới thiệu bản thân"
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={3}
            style={{marginTop: 12, height: 80, textAlignVertical: 'top'}}
          />
        </View>

        {/* 2. ĐỊA CHỈ KINH DOANH */}
        <View style={styles.card}>
          <SectionHeader icon={MapPin} title="ĐỊA CHỈ KINH DOANH" />
          
          <View style={styles.mapWrap}>
            <MapView style={styles.map} initialRegion={region} onPress={handleMapPress}>
              <Marker coordinate={coordinate} />
            </MapView>
            <View style={styles.mapOverlayLabel}>
              <CheckCircle2 size={14} color="#D97706" />
              <Text style={styles.mapOverlayText}>Đã ghim vị trí</Text>
            </View>
          </View>

          <View style={{marginTop: 12}}>
            <Input 
              placeholder="Địa chỉ chi tiết (Số nhà, đường...)"
              value={baseAddressLine}
              onChangeText={(t) => { setBaseAddressLine(t); setErrors({...errors, baseAddressLine: ''}) }}
              error={errors.baseAddressLine}
            />
          </View>
          <View style={{flexDirection: 'row', marginTop: 12, gap: 12}}>
            <View style={{flex: 1}}>
              <Input 
                placeholder="Tỉnh/Thành phố"
                value={baseCity}
                onChangeText={(t) => { setBaseCity(t); setErrors({...errors, baseCity: ''}) }}
                error={errors.baseCity}
              />
            </View>
            <View style={{flex: 1}}>
              <Input 
                placeholder="Bán kính (km)"
                keyboardType="numeric"
                value={radiusKm}
                onChangeText={(t) => { setRadiusKm(t); setErrors({...errors, radiusKm: ''}) }}
                error={errors.radiusKm}
              />
            </View>
          </View>
        </View>

        {/* 3. TẢI LÊN CHỨNG TỪ XÁC THỰC */}
        <View style={styles.card}>
          <SectionHeader icon={Shield} title="TẢI LÊN CHỨNG TỪ XÁC THỰC" desc="CMND/CCCD đại diện hoặc Giấy phép kinh doanh / Chứng chỉ hành nghề." />
          
          <Input 
            placeholder="Họ và Tên (như trên giấy tờ)"
            value={fullName}
            onChangeText={(t) => { setFullName(t); setErrors({...errors, fullName: ''}) }}
            error={errors.fullName}
          />
          <Input 
            placeholder="Số CMND/CCCD"
            keyboardType="numeric"
            value={idNumber}
            onChangeText={(t) => { setIdNumber(t); setErrors({...errors, idNumber: ''}) }}
            error={errors.idNumber}
            style={{marginTop: 12}}
          />
          <View style={{flexDirection: 'row', marginTop: 12, gap: 12}}>
            <View style={{flex: 1}}>
              <Input 
                placeholder="Ngày sinh (YYYY-MM-DD)"
                value={dob}
                onChangeText={(t) => { setDob(t); setErrors({...errors, dob: ''}) }}
                error={errors.dob}
              />
            </View>
            <View style={{flex: 1}}>
              <Input 
                placeholder="Ngày cấp (YYYY-MM-DD)"
                value={issueDate}
                onChangeText={(t) => { setIssueDate(t); setErrors({...errors, issueDate: ''}) }}
                error={errors.issueDate}
              />
            </View>
          </View>

          <View style={styles.uploadArea}>
            <View style={styles.uploadButtonsRow}>
              <TouchableOpacity style={styles.uploadBtnCircle} onPress={() => pickImage(setFrontImage)}>
                <Camera size={20} color={theme.colors.primary.navy} />
                <Text style={styles.uploadBtnText}>Mặt trước</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.uploadBtnCircle} onPress={() => pickImage(setBackImage)}>
                <Upload size={20} color={theme.colors.primary.navy} />
                <Text style={styles.uploadBtnText}>Mặt sau</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.uploadBtnCircle} onPress={() => pickImage(setFaceImage)}>
                <Camera size={20} color={theme.colors.primary.navy} />
                <Text style={styles.uploadBtnText}>Chân dung</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.uploadNote}>Chụp hoặc tải ảnh CMND/CCCD & Selfie</Text>
            <Text style={styles.uploadSubNote}>Hỗ trợ định dạng JPG, PNG (tối đa 5MB)</Text>
          </View>

          <View style={styles.fileList}>
            <FileItem title="Mặt trước CCCD" image={frontImage} onRemove={() => setFrontImage(null)} />
            <FileItem title="Mặt sau CCCD" image={backImage} onRemove={() => setBackImage(null)} />
            <FileItem title="Ảnh chân dung" image={faceImage} onRemove={() => setFaceImage(null)} />
          </View>

          <View style={styles.securityBanner}>
            <Shield size={16} color="#B45309" />
            <Text style={styles.securityBannerText}>Tài liệu được bảo mật và mã hóa theo tiêu chuẩn an toàn ISO 27001.</Text>
          </View>
        </View>

        {/* Checkbox */}
        <TouchableOpacity style={styles.checkboxRow} onPress={() => setAgreed(!agreed)} activeOpacity={0.8}>
          <View style={[styles.checkbox, agreed && styles.checkboxActive]}>
            {agreed && <Check size={14} color="white" />}
          </View>
          <Text style={styles.checkboxText}>
            Tôi xác nhận thông tin cung cấp là chính xác và đồng ý với <Text style={styles.checkboxBold}>Điều khoản đối tác PetCare</Text> cùng chính sách an toàn chăm sóc thú cưng.
          </Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Sticky Bottom */}
      <View style={styles.bottomBar}>
        <Button 
          label="Gửi yêu cầu xét duyệt" 
          onPress={handleSubmit} 
          rightIcon="arrow-right"
          style={styles.submitBtn}
          labelStyle={styles.submitBtnText}
          isLoading={loading}
        />
        <Text style={styles.bottomSubText}>🕒 Phản hồi kết quả thẩm định trong 12-24h</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: theme.spacing[4],
    paddingBottom: 130,
  },
  progressCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.border.subdued,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressStep: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  stepNum: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  apiModeTag: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  apiModeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#B45309',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    marginBottom: 12,
  },
  progressBarFill: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 3,
  },
  progressDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border.subdued,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sectionIconBox: {
    marginTop: 2,
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 0.5,
  },
  sectionDesc: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  serviceBox: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: theme.colors.border.subdued,
    borderRadius: 16,
    padding: 16,
    position: 'relative',
  },
  serviceBoxActive: {
    borderColor: '#F59E0B',
    backgroundColor: '#FFFBEB',
  },
  checkIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border.subdued,
  },
  serviceBoxTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  serviceBoxSub: {
    fontSize: 11,
    color: '#64748B',
  },
  mapWrap: {
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border.subdued,
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapOverlayLabel: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    ...theme.shadows.sm,
  },
  mapOverlayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
  },
  uploadArea: {
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: '#F8FAFC',
  },
  uploadButtonsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  uploadBtnCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadBtnText: {
    fontSize: 10,
    color: theme.colors.primary.navy,
    fontWeight: '600',
    marginTop: 4,
    position: 'absolute',
    bottom: -16,
  },
  uploadNote: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 12,
  },
  uploadSubNote: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
  },
  fileList: {
    marginTop: 16,
    gap: 8,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
  },
  fileIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#E2E8F0',
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  fileStatus: {
    fontSize: 11,
    color: theme.colors.semantic.success,
  },
  removeBtn: {
    padding: 8,
  },
  securityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  securityBannerText: {
    flex: 1,
    fontSize: 11,
    color: '#92400E',
    lineHeight: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    marginRight: 12,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  checkboxText: {
    flex: 1,
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
  },
  checkboxBold: {
    fontWeight: '700',
    color: '#0F172A',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: theme.spacing[4],
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.subdued,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  submitBtn: {
    backgroundColor: '#FBBF24',
    borderRadius: 16,
    height: 56,
  },
  submitBtnText: {
    color: '#0F172A',
    fontWeight: '700',
  },
  bottomSubText: {
    textAlign: 'center',
    fontSize: 11,
    color: '#64748B',
    marginTop: 12,
  }
});
