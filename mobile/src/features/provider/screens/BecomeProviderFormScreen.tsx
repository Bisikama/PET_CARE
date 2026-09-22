import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Image, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import MapView, { Marker, Region } from 'react-native-maps';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Upload, CheckCircle2, MapPin, Check, Briefcase, Trash2, Shield, ArrowRight, Lock, Clock, FileText, Hourglass, Phone, Mail, Home, RefreshCw } from 'lucide-react-native';

import { Screen } from '../../../core/components/Screen';
import { ScreenHeader } from '../../../core/components/ScreenHeader';
import { Input } from '../../../core/components/Input';
import { useAuth } from '../../auth/context/AuthContext';
import { Button } from '../../../core/components/Button';
import { theme } from '../../../core/theme';
import { providerApi } from '../api/providerApi';
import { useProviderStore } from '../store/useProviderStore';
import DateTimePicker from '@react-native-community/datetimepicker';

const DEFAULT_REGION: Region = {
  latitude: 10.762622,
  longitude: 106.660172,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function BecomeProviderFormScreen() {
  const router = useRouter();
  const { profile, fetchProfile } = useProviderStore();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // -- Step 1: KYC --
  const [idNumber, setIdNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [showIssuePicker, setShowIssuePicker] = useState(false);
  const [frontImage, setFrontImage] = useState<any>(null);
  const [backImage, setBackImage] = useState<any>(null);
  const [faceImage, setFaceImage] = useState<any>(null);

  // -- Step 2: Documents --
  const [documents, setDocuments] = useState<any[]>([]);

  // -- Step 3: Base Address --
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [coordinate, setCoordinate] = useState({ latitude: DEFAULT_REGION.latitude, longitude: DEFAULT_REGION.longitude });
  const [baseAddressLine, setBaseAddressLine] = useState('');
  const [baseCity, setBaseCity] = useState('');
  const [radiusKm, setRadiusKm] = useState('5');

  // -- Step 4: Areas --
  const [areaName, setAreaName] = useState('');
  const [areaRadius, setAreaRadius] = useState('5');

  // -- Step 5: Capabilities --
  const [serviceId, setServiceId] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [maxPets, setMaxPets] = useState('1');

  // Setup current step based on Profile status
  useEffect(() => {
    if (profile) {
      if (profile.status === 'APPROVED') {
        router.replace('/(provider)');
      } else if (profile.kycStatus === 'PENDING') {
        setCurrentStep(3); // Wait at step 3 or show a pending screen
      } else if (profile.kycStatus === 'APPROVED') {
        setCurrentStep(4);
      }
    }
  }, [profile]);

  const pickImage = async (setImage: (img: any) => void) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
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

  const addDocument = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.7,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setDocuments(prev => [...prev, result.assets[0]]);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể mở thư viện ảnh');
    }
  };

  const removeDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleStep1Submit = async () => {
    const missing = [];
    if (!fullName) missing.push('Họ tên');
    if (!idNumber) missing.push('Số CMND/CCCD');
    if (!dob) missing.push('Ngày sinh');
    if (!issueDate) missing.push('Ngày cấp');
    if (!frontImage) missing.push('Mặt trước CMND');
    if (!backImage) missing.push('Mặt sau CMND');
    if (!faceImage) missing.push('Ảnh chân dung');

    if (missing.length > 0) {
      Alert.alert('Lỗi', `Vui lòng điền đủ thông tin và hình ảnh.\nCòn thiếu: ${missing.join(', ')}`);
      return;
    }
    setLoading(true);
    try {
      const frontFile = { uri: frontImage.uri, type: 'image/jpeg', name: `front.jpg` };
      const backFile = { uri: backImage.uri, type: 'image/jpeg', name: `back.jpg` };
      const faceFile = { uri: faceImage.uri, type: 'image/jpeg', name: `face.jpg` };
      
      await providerApi.uploadKyc(
        { idNumber, fullName, dob, issueDate },
        frontFile, backFile, faceFile
      );
      setCurrentStep(2);
    } catch (e: any) {
      Alert.alert('Lỗi', e.message || 'Lỗi gửi KYC');
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async () => {
    if (documents.length === 0) {
      Alert.alert('Lỗi', 'Vui lòng tải lên ít nhất 1 chứng chỉ.');
      return;
    }
    setLoading(true);
    try {
      const formattedDocs = documents.map((doc, idx) => ({
        uri: doc.uri,
        type: 'image/jpeg',
        name: `doc_${idx}.jpg`
      }));
      await providerApi.uploadDocuments({ certificateImages: formattedDocs });
      setCurrentStep(3);
    } catch (e: any) {
      Alert.alert('Lỗi', e.message || 'Lỗi gửi chứng chỉ');
    } finally {
      setLoading(false);
    }
  };

  const handleStep3Submit = async () => {
    if (!baseAddressLine || !baseCity || !radiusKm) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ địa chỉ.');
      return;
    }
    setLoading(true);
    try {
      await providerApi.updateBaseAddress({
        baseAddressLine,
        baseCity,
        baseLatitude: coordinate.latitude,
        baseLongitude: coordinate.longitude,
        serviceRadiusKm: Number(radiusKm),
      });
      // Fetch latest profile to update kycStatus in store
      await fetchProfile();
      // It will either stay at Step 3 showing Pending or move to 4 if approved instantly
    } catch (e: any) {
      Alert.alert('Lỗi', e.message || 'Lỗi cập nhật địa chỉ');
    } finally {
      setLoading(false);
    }
  };

  const handleStep4Submit = async () => {
    if (!areaName || !areaRadius) {
      Alert.alert('Lỗi', 'Vui lòng điền đủ thông tin khu vực.');
      return;
    }
    setLoading(true);
    try {
      await providerApi.addServiceArea({
        name: areaName,
        radiusKm: Number(areaRadius),
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
      });
      setCurrentStep(5);
    } catch (e: any) {
      Alert.alert('Lỗi', e.message || 'Lỗi đăng ký khu vực');
    } finally {
      setLoading(false);
    }
  };

  const handleStep5Submit = async () => {
    if (!serviceId || !basePrice || !maxPets) {
      Alert.alert('Lỗi', 'Vui lòng điền đủ thông tin gói dịch vụ.');
      return;
    }
    setLoading(true);
    try {
      await providerApi.registerCapability({
        serviceId,
        basePrice: Number(basePrice),
        maxPets: Number(maxPets),
        isAvailable: true,
      });
      // Hoàn tất, chuyển về Intro hoặc check lại Profile
      await fetchProfile();
      router.replace('/(customer)/become-provider');
    } catch (e: any) {
      Alert.alert('Lỗi', e.message || 'Lỗi đăng ký dịch vụ');
    } finally {
      setLoading(false);
    }
  };

  const FileItem = ({ title, image, onRemove }: { title: string, image: any, onRemove: () => void }) => {
    if (!image) return null;
    return (
      <View style={styles.fileItem}>
        <Image source={{ uri: image.uri }} style={styles.fileIcon} />
        <View style={styles.fileInfo}>
          <Text style={styles.fileName}>{title}</Text>
        </View>
        <TouchableOpacity onPress={onRemove} style={styles.removeBtn}>
          <Trash2 size={18} color={theme.colors.semantic.error} />
        </TouchableOpacity>
      </View>
    );
  };

  // ---------------- Render Steps ----------------

  const renderStep1 = () => (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>BƯỚC 1: XÁC THỰC KYC</Text>
      <Input placeholder="Họ và Tên (như trên giấy tờ)" value={fullName} onChangeText={setFullName} />
      <Input placeholder="Số CMND/CCCD" keyboardType="numeric" value={idNumber} onChangeText={setIdNumber} style={{marginTop: 12}} />
      <View style={{flexDirection: 'row', marginTop: 12, gap: 12}}>
        <TouchableOpacity style={{flex: 1}} onPress={() => setShowDobPicker(true)}>
          <View pointerEvents="none">
            <Input placeholder="Ngày sinh (YYYY-MM-DD)" value={dob} editable={false} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={{flex: 1}} onPress={() => setShowIssuePicker(true)}>
          <View pointerEvents="none">
            <Input placeholder="Ngày cấp (YYYY-MM-DD)" value={issueDate} editable={false} />
          </View>
        </TouchableOpacity>
      </View>
      
      {showDobPicker && (
        <DateTimePicker
          value={dob ? new Date(dob) : new Date()}
          mode="date"
          display="default"
          maximumDate={new Date()}
          onChange={(event, date) => {
            if (event.type === 'dismissed') {
              setShowDobPicker(false);
              return;
            }
            setShowDobPicker(false);
            if (date) {
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const day = String(date.getDate()).padStart(2, '0');
              setDob(`${year}-${month}-${day}`);
            }
          }}
        />
      )}

      {showIssuePicker && (
        <DateTimePicker
          value={issueDate ? new Date(issueDate) : new Date()}
          mode="date"
          display="default"
          maximumDate={new Date()}
          onChange={(event, date) => {
            if (event.type === 'dismissed') {
              setShowIssuePicker(false);
              return;
            }
            setShowIssuePicker(false);
            if (date) {
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const day = String(date.getDate()).padStart(2, '0');
              setIssueDate(`${year}-${month}-${day}`);
            }
          }}
        />
      )}
      
      <View style={styles.uploadButtonsRow}>
        <TouchableOpacity style={styles.uploadBtnCircle} onPress={() => pickImage(setFrontImage)}>
          <Camera size={20} color={theme.colors.primary.navy} />
          <Text style={styles.uploadBtnText}>Mặt trước</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.uploadBtnCircle} onPress={() => pickImage(setBackImage)}>
          <Camera size={20} color={theme.colors.primary.navy} />
          <Text style={styles.uploadBtnText}>Mặt sau</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.uploadBtnCircle} onPress={() => pickImage(setFaceImage)}>
          <Camera size={20} color={theme.colors.primary.navy} />
          <Text style={styles.uploadBtnText}>Chân dung</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.fileList}>
        <FileItem title="Mặt trước CCCD" image={frontImage} onRemove={() => setFrontImage(null)} />
        <FileItem title="Mặt sau CCCD" image={backImage} onRemove={() => setBackImage(null)} />
        <FileItem title="Ảnh chân dung" image={faceImage} onRemove={() => setFaceImage(null)} />
      </View>
      <Button label="Tiếp tục" onPress={handleStep1Submit} isLoading={loading} style={{marginTop: 20}} />
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>BƯỚC 2: CHỨNG CHỈ NGHỀ NGHIỆP</Text>
      <TouchableOpacity style={styles.uploadArea} onPress={addDocument}>
        <Upload size={24} color={theme.colors.primary.navy} />
        <Text style={styles.uploadNote}>Tải lên Bằng cấp / Chứng chỉ</Text>
      </TouchableOpacity>
      <View style={styles.fileList}>
        {documents.map((doc, idx) => (
          <FileItem key={idx} title={`Chứng chỉ ${idx + 1}`} image={doc} onRemove={() => removeDocument(idx)} />
        ))}
      </View>
      <Button label="Tiếp tục" onPress={handleStep2Submit} isLoading={loading} style={{marginTop: 20}} />
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>BƯỚC 3: ĐỊA CHỈ CƠ SỞ</Text>
      
      <Text style={[styles.inputLabel, {marginBottom: 8, fontSize: 13, color: '#475569', fontWeight: '400'}]}>
        Địa chỉ cơ sở là nơi đặt cửa hàng/nhà riêng của bạn. Vị trí ghim và Bán kính sẽ được dùng để tìm kiếm khách hàng quanh bạn.
      </Text>

      <Text style={styles.inputLabel}>1. Ghim vị trí trên bản đồ</Text>
      <Text style={{fontSize: 12, color: '#64748B', marginBottom: 8}}>Chạm vào bản đồ để chọn tọa độ chính xác</Text>
      <View style={styles.mapWrap}>
        <MapView style={styles.map} initialRegion={region} onPress={(e) => setCoordinate(e.nativeEvent.coordinate)}>
          <Marker coordinate={coordinate} />
        </MapView>
      </View>
      
      <Text style={[styles.inputLabel, {marginTop: 16}]}>2. Thông tin địa chỉ</Text>
      <Input placeholder="Số nhà, Tên đường, Phường/Xã" value={baseAddressLine} onChangeText={setBaseAddressLine} />
      
      <View style={{flexDirection: 'row', marginTop: 12, gap: 12}}>
        <Input placeholder="Tỉnh/Thành phố" value={baseCity} onChangeText={setBaseCity} style={{flex: 1}} />
        <Input placeholder="Bán kính hỗ trợ (km)" keyboardType="numeric" value={radiusKm} onChangeText={setRadiusKm} style={{flex: 1}} />
      </View>
      <Button label="Tiếp tục" onPress={handleStep3Submit} isLoading={loading} style={{marginTop: 20}} />
    </View>
  );

  const renderPending = () => {
    // Generate a mock reference ID from profile ID or fallback
    const refId = profile?.id ? `#PWC-${profile.id.substring(0, 5).toUpperCase()}` : '#PWC-89214';
    const storeName = fullName || user?.full_name || profile?.id || 'Tên cửa hàng chưa cập nhật';
    
    // Format date from profile or fallback
    const d = profile?.createdAt ? new Date(profile.createdAt) : new Date();
    const dateStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth()+1).padStart(2, '0')}/${d.getFullYear()} • ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

    const getProviderTypeName = (type?: ProviderType) => {
      switch (type) {
        case ProviderType.SITTER: return 'Chăm sóc thú cưng';
        case ProviderType.GROOMER: return 'Spa & Cắt tỉa';
        case ProviderType.VET: return 'Bác sĩ thú y';
        default: return 'Chưa cập nhật';
      }
    };
    
    return (
      <View style={styles.pendingContainer}>
        {/* Header Icon */}
        <View style={styles.pendingIconWrap}>
          <View style={styles.pendingIconBg}>
            <Shield size={40} color="#FBBF24" />
          </View>
          <View style={styles.pendingIconBadge}>
            <Clock size={16} color="#FFFFFF" />
          </View>
        </View>

        <Text style={styles.pendingTitleYellow}>ĐANG XÉT DUYỆT HỒ SƠ</Text>
        <Text style={styles.pendingTitleMain}>Hồ sơ của bạn đang được xét duyệt</Text>
        
        <Text style={styles.pendingDesc}>
          PawCare đã tiếp nhận hồ sơ đăng ký đối tác của bạn. Đội ngũ thẩm định sẽ kiểm tra chứng từ và liên hệ lại với bạn qua số điện thoại <Text style={{fontWeight: '700', color: '#0F172A'}}>1900 6868</Text> trong vòng <Text style={{fontWeight: '700', color: '#0F172A'}}>24 - 48 giờ</Text> làm việc.
        </Text>

        {/* Info Card */}
        <View style={styles.pendingCard}>
          <View style={styles.pendingCardHeader}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
              <FileText size={20} color="#0F172A" />
              <Text style={styles.pendingCardTitle}>Thông tin hồ sơ</Text>
            </View>
            <View style={styles.pendingStatusBadge}>
              <View style={styles.pendingStatusDot} />
              <Text style={styles.pendingStatusText}>Chờ xét duyệt</Text>
            </View>
          </View>
          
          <View style={styles.pendingRow}>
            <Text style={styles.pendingLabel}>Mã hồ sơ</Text>
            <Text style={styles.pendingValueBadge}>{refId}</Text>
          </View>
          <View style={styles.pendingRow}>
            <Text style={styles.pendingLabel}>Tên cửa hàng</Text>
            <Text style={[styles.pendingValue, {fontWeight: '700'}]}>{storeName}</Text>
          </View>
          <View style={styles.pendingRow}>
            <Text style={styles.pendingLabel}>Lĩnh vực đăng ký</Text>
            <View style={styles.pendingTagsWrap}>
              <View style={styles.pendingTag}><Text style={styles.pendingTagText}>{getProviderTypeName(profile?.providerType)}</Text></View>
            </View>
          </View>
          <View style={styles.pendingRow}>
            <Text style={styles.pendingLabel}>Thời gian gửi</Text>
            <Text style={[styles.pendingValue, {fontWeight: '600'}]}>{dateStr}</Text>
          </View>
        </View>

        {/* Timeline Card */}
        <View style={styles.pendingCard}>
          <View style={[styles.pendingCardHeader, {borderBottomWidth: 0, paddingBottom: 0}]}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
              <Hourglass size={20} color="#0F172A" />
              <Text style={styles.pendingCardTitle}>Tiến trình thẩm định</Text>
            </View>
          </View>

          <View style={styles.timelineWrap}>
            {/* Step 1 */}
            <View style={styles.timelineItem}>
              <View style={styles.timelineIconSuccess}>
                <Check size={16} color="#10B981" />
              </View>
              <View style={styles.timelineLine} />
              <View style={styles.timelineContent}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                  <Text style={styles.timelineTitle}>Gửi hồ sơ thành công</Text>
                  <Text style={styles.timelineDate}>{String(d.getDate()).padStart(2, '0')}/{String(d.getMonth()+1).padStart(2, '0')}</Text>
                </View>
                <Text style={styles.timelineDesc}>Thông tin và tài liệu pháp lý đã tải lên hệ thống.</Text>
              </View>
            </View>

            {/* Step 2 */}
            <View style={styles.timelineItem}>
              <View style={styles.timelineIconPending}>
                <Hourglass size={16} color="#D97706" />
              </View>
              <View style={styles.timelineLine} />
              <View style={styles.timelineContent}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                  <Text style={[styles.timelineTitle, {color: '#0F172A'}]}>PawCare thẩm định chứng từ</Text>
                  <Text style={styles.timelineDatePending}>Đang xử lý...</Text>
                </View>
                <Text style={styles.timelineDesc}>Xác minh giấy phép kinh doanh, cơ sở vật chất và tay nghề.</Text>
              </View>
            </View>

            {/* Step 3 */}
            <View style={styles.timelineItem}>
              <View style={styles.timelineIconMuted}>
                <View style={styles.timelineDotMuted} />
              </View>
              <View style={styles.timelineContent}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                  <Text style={styles.timelineTitleMuted}>Ký hợp đồng & Kích hoạt</Text>
                  <Text style={styles.timelineDateMuted}>Bước 3</Text>
                </View>
                <Text style={styles.timelineDescMuted}>Ký số trực tuyến và bắt đầu nhận lịch hẹn trên ứng dụng.</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Support Card */}
        <View style={styles.pendingCard}>
          <View style={[styles.pendingCardHeader, {borderBottomWidth: 0, paddingBottom: 12}]}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
              <Shield size={20} color="#0F172A" />
              <Text style={styles.pendingCardTitle}>Bạn cần hỗ trợ thêm?</Text>
            </View>
          </View>
          
          <View style={{flexDirection: 'row', gap: 12}}>
            <View style={styles.supportBox}>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8}}>
                <Phone size={14} color="#64748B" />
                <Text style={styles.supportLabel}>HOTLINE ĐỐI TÁC</Text>
              </View>
              <Text style={styles.supportValue}>1900 6868</Text>
              <Text style={styles.supportSub}>Ưu tiên 24/7</Text>
            </View>
            <View style={styles.supportBox}>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8}}>
                <Mail size={14} color="#64748B" />
                <Text style={styles.supportLabel}>EMAIL TIẾP NHẬN</Text>
              </View>
              <Text style={[styles.supportValue, {fontSize: 14}]}>partner@pawcare.vn</Text>
              <Text style={styles.supportSub}>Phản hồi {'<'} 2h</Text>
            </View>
          </View>
        </View>

        {/* Buttons */}
        <TouchableOpacity style={styles.btnHome} onPress={() => router.replace('/(customer)/(tabs)/home')}>
          <Home size={20} color="#0F172A" />
          <Text style={styles.btnHomeText}>Quay lại trang chủ</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnUpdate} onPress={fetchProfile}>
          <RefreshCw size={18} color="#64748B" />
          <Text style={styles.btnUpdateText}>Làm mới trạng thái hồ sơ</Text>
        </TouchableOpacity>

      </View>
    );
  };

  const renderStep4 = () => (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>BƯỚC 4: ĐĂNG KÝ KHU VỰC</Text>
      <Text style={{color: theme.colors.semantic.success, marginBottom: 16, fontWeight: '700'}}>
        🎉 Chúc mừng! Hồ sơ KYC của bạn đã được duyệt.
      </Text>
      <Input placeholder="Tên khu vực (VD: Quận 1)" value={areaName} onChangeText={setAreaName} />
      <Input placeholder="Bán kính phục vụ (km)" keyboardType="numeric" value={areaRadius} onChangeText={setAreaRadius} style={{marginTop: 12}} />
      <Button label="Tiếp tục" onPress={handleStep4Submit} isLoading={loading} style={{marginTop: 20}} />
    </View>
  );

  const renderStep5 = () => (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>BƯỚC 5: GÓI DỊCH VỤ</Text>
      <Input placeholder="ID Dịch vụ (VD: GROOMING_01)" value={serviceId} onChangeText={setServiceId} />
      <Input placeholder="Giá cơ bản (VNĐ)" keyboardType="numeric" value={basePrice} onChangeText={setBasePrice} style={{marginTop: 12}} />
      <Input placeholder="Số thú cưng tối đa" keyboardType="numeric" value={maxPets} onChangeText={setMaxPets} style={{marginTop: 12}} />
      <Button label="Hoàn tất Đăng ký" onPress={handleStep5Submit} isLoading={loading} style={{marginTop: 20}} />
    </View>
  );

  return (
    <Screen style={styles.container}>
      <ScreenHeader title="Đăng ký Đối tác" onLeftPress={() => router.back()} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {profile?.kycStatus === 'PENDING' ? (
          renderPending()
        ) : (
          <>
            {/* Progress Indicators */}
            <View style={styles.stepperHeader}>
              {[1,2,3,4,5].map((step) => (
                <View key={step} style={[styles.stepDot, currentStep >= step ? styles.stepDotActive : null]}>
                  <Text style={[styles.stepText, currentStep >= step ? styles.stepTextActive : null]}>{step}</Text>
                </View>
              ))}
            </View>

            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
            {currentStep === 5 && renderStep5()}
          </>
        )}

      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#F8FAFC' },
  scrollContent: { padding: 16, paddingBottom: 100 },
  stepperHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, paddingHorizontal: 20 },
  stepDot: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },
  stepDotActive: { backgroundColor: '#1E293B' },
  stepText: { fontSize: 12, fontWeight: '700', color: '#94A3B8' },
  stepTextActive: { color: 'white' },
  card: { backgroundColor: 'white', borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: theme.colors.border.subdued },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 16 },
  uploadButtonsRow: { flexDirection: 'row', gap: 16, marginTop: 16, justifyContent: 'space-around' },
  uploadBtnCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#E0E7FF', alignItems: 'center', justifyContent: 'center' },
  uploadBtnText: { fontSize: 10, color: theme.colors.primary.navy, fontWeight: '600', marginTop: 4, position: 'absolute', bottom: -16 },
  uploadArea: { borderWidth: 2, borderColor: '#E2E8F0', borderStyle: 'dashed', borderRadius: 16, padding: 24, alignItems: 'center', backgroundColor: '#F8FAFC' },
  uploadNote: { fontSize: 13, fontWeight: '700', color: '#0F172A', marginTop: 12 },
  fileList: { marginTop: 24, gap: 8 },
  fileItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 12 },
  fileIcon: { width: 36, height: 36, borderRadius: 8, marginRight: 12, backgroundColor: '#E2E8F0' },
  fileInfo: { flex: 1 },
  fileName: { fontSize: 13, fontWeight: '600', color: '#0F172A' },
  removeBtn: { padding: 8 },
  mapWrap: { height: 160, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: theme.colors.border.subdued },
  map: { width: '100%', height: '100%' },

  // --- Pending UI Styles ---
  pendingContainer: {
    paddingVertical: 10,
  },
  pendingIconWrap: {
    alignSelf: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  pendingIconBg: {
    width: 80,
    height: 80,
    backgroundColor: '#0F172A',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingIconBadge: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    backgroundColor: '#FBBF24',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#F8FAFC',
  },
  pendingTitleYellow: {
    textAlign: 'center',
    color: '#D97706',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8,
  },
  pendingTitleMain: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 16,
    lineHeight: 30,
    paddingHorizontal: 20,
  },
  pendingDesc: {
    textAlign: 'center',
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    marginBottom: 24,
  },
  pendingCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  pendingCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 16,
    marginBottom: 16,
  },
  pendingCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  pendingStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  pendingStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D97706',
  },
  pendingStatusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
  },
  pendingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  pendingLabel: {
    fontSize: 14,
    color: '#64748B',
    flex: 1,
  },
  pendingValue: {
    fontSize: 14,
    color: '#0F172A',
    flex: 1.5,
    textAlign: 'right',
  },
  pendingValueBadge: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
  },
  pendingTagsWrap: {
    flex: 1.5,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 6,
  },
  pendingTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  pendingTagText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
  },
  timelineWrap: {
    marginTop: 16,
    paddingLeft: 4,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 24,
    position: 'relative',
  },
  timelineIconSuccess: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  timelineIconPending: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  timelineIconMuted: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  timelineDotMuted: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#94A3B8',
  },
  timelineLine: {
    position: 'absolute',
    left: 11,
    top: 24,
    bottom: -24,
    width: 2,
    backgroundColor: '#E2E8F0',
    zIndex: 1,
  },
  timelineContent: {
    flex: 1,
    marginLeft: 16,
    top: 2,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  timelineDate: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  timelineDatePending: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
  },
  timelineDesc: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 20,
  },
  timelineTitleMuted: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
  },
  timelineDateMuted: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  timelineDescMuted: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
    lineHeight: 20,
  },
  supportBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
  },
  supportLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  supportValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  supportSub: {
    fontSize: 12,
    color: '#94A3B8',
  },
  btnHome: {
    backgroundColor: '#FBBF24',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 8,
    gap: 8,
  },
  btnHomeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  btnUpdate: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
    marginTop: 8,
  },
  btnUpdateText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  }
});
