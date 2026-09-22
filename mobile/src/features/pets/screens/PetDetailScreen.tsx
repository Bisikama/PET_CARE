import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Alert,
  Modal,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Dog,
  Cat,
  Edit2,
  Plus,
  Trash2,
  Calendar,
  Activity,
  FileText,
  X,
  Check,
} from 'lucide-react-native';
import { Screen } from '@/core/components/Screen';
import { theme } from '@/core/theme';
import { petApi } from '../api/petApi';
import { Pet, MedicalRecord } from '../types/pet.types';

export default function PetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [pet, setPet] = useState<Pet | null>(null);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [recordType, setRecordType] = useState<'VACCINE' | 'ALLERGY' | 'SURGERY'>('VACCINE');
  const [description, setDescription] = useState('');
  const [recordDate, setRecordDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      const [petRes, recordsRes] = await Promise.all([
        petApi.getPet(id),
        petApi.getMedicalRecords(id),
      ]);
      if (petRes.success && petRes.data) {
        setPet(petRes.data);
      }
      if (recordsRes.success) {
        setRecords(recordsRes.data || []);
      }
    } catch (error) {
      console.log('Error fetching pet details', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const openModal = (record?: any) => {
    if (record) {
      setEditingRecord(record);
      setRecordType(record.recordType || record.record_type || 'VACCINE');
      setDescription(record.description || '');
      const d = record.date || record.recordDate;
      setRecordDate(d ? new Date(d).toISOString().split('T')[0] : '');
    } else {
      setEditingRecord(null);
      setRecordType('VACCINE');
      setDescription('');
      setRecordDate(new Date().toISOString().split('T')[0]); // Default today
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingRecord(null);
    setRecordType('VACCINE');
    setDescription('');
    setRecordDate('');
  };

  const handleSaveRecord = async () => {
    if (!recordType || !description.trim() || !recordDate.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng điền đầy đủ loại, mô tả và ngày.');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        recordType: recordType,
        description: description.trim(),
        date: new Date(recordDate).toISOString(),
      };

      if (editingRecord) {
        await petApi.updateMedicalRecord(id, editingRecord.id, payload);
        Alert.alert('Thành công', 'Đã cập nhật sổ y tế.');
      } else {
        const res = await petApi.createMedicalRecord(id, payload);
        if (res.success) {
          Alert.alert('Thành công', 'Đã thêm sổ y tế mới.');
        } else {
          Alert.alert('Lỗi', res.message || 'Không thể tạo sổ y tế.');
        }
      }
      closeModal();
      fetchData(); // Refresh list
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể lưu sổ y tế.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRecord = (recordId: string) => {
    Alert.alert(
      'Xóa ghi chú y tế',
      'Bạn có chắc chắn muốn xóa mục sổ y tế này không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await petApi.deleteMedicalRecord(id, recordId);
              setRecords((prev) => prev.filter((r) => r.id !== recordId));
            } catch (error: any) {
              Alert.alert('Lỗi', 'Không thể xóa sổ y tế.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.screen, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary.navy} />
      </View>
    );
  }

  if (!pet) {
    return (
      <View style={[styles.screen, styles.centered]}>
        <Text style={styles.errorText}>Không tìm thấy thông tin thú cưng.</Text>
        <TouchableOpacity style={styles.backBtnFull} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isDog = (pet.species || '').toLowerCase() === 'dog';
  const avatar = pet.avatarUrl || pet.avatar_url;
  const health = pet.healthNote || pet.health_note;
  const behavior = pet.behaviorNote || pet.behavior_note;

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary.navy} />

      {/* Hero Header with Background */}
      <View style={styles.heroHeader}>
        <View style={styles.heroTopRow}>
          <TouchableOpacity style={styles.heroBackBtn} onPress={() => router.back()} activeOpacity={0.7}>
            <ArrowLeft size={20} color="white" />
          </TouchableOpacity>
          <Text style={styles.heroTitle}>Hồ Sơ Của {pet.name}</Text>
          <TouchableOpacity
            style={styles.heroEditBtn}
            onPress={() => router.push(`/(customer)/pets/${pet.id}/edit`)}
            activeOpacity={0.7}
          >
            <Edit2 size={18} color={theme.colors.primary.navy} />
          </TouchableOpacity>
        </View>
        <View style={styles.heroBottomCurve} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary.navy]}
            tintColor={theme.colors.primary.navy}
          />
        }
      >
        {/* Top Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoCardTop}>
            <View style={styles.avatarWrap}>
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatarImg} />
              ) : (
                <View style={styles.avatarFallback}>
                  {isDog ? (
                    <Dog size={36} color={theme.colors.primary.navy} />
                  ) : (
                    <Cat size={36} color={theme.colors.primary.navy} />
                  )}
                </View>
              )}
            </View>
            <View style={styles.infoTextCol}>
              <Text style={styles.petName}>{pet.name}</Text>
              <Text style={styles.breedText}>{pet.breed || (isDog ? 'Chó cưng' : 'Mèo cưng')}</Text>
              <View style={styles.tagsRow}>
                {pet.gender && (
                  <View style={styles.tagPill}>
                    <Text style={styles.tagPillText}>
                      {pet.gender === 'Male' ? '♂ Đực' : '♀ Cái'}
                    </Text>
                  </View>
                )}
                {pet.age !== undefined && pet.age !== null && (
                  <View style={styles.tagPill}>
                    <Text style={styles.tagPillText}>🎂 {pet.age} tuổi</Text>
                  </View>
                )}
                {pet.weight !== undefined && pet.weight !== null && (
                  <View style={[styles.tagPill, styles.weightTagPill]}>
                    <Text style={styles.weightTagText}>⚖️ {pet.weight} kg</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
          
          {(health || behavior) && (
            <View style={styles.notesBox}>
              {health && (
                <View style={styles.noteItem}>
                  <Activity size={14} color="#059669" />
                  <Text style={styles.noteText}>
                    <Text style={{ fontWeight: '700' }}>Sức khỏe: </Text>
                    {health}
                  </Text>
                </View>
              )}
              {behavior && (
                <View style={styles.noteItem}>
                  <FileText size={14} color={theme.colors.text.secondary} />
                  <Text style={styles.noteText}>
                    <Text style={{ fontWeight: '700' }}>Tính cách: </Text>
                    {behavior}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Medical Records Section */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Activity size={20} color={theme.colors.primary.navy} />
            <Text style={styles.sectionTitle}>Sổ Y Tế</Text>
          </View>
          <TouchableOpacity
            style={styles.addRecordBtn}
            onPress={() => openModal()}
            activeOpacity={0.8}
          >
            <Plus size={16} color="white" />
            <Text style={styles.addRecordBtnText}>Thêm mới</Text>
          </TouchableOpacity>
        </View>

        {records.length === 0 ? (
          <View style={styles.emptyRecords}>
            <Calendar size={32} color={theme.colors.border.strong} />
            <Text style={styles.emptyRecordsText}>Chưa có ghi chú y tế nào</Text>
          </View>
        ) : (
          <View style={styles.timeline}>
            {records.map((record: any, index) => {
              const type = record.recordType || record.record_type;
              const dateStr = record.date || record.recordDate;
              
              let typeLabel = type;
              if (type === 'VACCINE') typeLabel = 'Tiêm phòng (Vaccine)';
              if (type === 'ALLERGY') typeLabel = 'Dị ứng / Dinh dưỡng';
              if (type === 'SURGERY') typeLabel = 'Phẫu thuật / Điều trị';

              return (
              <View key={record.id} style={styles.timelineItem}>
                <View style={styles.timelineDot} />
                {index !== records.length - 1 && <View style={styles.timelineLine} />}
                
                <View style={styles.recordCard}>
                  <View style={styles.recordHeader}>
                    <Text style={styles.recordType}>{typeLabel}</Text>
                    <Text style={styles.recordDate}>
                      {dateStr ? new Date(dateStr).toLocaleDateString('vi-VN') : ''}
                    </Text>
                  </View>
                  <Text style={styles.recordDesc}>{record.description}</Text>
                  
                  <View style={styles.recordActions}>
                    <TouchableOpacity onPress={() => openModal(record)} style={styles.actionBtn}>
                      <Edit2 size={14} color={theme.colors.text.secondary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteRecord(record.id)} style={styles.actionBtn}>
                      <Trash2 size={14} color="#DC2626" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )})}
          </View>
        )}
      </ScrollView>

      {/* Add/Edit Medical Record Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingRecord ? 'Sửa Sổ Y Tế' : 'Thêm Sổ Y Tế'}
              </Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeBtn}>
                <X size={20} color={theme.colors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>LOẠI GHI CHÚ *</Text>
                <View style={styles.typeSelectorRow}>
                  <TouchableOpacity
                    style={[styles.typeBtn, recordType === 'VACCINE' && styles.typeBtnActive]}
                    onPress={() => setRecordType('VACCINE')}
                  >
                    <Text style={[styles.typeBtnText, recordType === 'VACCINE' && styles.typeBtnTextActive]}>Vaccine</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.typeBtn, recordType === 'ALLERGY' && styles.typeBtnActive]}
                    onPress={() => setRecordType('ALLERGY')}
                  >
                    <Text style={[styles.typeBtnText, recordType === 'ALLERGY' && styles.typeBtnTextActive]}>Dị ứng</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.typeBtn, recordType === 'SURGERY' && styles.typeBtnActive]}
                    onPress={() => setRecordType('SURGERY')}
                  >
                    <Text style={[styles.typeBtnText, recordType === 'SURGERY' && styles.typeBtnTextActive]}>Điều trị</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>MÔ TẢ CHI TIẾT *</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Nhập chi tiết thuốc, bác sĩ hoặc tình trạng..."
                  multiline
                  numberOfLines={3}
                  value={description}
                  onChangeText={setDescription}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>NGÀY THỰC HIỆN *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="YYYY-MM-DD (VD: 2024-01-15)"
                  value={recordDate}
                  onChangeText={setRecordDate}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
                onPress={handleSaveRecord}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Check size={18} color="white" />
                    <Text style={styles.submitBtnText}>
                      {editingRecord ? 'Lưu Thay Đổi' : 'Tạo Mới'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: theme.colors.text.secondary,
    marginBottom: 20,
  },
  backBtnFull: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: theme.colors.surface.subdued,
    borderRadius: theme.radius.md,
  },
  backBtnText: {
    fontWeight: '600',
  },
  heroHeader: {
    backgroundColor: theme.colors.primary.navy,
    paddingTop: 50, // For status bar + padding
    paddingBottom: 60,
    position: 'relative',
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[5],
    zIndex: 2,
  },
  heroBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  heroTitle: {
    ...theme.typography.h3,
    fontSize: 18,
    fontWeight: '800',
    color: 'white',
  },
  heroEditBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    ...theme.shadows.sm,
  },
  heroBottomCurve: {
    position: 'absolute',
    bottom: -20,
    left: -20,
    right: -20,
    height: 40,
    backgroundColor: theme.colors.primary.navy,
    borderRadius: 40,
  },
  scrollView: {
    flex: 1,
    marginTop: -45, // Pull up to overlap the hero header
  },
  scrollContent: {
    paddingHorizontal: theme.spacing[5],
    paddingTop: theme.spacing[2],
    paddingBottom: 40,
    gap: theme.spacing[5],
  },
  infoCard: {
    backgroundColor: theme.colors.surface.lowest,
    borderRadius: 24,
    padding: theme.spacing[5],
    ...theme.shadows.md,
    elevation: 6,
    shadowColor: theme.colors.primary.navy,
    shadowOpacity: 0.1,
    shadowRadius: 15,
    gap: 20,
  },
  infoCardTop: {
    alignItems: 'center',
    gap: 12,
  },
  avatarWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.surface.lowest,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'white',
    ...theme.shadows.sm,
  },
  avatarImg: {
    width: 92,
    height: 92,
    borderRadius: 46,
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#F1F5F9',
  },
  infoTextCol: {
    alignItems: 'center',
    gap: 6,
  },
  petName: {
    ...theme.typography.h2,
    fontSize: 24,
    fontWeight: '900',
    color: theme.colors.primary.navy,
  },
  breedText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.secondary,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },
  tagPill: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.border.subdued,
  },
  tagPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  weightTagPill: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  weightTagText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  notesBox: {
    backgroundColor: '#F0FDF4',
    borderRadius: theme.radius.xl,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: '#065F46',
    lineHeight: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    ...theme.typography.h4,
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text.primary,
  },
  addRecordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.primary.navy,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.full,
  },
  addRecordBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'white',
  },
  emptyRecords: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyRecordsText: {
    color: theme.colors.text.muted,
    fontSize: 14,
  },
  timeline: {
    paddingLeft: 10,
    paddingTop: 10,
  },
  timelineItem: {
    position: 'relative',
    paddingLeft: 36,
    paddingBottom: 24,
  },
  timelineDot: {
    position: 'absolute',
    left: 0,
    top: 6,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#0EA5E9',
    borderWidth: 3,
    borderColor: '#E0F2FE',
    ...theme.shadows.sm,
    zIndex: 2,
  },
  timelineLine: {
    position: 'absolute',
    left: 6,
    top: 18,
    bottom: -6,
    width: 2,
    backgroundColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  recordCard: {
    backgroundColor: 'white',
    borderRadius: theme.radius.xl,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.border.subdued,
    ...theme.shadows.sm,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recordType: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.text.primary,
  },
  recordDate: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  recordDesc: {
    fontSize: 13,
    color: theme.colors.text.secondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  recordActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  actionBtn: {
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.surface.lowest,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: theme.spacing[5],
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    ...theme.typography.h4,
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text.primary,
  },
  closeBtn: {
    padding: 4,
  },
  modalBody: {
    marginBottom: 20,
  },
  formGroup: {
    gap: 6,
    marginBottom: 16,
  },
  fieldLabel: {
    ...theme.typography.label,
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.text.muted,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.subdued,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 14,
    color: theme.colors.text.primary,
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typeBtn: {
    flex: 1,
    height: 40,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.border.subdued,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeBtnActive: {
    backgroundColor: theme.colors.primary.navy,
    borderColor: theme.colors.primary.navy,
  },
  typeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.text.secondary,
  },
  typeBtnTextActive: {
    color: 'white',
  },
  textArea: {
    height: 80,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  modalFooter: {
    paddingTop: 10,
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
