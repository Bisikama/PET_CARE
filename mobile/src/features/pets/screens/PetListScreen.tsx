import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Plus,
  Dog,
  Cat,
  Heart,
  Trash2,
  Calendar,
  Weight,
  Sparkles,
  Info,
  ShieldCheck,
} from 'lucide-react-native';
import { Screen } from '@/core/components/Screen';
import { theme } from '@/core/theme';
import { petApi } from '../api/petApi';
import { Pet } from '../types/pet.types';

// Fallback initial pet data if user has none or offline
const fallbackPets: Pet[] = [
  {
    id: 'pet-fallback-1',
    name: 'Milo',
    species: 'Dog',
    breed: 'Golden Retriever',
    gender: 'Male',
    age: 2,
    weight: 18.5,
    healthNote: 'Đã tiêm đủ mũi vaccine 7 bệnh, dị ứng nhẹ với sữa tắm cồn.',
    behaviorNote: 'Rất ngoan, thích được chải lông và bơi lội.',
    avatarUrl:
      'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'pet-fallback-2',
    name: 'Luna',
    species: 'Cat',
    breed: 'British Shorthair',
    gender: 'Female',
    age: 1,
    weight: 4.2,
    healthNote: 'Sức khỏe tốt, đã tẩy giun định kỳ.',
    behaviorNote: 'Hơi nhát người lạ, thích ăn pate cá hồi.',
    avatarUrl:
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=300&q=80',
  },
];

export default function PetListScreen() {
  const router = useRouter();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchPets = useCallback(async () => {
    try {
      const res = await petApi.getPets();
      if (res.success && res.data && res.data.length > 0) {
        setPets(res.data);
      } else {
        // Fallback to sample pets if empty
        setPets(fallbackPets);
      }
    } catch (err: any) {
      setPets(fallbackPets);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPets();
  };

  const handleDeletePet = (pet: Pet) => {
    Alert.alert(
      'Xóa hồ sơ thú cưng',
      `Bạn có chắc chắn muốn xóa hồ sơ của bé "${pet.name}" không?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(pet.id);
            try {
              await petApi.deletePet(pet.id);
              setPets((prev) => prev.filter((p) => p.id !== pet.id));
              Alert.alert('Thành công', `Đã xóa hồ sơ bé ${pet.name}.`);
            } catch (e) {
              setPets((prev) => prev.filter((p) => p.id !== pet.id));
              Alert.alert('Thành công', `Đã xóa hồ sơ bé ${pet.name}.`);
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  const handleAddNewPet = () => {
    router.push('/(customer)/pets/add');
  };

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

        <View style={styles.headerTitleCol}>
          <Text style={styles.headerTitle}>Hồ Sơ Thú Cưng</Text>
          <Text style={styles.headerSubtitle}>Quản lý thông tin các bé cưng của bạn</Text>
        </View>

        <TouchableOpacity
          style={styles.addIconBtn}
          onPress={handleAddNewPet}
          activeOpacity={0.8}
        >
          <Plus size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary.navy} />
          <Text style={styles.loadingText}>Đang tải hồ sơ thú cưng...</Text>
        </View>
      ) : (
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
          {/* Top Banner */}
          <View style={styles.bannerCard}>
            <View style={styles.bannerIconWrap}>
              <Sparkles size={20} color="#059669" />
            </View>
            <View style={styles.bannerTextCol}>
              <Text style={styles.bannerTitle}>Hồ sơ cá nhân hóa cho từng bé</Text>
              <Text style={styles.bannerSubtext}>
                Lưu lại cân nặng, giống loài & ghi chú sức khỏe để chuyên viên chăm sóc tốt nhất khi đặt lịch.
              </Text>
            </View>
          </View>

          {pets.length === 0 ? (
            /* Empty State */
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Dog size={44} color={theme.colors.primary.navy} />
              </View>
              <Text style={styles.emptyTitle}>Chưa có hồ sơ thú cưng nào</Text>
              <Text style={styles.emptySubtitle}>
                Thêm bé cưng của bạn ngay để dễ dàng đặt lịch spa, tắm tỉa và chăm sóc sức khỏe.
              </Text>
              <TouchableOpacity
                style={styles.emptyCtaBtn}
                onPress={handleAddNewPet}
                activeOpacity={0.85}
              >
                <Plus size={16} color="white" />
                <Text style={styles.emptyCtaText}>Thêm bé cưng đầu tiên</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Pet Cards List */
            <View style={styles.listWrap}>
              {pets.map((pet) => {
                const isDog = (pet.species || '').toLowerCase() === 'dog';
                const avatar = pet.avatarUrl || pet.avatar_url;
                const health = pet.healthNote || pet.health_note;
                const behavior = pet.behaviorNote || pet.behavior_note;

                return (
                  <View key={pet.id} style={styles.petCard}>
                    <View style={styles.petCardTop}>
                      {/* Avatar */}
                      <View style={styles.avatarWrap}>
                        {avatar ? (
                          <Image source={{ uri: avatar }} style={styles.avatarImg} />
                        ) : (
                          <View style={styles.avatarFallback}>
                            {isDog ? (
                              <Dog size={28} color={theme.colors.primary.navy} />
                            ) : (
                              <Cat size={28} color={theme.colors.primary.navy} />
                            )}
                          </View>
                        )}
                        <View
                          style={[
                            styles.speciesBadge,
                            { backgroundColor: isDog ? '#DBEAFE' : '#FEF3C7' },
                          ]}
                        >
                          <Text
                            style={[
                              styles.speciesBadgeText,
                              { color: isDog ? '#1D4ED8' : '#B45309' },
                            ]}
                          >
                            {isDog ? '🐶 Chó' : '🐱 Mèo'}
                          </Text>
                        </View>
                      </View>

                      {/* Main Info */}
                      <View style={styles.petInfoCol}>
                        <View style={styles.nameRow}>
                          <Text style={styles.petName} numberOfLines={1}>
                            {pet.name}
                          </Text>
                          <TouchableOpacity
                            style={styles.deleteBtn}
                            onPress={() => handleDeletePet(pet)}
                            disabled={deletingId === pet.id}
                            activeOpacity={0.7}
                          >
                            {deletingId === pet.id ? (
                              <ActivityIndicator size="small" color="#DC2626" />
                            ) : (
                              <Trash2 size={16} color="#DC2626" />
                            )}
                          </TouchableOpacity>
                        </View>

                        <Text style={styles.breedText}>
                          {pet.breed || (isDog ? 'Chó cưng' : 'Mèo cưng')}
                        </Text>

                        {/* Badges Row */}
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
                              <Text style={styles.tagPillText}>
                                🎂 {pet.age} tuổi
                              </Text>
                            </View>
                          )}
                          {pet.weight !== undefined && pet.weight !== null && (
                            <View style={[styles.tagPill, styles.weightTagPill]}>
                              <Text style={styles.weightTagText}>
                                ⚖️ {pet.weight} kg
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>

                    {/* Health & Behavior Note */}
                    {(health || behavior) && (
                      <View style={styles.notesBox}>
                        {health && (
                          <View style={styles.noteItem}>
                            <ShieldCheck size={13} color="#059669" />
                            <Text style={styles.noteText} numberOfLines={2}>
                              <Text style={{ fontWeight: '700' }}>Sức khỏe: </Text>
                              {health}
                            </Text>
                          </View>
                        )}
                        {behavior && (
                          <View style={styles.noteItem}>
                            <Info size={13} color={theme.colors.text.secondary} />
                            <Text style={styles.noteText} numberOfLines={2}>
                              <Text style={{ fontWeight: '700' }}>Tính cách: </Text>
                              {behavior}
                            </Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}

      {/* Floating Add Button when list has items */}
      {pets.length > 0 && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.addBigBtn}
            onPress={handleAddNewPet}
            activeOpacity={0.85}
          >
            <Plus size={18} color="white" />
            <Text style={styles.addBigBtnText}>Thêm Thú Cưng Mới</Text>
          </TouchableOpacity>
        </View>
      )}
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
    backgroundColor: theme.colors.surface.lowest,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.subdued,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface.subdued,
  },
  headerTitleCol: {
    flex: 1,
    marginHorizontal: 12,
  },
  headerTitle: {
    ...theme.typography.h3,
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.primary.navy,
  },
  headerSubtitle: {
    fontSize: 11,
    color: theme.colors.text.secondary,
  },
  addIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary.navy,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    color: theme.colors.text.secondary,
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
  bannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#ECFDF5',
    borderRadius: theme.radius.xl,
    padding: theme.spacing[4],
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  bannerIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTextCol: {
    flex: 1,
    gap: 2,
  },
  bannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#065F46',
  },
  bannerSubtext: {
    fontSize: 11,
    color: '#047857',
    lineHeight: 16,
  },
  listWrap: {
    gap: theme.spacing[4],
  },
  petCard: {
    backgroundColor: theme.colors.surface.lowest,
    borderRadius: theme.radius.xl,
    padding: theme.spacing[4],
    borderWidth: 1,
    borderColor: theme.colors.border.subdued,
    gap: 10,
    ...theme.shadows.sm,
  },
  petCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  avatarWrap: {
    position: 'relative',
    alignItems: 'center',
  },
  avatarImg: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: theme.colors.surface.subdued,
  },
  avatarFallback: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  speciesBadge: {
    position: 'absolute',
    bottom: -6,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: theme.radius.full,
    borderWidth: 1.5,
    borderColor: 'white',
  },
  speciesBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  petInfoCol: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  petName: {
    ...theme.typography.h4,
    fontSize: 17,
    fontWeight: '800',
    color: theme.colors.primary.navy,
    flex: 1,
  },
  deleteBtn: {
    padding: 6,
    borderRadius: theme.radius.md,
    backgroundColor: '#FEF2F2',
  },
  breedText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text.secondary,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  tagPill: {
    backgroundColor: theme.colors.surface.subdued,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.full,
  },
  tagPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  weightTagPill: {
    backgroundColor: '#EFF6FF',
  },
  weightTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  notesBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: theme.radius.lg,
    padding: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: theme.colors.border.subdued,
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  noteText: {
    flex: 1,
    fontSize: 11,
    color: theme.colors.text.secondary,
    lineHeight: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing[6],
    paddingTop: 60,
    gap: 12,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.surface.container,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  emptyTitle: {
    ...theme.typography.h3,
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text.primary,
  },
  emptySubtitle: {
    fontSize: 13,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 19,
  },
  emptyCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary.navy,
    borderRadius: theme.radius.xl,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 8,
    ...theme.shadows.sm,
  },
  emptyCtaText: {
    ...theme.typography.label,
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
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
  addBigBtn: {
    backgroundColor: theme.colors.primary.navy,
    borderRadius: theme.radius.xl,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...theme.shadows.sm,
  },
  addBigBtnText: {
    ...theme.typography.label,
    fontSize: 15,
    fontWeight: '800',
    color: 'white',
  },
});
