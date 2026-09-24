import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import {
  ArrowLeft,
  Camera,
  Dog,
  Cat,
  Check,
} from 'lucide-react-native';
import { Screen } from '@/core/components/Screen';
import { theme } from '@/core/theme';
import { petApi } from '../api/petApi';

const popularDogBreeds = [
  'Poodle',
  'Golden Retriever',
  'Corgi',
  'Pomeranian',
  'Husky',
  'Chihuahua',
  'Phốc sóc',
  'Chó cỏ / Ta',
];

const popularCatBreeds = [
  'Mèo Anh lông ngắn',
  'Mèo Anh lông dài',
  'Mèo Ba Tư',
  'Mèo Xiêm',
  'Mèo Munchkin',
  'Mèo Ragdoll',
  'Mèo Mướp / Ta',
];

export default function PetEditScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Form State
  const [name, setName] = useState('');
  const [species, setSpecies] = useState<'Dog' | 'Cat'>('Dog');
  const [breed, setBreed] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [healthNote, setHealthNote] = useState('');
  const [behaviorNote, setBehaviorNote] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<any>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPetDetail();
    }
  }, [id]);

  const fetchPetDetail = async () => {
    try {
      const res = await petApi.getPet(id!);
      if (res.success && res.data) {
        const p = res.data;
        setName(p.name || '');
        setSpecies((p.species as 'Dog' | 'Cat') || 'Dog');
        setBreed(p.breed || '');
        setGender((p.gender as 'Male' | 'Female') || 'Male');
        setAge(p.age !== undefined && p.age !== null ? p.age.toString() : '');
        setWeight(p.weight !== undefined && p.weight !== null ? p.weight.toString() : '');
        setHealthNote(p.healthNote || p.health_note || '');
        setBehaviorNote(p.behaviorNote || p.behavior_note || '');
        setAvatarUri(p.avatarUrl || p.avatar_url || null);
      } else {
        Alert.alert('Lỗi', 'Không thể tải thông tin thú cưng');
        router.back();
      }
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể tải thông tin thú cưng');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handlePickAvatar = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Quyền truy cập',
          'Vui lòng cấp quyền truy cập thư viện ảnh để tải lên avatar cho bé cưng.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setAvatarUri(asset.uri);
        setAvatarFile({
          uri: asset.uri,
          mimeType: asset.mimeType || 'image/jpeg',
          fileName: asset.fileName || `pet-${Date.now()}.jpg`,
        });
      }
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể mở thư viện ảnh.');
    }
  };

  const handleSavePet = async () => {
    if (!name.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên cho bé cưng của bạn.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await petApi.updatePet(id!, {
        name: name.trim(),
        species,
        breed: breed.trim() || undefined,
        gender,
        age: age ? parseInt(age, 10) : undefined,
        weight: weight ? parseFloat(weight) : undefined,
        healthNote: healthNote.trim() || undefined,
        behaviorNote: behaviorNote.trim() || undefined,
        avatar: avatarFile || undefined,
      });

      if (res.success) {
        Alert.alert(
          'Thành công! 🎉',
          `Đã cập nhật thông tin cho bé ${name.trim()}.`,
          [
            {
              text: 'OK',
              onPress: () => {
                router.back();
              },
            },
          ]
        );
      } else {
        Alert.alert('Lỗi', res.message || 'Không thể cập nhật hồ sơ thú cưng.');
      }
    } catch (error: any) {
      Alert.alert('Lỗi', error?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.screen, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary.navy} />
      </View>
    );
  }

  const availableBreeds = species === 'Dog' ? popularDogBreeds : popularCatBreeds;

  return (
    <Screen
      withPadding={false}
      backgroundColor={theme.colors.background.default}
      edges={['top', 'left', 'right']}
      style={styles.screen}
    >
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background.default} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sửa Hồ Sơ Thú Cưng</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 1. Avatar Picker Section */}
          <View style={styles.avatarPickerSection}>
            <TouchableOpacity
              style={styles.avatarWrapper}
              onPress={handlePickAvatar}
              activeOpacity={0.8}
            >
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  {species === 'Dog' ? (
                    <Dog size={44} color={theme.colors.text.muted} />
                  ) : (
                    <Cat size={44} color={theme.colors.text.muted} />
                  )}
                </View>
              )}
              <View style={styles.cameraBadge}>
                <Camera size={14} color="white" />
              </View>
            </TouchableOpacity>
            <Text style={styles.avatarHint}>Chạm để đổi ảnh đại diện</Text>
          </View>

          {/* 2. Species Selector (Dog / Cat) */}
          <View style={styles.formGroup}>
            <Text style={styles.fieldLabel}>LOÀI THÚ CƯNG *</Text>
            <View style={styles.speciesRow}>
              <TouchableOpacity
                style={[
                  styles.speciesCard,
                  species === 'Dog' && styles.speciesCardSelected,
                ]}
                onPress={() => {
                  setSpecies('Dog');
                  setBreed('');
                }}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.speciesIconWrap,
                    species === 'Dog' && styles.speciesIconWrapSelected,
                  ]}
                >
                  <Dog
                    size={24}
                    color={species === 'Dog' ? 'white' : theme.colors.primary.navy}
                  />
                </View>
                <Text
                  style={[
                    styles.speciesLabel,
                    species === 'Dog' && styles.speciesLabelSelected,
                  ]}
                >
                  Chó cưng 🐶
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.speciesCard,
                  species === 'Cat' && styles.speciesCardSelected,
                ]}
                onPress={() => {
                  setSpecies('Cat');
                  setBreed('');
                }}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.speciesIconWrap,
                    species === 'Cat' && styles.speciesIconWrapSelected,
                  ]}
                >
                  <Cat
                    size={24}
                    color={species === 'Cat' ? 'white' : theme.colors.primary.navy}
                  />
                </View>
                <Text
                  style={[
                    styles.speciesLabel,
                    species === 'Cat' && styles.speciesLabelSelected,
                  ]}
                >
                  Mèo cưng 🐱
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 3. Pet Name Input */}
          <View style={styles.formGroup}>
            <Text style={styles.fieldLabel}>TÊN BÉ CƯNG *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="VD: Milo, Bông, Lu, Miu..."
              placeholderTextColor={theme.colors.text.muted}
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* 4. Breed with Quick Tags */}
          <View style={styles.formGroup}>
            <Text style={styles.fieldLabel}>GIỐNG LOÀI</Text>
            <TextInput
              style={styles.textInput}
              placeholder={`VD: ${species === 'Dog' ? 'Poodle, Corgi, Golden...' : 'Mèo Anh, Ba Tư...'}`}
              placeholderTextColor={theme.colors.text.muted}
              value={breed}
              onChangeText={setBreed}
            />

            {/* Quick Suggestions */}
            <View style={styles.quickTagsWrap}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickTagsScroll}>
                {availableBreeds.map((b) => (
                  <TouchableOpacity
                    key={b}
                    style={[styles.quickTag, breed === b && styles.quickTagActive]}
                    onPress={() => setBreed(b)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.quickTagText, breed === b && styles.quickTagTextActive]}>
                      {b}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          {/* 5. Gender Selector */}
          <View style={styles.formGroup}>
            <Text style={styles.fieldLabel}>GIỚI TÍNH</Text>
            <View style={styles.genderRow}>
              <TouchableOpacity
                style={[
                  styles.genderBtn,
                  gender === 'Male' && styles.genderBtnSelected,
                ]}
                onPress={() => setGender('Male')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.genderBtnText,
                    gender === 'Male' && styles.genderBtnTextSelected,
                  ]}
                >
                  ♂ Đực (Male)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.genderBtn,
                  gender === 'Female' && styles.genderBtnSelected,
                ]}
                onPress={() => setGender('Female')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.genderBtnText,
                    gender === 'Female' && styles.genderBtnTextSelected,
                  ]}
                >
                  ♀ Cái (Female)
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 6. Age & Weight Row */}
          <View style={styles.rowTwoCols}>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.fieldLabel}>TUỔI (NĂM)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="VD: 2"
                placeholderTextColor={theme.colors.text.muted}
                keyboardType="numeric"
                value={age}
                onChangeText={setAge}
              />
            </View>

            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.fieldLabel}>CÂN NẶNG (KG) *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="VD: 5.5"
                placeholderTextColor={theme.colors.text.muted}
                keyboardType="decimal-pad"
                value={weight}
                onChangeText={setWeight}
              />
            </View>
          </View>

          {/* 7. Health & Allergy Notes */}
          <View style={styles.formGroup}>
            <Text style={styles.fieldLabel}>GHI CHÚ SỨC KHỎE & DỊ ỨNG</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="VD: Bé dễ bị viêm tai, dị ứng với sữa tắm có cồn..."
              placeholderTextColor={theme.colors.text.muted}
              multiline
              numberOfLines={3}
              value={healthNote}
              onChangeText={setHealthNote}
            />
          </View>

          {/* 8. Behavior & Character */}
          <View style={styles.formGroup}>
            <Text style={styles.fieldLabel}>TÍNH CÁCH & THÓI QUEN</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="VD: Rất thích được massage lưng, hòa đồng..."
              placeholderTextColor={theme.colors.text.muted}
              multiline
              numberOfLines={3}
              value={behaviorNote}
              onChangeText={setBehaviorNote}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
          onPress={handleSavePet}
          disabled={isSubmitting}
          activeOpacity={0.85}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Check size={18} color="white" />
              <Text style={styles.submitBtnText}>Lưu Thay Đổi</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[5],
    paddingTop: theme.spacing[3],
    paddingBottom: theme.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.subdued,
    backgroundColor: theme.colors.surface.lowest,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface.subdued,
  },
  headerTitle: {
    ...theme.typography.h3,
    fontSize: 17,
    fontWeight: '800',
    color: theme.colors.primary.navy,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing[5],
    paddingTop: theme.spacing[4],
    paddingBottom: 110,
    gap: theme.spacing[4],
  },
  avatarPickerSection: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  avatarWrapper: {
    position: 'relative',
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.border.subdued,
    ...theme.shadows.sm,
  },
  avatarImage: {
    width: 92,
    height: 92,
    borderRadius: 46,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary.navy,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  avatarHint: {
    ...theme.typography.bodySm,
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  formGroup: {
    gap: 6,
  },
  fieldLabel: {
    ...theme.typography.label,
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.text.muted,
    letterSpacing: 0.6,
  },
  speciesRow: {
    flexDirection: 'row',
    gap: 12,
  },
  speciesCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.surface.lowest,
    borderWidth: 1.5,
    borderColor: theme.colors.border.subdued,
    ...theme.shadows.sm,
  },
  speciesCardSelected: {
    borderColor: theme.colors.primary.navy,
    backgroundColor: '#F0F7FF',
  },
  speciesIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surface.subdued,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speciesIconWrapSelected: {
    backgroundColor: theme.colors.primary.navy,
  },
  speciesLabel: {
    ...theme.typography.label,
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  speciesLabelSelected: {
    color: theme.colors.primary.navy,
  },
  textInput: {
    backgroundColor: theme.colors.surface.lowest,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border.subdued,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 14,
    color: theme.colors.text.primary,
    ...theme.shadows.sm,
  },
  textArea: {
    height: 80,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  quickTagsWrap: {
    marginTop: 4,
  },
  quickTagsScroll: {
    gap: 6,
  },
  quickTag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface.subdued,
    borderWidth: 1,
    borderColor: theme.colors.border.subdued,
  },
  quickTagActive: {
    backgroundColor: theme.colors.primary.navy,
    borderColor: theme.colors.primary.navy,
  },
  quickTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.text.secondary,
  },
  quickTagTextActive: {
    color: 'white',
  },
  genderRow: {
    flexDirection: 'row',
    gap: 12,
  },
  genderBtn: {
    flex: 1,
    height: 44,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.surface.lowest,
    borderWidth: 1.5,
    borderColor: theme.colors.border.subdued,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  genderBtnSelected: {
    borderColor: theme.colors.primary.navy,
    backgroundColor: '#F0F7FF',
  },
  genderBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text.secondary,
  },
  genderBtnTextSelected: {
    color: theme.colors.primary.navy,
  },
  rowTwoCols: {
    flexDirection: 'row',
    gap: 12,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surface.lowest,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.subdued,
    paddingHorizontal: theme.spacing[5],
    paddingTop: theme.spacing[3],
    paddingBottom: theme.spacing[5],
    ...theme.shadows.lg,
  },
  submitBtn: {
    backgroundColor: theme.colors.primary.navy,
    borderRadius: theme.radius.xl,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...theme.shadows.sm,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    ...theme.typography.label,
    fontSize: 15,
    fontWeight: '800',
    color: 'white',
  },
});
