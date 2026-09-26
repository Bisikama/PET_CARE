import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Image as ImageIcon,
  CheckCircle2,
  X,
  Clock,
  MapPin,
  Heart,
  Smile,
  MessageSquare,
  Sparkles,
  Info,
  Check,
  Send,
  User,
  ShieldCheck,
  CheckCircle,
  MoreHorizontal,
  Edit3,
  MinusCircle,
  AlertTriangle,
  History,
  Lock,
  Tag,
  Lightbulb,
  ListChecks,
  ClipboardCheck,
  MessageCircle,
} from 'lucide-react-native';
import { Screen } from '@/core/components/Screen';
import {
  bookingsApi,
  ProviderBookingItem,
} from '@/infrastructure/api/bookings.api';

export interface EvidencePhotoItem {
  id: string;
  uri: string;
  caption: string;
  status: string;
  category?: string;
  size?: string;
  timestamp?: string;
}

// Pre-seeded high quality evidence photos matching Stitch HTML design
const DEFAULT_INITIAL_PHOTOS: EvidencePhotoItem[] = [
  {
    id: 'init-photo-1',
    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCTJpBADeDC91B7xsCu8k23QwDWqNe1Mc1ga-WDN42IEigz_K_K0DgcYVUVSjzLwHis1zrTUHnLj0YWxp7pOg4fsfoGc7-8QVygS2bOFrDcJ0B4YmXfJiilXD4eV9svzbER9xk9m_rDWPabBuW6VsMo0jQCx2VuPo2C3jglijJJawdT9pZV_bjE5aT0FONR_rfC3F8GLAMdqiQzRBiuWfOGPkQfe5eZqDeNi-4rnfW7vwX7WhtYBy6X',
    caption: 'Lúc tiếp nhận',
    category: '08:58 • Toàn thân',
    status: 'uploaded',
  },
  {
    id: 'init-photo-2',
    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAIAIN6hB2dYV2J5Z0XuX11G483v-dvAkxlzvE0BzaBHojx5uQZ2gxz5S8j-VNa9cDZRdru4iRTZHrEb1Pckucs8I7tk5M2SEFB752RgVHwd8AFg6uYYGIE4OriExgrfVbz94bRlbYyDKdfIqtf5ED6oTw2Ui6L4iSX0G9qjCXF0QC1ZI542XpGm4HjXilWTNC9fAhOsdnZhNs1jIVzzustFWyVzrRjkmN5lr-LRt9imWGjfMGiDy4r',
    caption: 'Kiểm tra tai & lông',
    category: '09:02 • Vùng tai',
    status: 'uploaded',
  },
];

const DEFAULT_COMPLETION_PHOTOS: EvidencePhotoItem[] = [
  {
    id: 'comp-photo-1',
    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0Wah5apejKlaTHyrdbMrJOkTXgRVSnBGtEbCXqgymFeyBnD7i2F0LaoAMy43vpUIICNj-ZrlSgYPgl_4a5yDXnb7GEd_G9v8Iky8y7IK-3bYn9Lxv5sMVZyH-q_2HyeCkXDVFLKGB0aXFU4xm7T_rvjW0nY7gKAZMiJUByby-UEgnvn3Yvh9_qu7WM9so-0JNK3K73YvmciQHGxkePGdGVWTJsOdNRajKveHd9ZKaA4p070GUtNXw',
    caption: 'Ảnh toàn thân hoàn tất',
    size: '3.4 MB',
    timestamp: '10:24 AM',
    status: 'uploaded',
  },
  {
    id: 'comp-photo-2',
    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzuuRKiJ6uQVkANg3aOYnAwRRhE-EuH4YrFj4CjuHaEqRLkN1JJFcyv3e5MyCHDgHqkOIFT16-HeDWst_yZLUYpo0cPOstAc8VrNKEgJhsF2giL5MP4wDF6q16VpWKArhF5_1D_eX2ygcwdGIDaAe5xptsHNIz05_14YgNjyt62SA-HzV3mKGYDJHlM5aQz6B_o9Zj9_td_2FObTssYKCLVdyA0_RkTA7GWrK48yQHbExJR2UT2R1z',
    caption: 'Vệ sinh kẽ móng sạch sẽ',
    size: '2.6 MB',
    timestamp: '10:26 AM',
    status: 'uploaded',
  },
  {
    id: 'comp-photo-3',
    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCToR5SK45KlSXAwuMpoWHzEQwUHLDXpIs7z_fT8F0mi3TqfdH9MncjCWsY-EJoczhf-IRzq8imWv7HPKLVDhFVQ3TzwnUV7yi9_2JLDOYWJfzQki9eXQxtbk40BS8kopz9B7wY4_RdVddGB-Gs4VfK46wjMn-vUOS1U32r9h2wFfgAedzW7blwOUb4Pg-bEQ3DbtwXbZw4xQDNk5IqHiYRXn4dSx7bbvLkPH48w8YOPcTVKrNt28-w',
    caption: 'Tỉa form mặt & tai gọn xinh',
    size: '2.8 MB',
    timestamp: '10:28 AM',
    status: 'uploaded',
  },
];

interface ChecklistTaskItem {
  id: string;
  title: string;
  status: 'PENDING' | 'DONE' | 'SKIPPED';
  serviceName?: string;
  petName?: string;
  completedAt?: string | null;
  note?: string;
}

export function ProviderStartServiceScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; bookingData?: string }>();

  // Overall stages: 1 = Checkin, 2 = Tasklist (Checklist), 3 = Evidence, 4 = Review & Submit
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [booking, setBooking] = useState<ProviderBookingItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Check-in State
  const [initialPhotos, setInitialPhotos] = useState<EvidencePhotoItem[]>(
    DEFAULT_INITIAL_PHOTOS
  );
  const [petConditionNote, setPetConditionNote] = useState<string>(
    'Bé Milo tâm trạng tốt, hợp tác, không có vết thương hở ngoài da. Lông vùng sau gáy hơi rối nhẹ.'
  );
  const [isConfirmStartModalVisible, setIsConfirmStartModalVisible] = useState(false);

  // Step 2: Checklist / Tasklist State (Matching show_checklist Stitch mockup)
  const [tasks, setTasks] = useState<ChecklistTaskItem[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [isNoteModalVisible, setIsNoteModalVisible] = useState(false);
  const [isSkipModalVisible, setIsSkipModalVisible] = useState(false);
  const [selectedTaskForModal, setSelectedTaskForModal] = useState<ChecklistTaskItem | null>(null);
  const [taskNoteInput, setTaskNoteInput] = useState('');
  const [taskSkipReasonInput, setTaskSkipReasonInput] = useState('');

  // Step 3: Evidence Upload State (Matching upload_evidence Stitch mockup)
  const [completionPhotos, setCompletionPhotos] = useState<EvidencePhotoItem[]>(
    DEFAULT_COMPLETION_PHOTOS
  );
  const [providerFinalNote, setProviderFinalNote] = useState<string>(
    'Bé Milo rất ngoan và hợp tác trong suốt buổi làm đẹp. Đã vệ sinh sạch khóe mắt và tai, tỉa gọn chân trước và sau. Bé vui vẻ, thơm mát.'
  );
  const [isCaptionModalVisible, setIsCaptionModalVisible] = useState(false);
  const [selectedPhotoForCaption, setSelectedPhotoForCaption] = useState<EvidencePhotoItem | null>(null);
  const [photoCaptionInput, setPhotoCaptionInput] = useState('');

  // Step 4: Review & Submit State (Matching review_submit Stitch mockup)
  const [isSubmitConfirmationModalVisible, setIsSubmitConfirmationModalVisible] = useState(false);
  const [isWaitingForCustomerReview, setIsWaitingForCustomerReview] = useState(false);

  // Generate standard tasks matching show_checklist design
  const generateDefaultTasks = useCallback((): ChecklistTaskItem[] => {
    return [
      {
        id: 'task-1',
        title: 'Kiểm tra da & chải gỡ lông rối',
        status: 'DONE',
        serviceName: 'Tắm spa & Vệ sinh',
        completedAt: '09:15',
        note: 'Lông vùng gáy hơi bết nhẹ, đã dùng dầu dưỡng gỡ êm không đau cho bé.',
      },
      {
        id: 'task-2',
        title: 'Tắm nước ấm & Dầu gội khử mùi thảo mộc',
        status: 'PENDING',
        serviceName: 'Tắm spa khử mùi',
        completedAt: null,
      },
      {
        id: 'task-3',
        title: 'Vệ sinh tai & Làm sạch kẽ móng chân',
        status: 'PENDING',
        serviceName: 'Vệ sinh chăm sóc',
        completedAt: null,
      },
      {
        id: 'task-4',
        title: 'Cắt tỉa móng sâu chân sau',
        status: 'SKIPPED',
        serviceName: 'Cắt móng sâu',
        completedAt: null,
        note: 'Bé hơi nhạy cảm chân sau, chủ nuôi dặn bỏ qua nếu bé sợ.',
      },
      {
        id: 'task-5',
        title: 'Sấy khô lông, chải phồng & cắt tỉa tạo kiểu theo yêu cầu',
        status: 'PENDING',
        serviceName: 'Cắt tỉa tạo kiểu',
        completedAt: null,
      },
    ];
  }, []);

  // Fetch Booking and Checklist on Mount
  useEffect(() => {
    let isMounted = true;

    async function loadBookingData() {
      setIsLoading(true);

      // Check if passed via params
      if (params.bookingData) {
        try {
          const parsed = JSON.parse(params.bookingData);
          if (isMounted) {
            setBooking(parsed);
            if (parsed.status === 'IN_PROGRESS') {
              setCurrentStep(2);
            } else if (
              parsed.status === 'AWAITING_CUSTOMER_CONFIRMATION' ||
              parsed.status === 'COMPLETED'
            ) {
              setCurrentStep(4);
              setIsWaitingForCustomerReview(true);
            }
          }
        } catch (e) {
          console.warn('Could not parse bookingData param', e);
        }
      }

      // Fetch latest from API
      if (params.id) {
        try {
          const res = await bookingsApi.getBookingById(params.id);
          if (res && isMounted) {
            const item = res as unknown as ProviderBookingItem;
            setBooking(item);
            if (item.status === 'IN_PROGRESS') {
              setCurrentStep(2);
            } else if (
              item.status === 'AWAITING_CUSTOMER_CONFIRMATION' ||
              item.status === 'COMPLETED'
            ) {
              setCurrentStep(4);
              setIsWaitingForCustomerReview(true);
            }
          }
        } catch (err) {
          console.warn('Failed to load booking by id, will use fallback data', err);
        }

        // Fetch checklist
        try {
          setIsLoadingTasks(true);
          const checklistRes = await bookingsApi.getChecklist(params.id);
          if (
            isMounted &&
            checklistRes?.checklistItems &&
            checklistRes.checklistItems.length > 0
          ) {
            setTasks(checklistRes.checklistItems);
          } else if (isMounted) {
            setTasks(generateDefaultTasks());
          }
        } catch (err) {
          if (isMounted) {
            setTasks(generateDefaultTasks());
          }
        } finally {
          if (isMounted) setIsLoadingTasks(false);
        }
      } else {
        setTasks(generateDefaultTasks());
      }

      if (isMounted) {
        setIsLoading(false);
      }
    }

    loadBookingData();

    return () => {
      isMounted = false;
    };
  }, [params.id, params.bookingData, generateDefaultTasks]);

  // Primary Pet information
  const primaryPet = booking?.booking_pets?.[0]?.pets || {
    name: booking?.booking_pets?.[0]?.pet_name || 'Milo',
    species: booking?.booking_pets?.[0]?.species || 'Chó',
    breed: booking?.booking_pets?.[0]?.breed || 'Poodle',
    weight: booking?.booking_pets?.[0]?.weight || 4.5,
    avatar_url:
      booking?.booking_pets?.[0]?.avatar_url ||
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDrByArqivx1-t58855suYlvBYQ3RMLQwnPvZEPSrQDg6Vz_3Xf6a440-YNdkrSK26dhHDAqHbT45dbELB7KfNXPHFxSLJCKvOxsC_yGzqbpHN9X0TVWHV1_Vt2iVb70BrYWmnIfoJQixBg5xONm8QgJpsYtn-ZRMaNEvxSPr-b1zw9DmyHiPoYYyXa-27_jhJAuQUmIS2NB4ixXyPIjuE36Cqw5JojtbW-dYaL1q_xDEWIIQ1Zuxsb',
  };

  // Primary Service information
  const primaryService = booking?.booking_pets?.[0]?.booking_services?.[0];
  const serviceName =
    primaryService?.service_name ||
    primaryService?.provider_services?.services?.name ||
    primaryService?.provider_services?.services?.title ||
    'Tắm spa khử mùi & Cắt tỉa tạo kiểu';

  const fullAddress =
    booking?.customer_addresses?.formatted_address ||
    booking?.customer_addresses?.address_line ||
    '142/8 Nguyễn Trãi, Phường 3, Quận 5, TP. Hồ Chí Minh';

  const customerName =
    booking?.users?.fullName ||
    booking?.users?.full_name ||
    booking?.customer_addresses?.receiver_name ||
    'Nguyễn Thu Hà';

  // Photo actions for Check-in (Step 1)
  const handleTakePhotoCheckin = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Cấp quyền camera', 'Vui lòng cấp quyền truy cập máy ảnh để chụp ảnh hiện trạng bé.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newPhoto = {
          id: `photo-${Date.now()}`,
          uri: result.assets[0].uri,
          caption: 'Ảnh hiện trạng khi nhận bé',
          status: 'uploaded',
        };
        setInitialPhotos((prev) => [newPhoto, ...prev]);
      }
    } catch (e) {
      const newPhoto = {
        id: `photo-${Date.now()}`,
        uri: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80',
        caption: 'Ảnh hiện trạng tiếp nhận bé',
        status: 'uploaded',
      };
      setInitialPhotos((prev) => [newPhoto, ...prev]);
    }
  };

  const handlePickGalleryCheckin = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Cấp quyền ảnh', 'Vui lòng cấp quyền thư viện ảnh.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newPhoto = {
          id: `photo-${Date.now()}`,
          uri: result.assets[0].uri,
          caption: 'Ảnh chụp trước dịch vụ',
          status: 'uploaded',
        };
        setInitialPhotos((prev) => [newPhoto, ...prev]);
      }
    } catch (e) {
      const newPhoto = {
        id: `photo-${Date.now()}`,
        uri: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=600&q=80',
        caption: 'Ảnh kiểm tra da & lông',
        status: 'uploaded',
      };
      setInitialPhotos((prev) => [newPhoto, ...prev]);
    }
  };

  const handleRemoveInitialPhoto = (photoId: string) => {
    setInitialPhotos((prev) => prev.filter((p) => p.id !== photoId));
  };

  // Photo actions for Evidence (Step 3 - Matching upload_evidence Stitch mockup)
  const handleTakePhotoEvidence = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Cấp quyền camera', 'Vui lòng cấp quyền truy cập máy ảnh để chụp minh chứng hoàn thành.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const nowTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        const newPhoto: EvidencePhotoItem = {
          id: `evidence-${Date.now()}`,
          uri: result.assets[0].uri,
          caption: 'Ảnh chi tiết hoàn tất dịch vụ',
          status: 'uploaded',
          size: '3.2 MB',
          timestamp: nowTime,
        };
        setCompletionPhotos((prev) => [newPhoto, ...prev]);

        if (booking?.id) {
          const file = {
            uri: result.assets[0].uri,
            type: 'image/jpeg',
            name: `evidence-${Date.now()}.jpg`,
          };
          bookingsApi.uploadEvidence(booking.id, file).catch(() => { });
        }
      }
    } catch (e) {
      const nowTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      const newPhoto: EvidencePhotoItem = {
        id: `evidence-${Date.now()}`,
        uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0Wah5apejKlaTHyrdbMrJOkTXgRVSnBGtEbCXqgymFeyBnD7i2F0LaoAMy43vpUIICNj-ZrlSgYPgl_4a5yDXnb7GEd_G9v8Iky8y7IK-3bYn9Lxv5sMVZyH-q_2HyeCkXDVFLKGB0aXFU4xm7T_rvjW0nY7gKAZMiJUByby-UEgnvn3Yvh9_qu7WM9so-0JNK3K73YvmciQHGxkePGdGVWTJsOdNRajKveHd9ZKaA4p070GUtNXw',
        caption: 'Ảnh hoàn tất sấy & tỉa lông',
        status: 'uploaded',
        size: '3.1 MB',
        timestamp: nowTime,
      };
      setCompletionPhotos((prev) => [newPhoto, ...prev]);
    }
  };

  const handlePickGalleryEvidence = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Cấp quyền thư viện', 'Vui lòng cấp quyền thư viện ảnh.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const nowTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        const newPhoto: EvidencePhotoItem = {
          id: `evidence-${Date.now()}`,
          uri: result.assets[0].uri,
          caption: 'Ảnh nghiệm thu dịch vụ',
          status: 'uploaded',
          size: '2.5 MB',
          timestamp: nowTime,
        };
        setCompletionPhotos((prev) => [newPhoto, ...prev]);

        if (booking?.id) {
          const file = {
            uri: result.assets[0].uri,
            type: 'image/jpeg',
            name: `evidence-${Date.now()}.jpg`,
          };
          bookingsApi.uploadEvidence(booking.id, file).catch(() => { });
        }
      }
    } catch (e) {
      const nowTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      const newPhoto: EvidencePhotoItem = {
        id: `evidence-${Date.now()}`,
        uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzuuRKiJ6uQVkANg3aOYnAwRRhE-EuH4YrFj4CjuHaEqRLkN1JJFcyv3e5MyCHDgHqkOIFT16-HeDWst_yZLUYpo0cPOstAc8VrNKEgJhsF2giL5MP4wDF6q16VpWKArhF5_1D_eX2ygcwdGIDaAe5xptsHNIz05_14YgNjyt62SA-HzV3mKGYDJHlM5aQz6B_o9Zj9_td_2FObTssYKCLVdyA0_RkTA7GWrK48yQHbExJR2UT2R1z',
        caption: 'Vệ sinh kẽ chân & móng sạch sẽ',
        status: 'uploaded',
        size: '2.6 MB',
        timestamp: nowTime,
      };
      setCompletionPhotos((prev) => [newPhoto, ...prev]);
    }
  };

  const handleRemoveCompletionPhoto = (photoId: string) => {
    setCompletionPhotos((prev) => prev.filter((p) => p.id !== photoId));
  };

  const handleOpenCaptionModal = (photo: EvidencePhotoItem) => {
    setSelectedPhotoForCaption(photo);
    setPhotoCaptionInput(photo.caption || '');
    setIsCaptionModalVisible(true);
  };

  const handleSavePhotoCaption = () => {
    if (!selectedPhotoForCaption) return;
    const newCap = photoCaptionInput.trim();
    setCompletionPhotos((prev) =>
      prev.map((p) =>
        p.id === selectedPhotoForCaption.id
          ? { ...p, caption: newCap || 'Ảnh hoàn tất dịch vụ' }
          : p
      )
    );
    setIsCaptionModalVisible(false);
  };

  // STEP 1 -> STEP 2: Confirm Check-in & Start Service
  const handleConfirmStartService = async () => {
    if (!booking?.id) {
      setIsConfirmStartModalVisible(false);
      setCurrentStep(2);
      return;
    }

    try {
      setIsSubmitting(true);
      await bookingsApi.startService(booking.id, {
        petConditionNote: petConditionNote.trim() || undefined,
        evidenceMedias: initialPhotos.map((p) => ({
          mediaUrl: p.uri,
          mediaType: 'IMAGE',
          category: 'CHECK_IN',
          caption: p.caption,
        })),
      });

      setBooking((prev) => (prev ? { ...prev, status: 'IN_PROGRESS' } : prev));
      setIsConfirmStartModalVisible(false);
      setCurrentStep(2);
      Alert.alert(
        'Bắt đầu dịch vụ!',
        'Đã cập nhật trạng thái đơn hẹn sang IN_PROGRESS. Hãy thực hiện checklist các công việc.'
      );
    } catch (error) {
      setBooking((prev) => (prev ? { ...prev, status: 'IN_PROGRESS' } : prev));
      setIsConfirmStartModalVisible(false);
      setCurrentStep(2);
    } finally {
      setIsSubmitting(false);
    }
  };

  // STEP 2: Task Action Handlers (Mark Done, Add Note, Skip Task)
  const handleMarkTaskDone = async (task: ChecklistTaskItem) => {
    const nowTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? {
            ...t,
            status: 'DONE',
            completedAt: nowTime,
          }
          : t
      )
    );

    if (booking?.id && !task.id.startsWith('task-')) {
      try {
        await bookingsApi.updateChecklistItem(booking.id, task.id, {
          status: 'DONE',
        });
      } catch (err) {
        console.warn('Could not sync task status to backend:', err);
      }
    }
  };

  const handleOpenNoteModal = (task: ChecklistTaskItem) => {
    setSelectedTaskForModal(task);
    setTaskNoteInput(task.note || '');
    setIsNoteModalVisible(true);
  };

  const handleSaveTaskNote = async () => {
    if (!selectedTaskForModal) return;
    const updatedNote = taskNoteInput.trim();

    setTasks((prev) =>
      prev.map((t) =>
        t.id === selectedTaskForModal.id ? { ...t, note: updatedNote || undefined } : t
      )
    );

    if (booking?.id && !selectedTaskForModal.id.startsWith('task-')) {
      try {
        await bookingsApi.updateChecklistItem(booking.id, selectedTaskForModal.id, {
          status: selectedTaskForModal.status,
          note: updatedNote || undefined,
        });
      } catch (e) {
        console.warn('Could not sync note to backend', e);
      }
    }

    setIsNoteModalVisible(false);
  };

  const handleOpenSkipModal = (task: ChecklistTaskItem) => {
    setSelectedTaskForModal(task);
    setTaskSkipReasonInput(task.note || '');
    setIsSkipModalVisible(true);
  };

  const handleConfirmSkipTask = async () => {
    if (!selectedTaskForModal) return;
    const skipReason = taskSkipReasonInput.trim();

    setTasks((prev) =>
      prev.map((t) =>
        t.id === selectedTaskForModal.id
          ? {
            ...t,
            status: 'SKIPPED',
            note: skipReason || 'Bỏ qua theo yêu cầu hoặc tình trạng bé',
          }
          : t
      )
    );

    if (booking?.id && !selectedTaskForModal.id.startsWith('task-')) {
      try {
        await bookingsApi.updateChecklistItem(booking.id, selectedTaskForModal.id, {
          status: 'SKIPPED',
          note: skipReason || undefined,
        });
      } catch (e) {
        console.warn('Could not sync skip status to backend', e);
      }
    }

    setIsSkipModalVisible(false);
  };

  // STEP 2: Mark all tasks done
  const handleMarkAllTasksDone = () => {
    const nowTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    setTasks((prev) =>
      prev.map((t) => ({
        ...t,
        status: 'DONE',
        completedAt: t.completedAt || nowTime,
      }))
    );
  };

  // Task list progress calculations
  const completedTaskCount = useMemo(() => {
    return tasks.filter((t) => t.status === 'DONE').length;
  }, [tasks]);

  const skippedTaskCount = useMemo(() => {
    return tasks.filter((t) => t.status === 'SKIPPED').length;
  }, [tasks]);

  const remainingTaskCount = useMemo(() => {
    return tasks.filter((t) => t.status === 'PENDING').length;
  }, [tasks]);

  const taskProgressPercentage = useMemo(() => {
    if (tasks.length === 0) return 0;
    return Math.round((completedTaskCount / tasks.length) * 100);
  }, [tasks, completedTaskCount]);

  // STEP 3 -> STEP 4: Proceed to Review & Confirmation
  const handleProceedToConfirmation = () => {
    if (completionPhotos.length === 0) {
      Alert.alert(
        'Chưa có ảnh hoàn thành',
        'Vui lòng tải lên ít nhất 1 ảnh thú cưng đã làm xong dịch vụ để khách hàng nghiệm thu.',
        [{ text: 'Đã hiểu' }]
      );
      return;
    }
    setCurrentStep(4);
  };

  // STEP 4: Submit Completion & Wait for Customer Review
  const handleSubmitCompletion = async () => {
    setIsSubmitConfirmationModalVisible(false);
    if (!booking?.id) {
      setIsWaitingForCustomerReview(true);
      return;
    }

    try {
      setIsSubmitting(true);
      await bookingsApi.completeBooking(booking.id, {
        evidenceMedias: completionPhotos.map((p) => ({
          mediaUrl: p.uri,
          mediaType: 'IMAGE',
          category: 'CHECK_OUT',
          caption: p.caption,
        })),
        checklistItems: tasks
          .filter((t) => !t.id.startsWith('task-'))
          .map((t) => ({
            checklistItemId: t.id,
            status: t.status === 'DONE' ? 'DONE' : 'SKIPPED',
          })),
        providerNote: providerFinalNote,
      });

      setIsWaitingForCustomerReview(true);
      setBooking((prev) =>
        prev ? { ...prev, status: 'AWAITING_CUSTOMER_CONFIRMATION' } : prev
      );
    } catch (error) {
      setIsWaitingForCustomerReview(true);
      setBooking((prev) =>
        prev ? { ...prev, status: 'AWAITING_CUSTOMER_CONFIRMATION' } : prev
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render Horizontal Stepper (Steps 1 to 4 matching Stitch design)
  const renderStepper = () => {
    const steps = [
      { step: 1, title: 'Check-in', key: 'checkin' },
      { step: 2, title: 'Checklist', key: 'checklist' },
      { step: 3, title: 'Evidence', key: 'evidence' },
      { step: 4, title: 'Review', key: 'complete' },
    ];

    return (
      <View style={styles.stepperContainer}>
        {/* Booking Status Pill Bar */}
        <View style={styles.bookingStatusPillBar}>
          <View style={styles.statusPillLeft}>
            <View style={styles.amberPulsingDot} />
            <Text style={styles.bookingCodeText}>
              {booking?.booking_code || `#BK-${(booking?.id || '8924').slice(-4).toUpperCase()}`}
            </Text>
            <Text style={styles.dotSeparator}>•</Text>
            <Text style={styles.inProgressBadgeText}>
              {booking?.status || 'IN_PROGRESS'}
            </Text>
          </View>
          <Text style={styles.stepCounterText}>Step {currentStep} of 4</Text>
        </View>

        <View style={styles.stepperInner}>
          {/* Progress Connecting Line */}
          <View style={styles.stepperLineBg} />
          <View
            style={[
              styles.stepperLineActive,
              { width: `${((currentStep - 1) / 3) * 100}%` },
            ]}
          />

          {steps.map((s) => {
            const isCompleted = s.step < currentStep || isWaitingForCustomerReview;
            const isActive = s.step === currentStep && !isWaitingForCustomerReview;

            return (
              <TouchableOpacity
                key={s.step}
                style={styles.stepItem}
                onPress={() => {
                  if (s.step <= currentStep) {
                    setCurrentStep(s.step);
                  }
                }}
                disabled={s.step > currentStep}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.stepCircle,
                    isCompleted && styles.stepCircleCompleted,
                    isActive && styles.stepCircleActive,
                  ]}
                >
                  {isCompleted ? (
                    <Check size={16} color="#00A472" strokeWidth={3} />
                  ) : isActive ? (
                    <View style={styles.stepActiveDot} />
                  ) : (
                    <View style={styles.stepPendingDot} />
                  )}
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    isActive && styles.stepLabelActive,
                    isCompleted && styles.stepLabelCompleted,
                  ]}
                  numberOfLines={1}
                >
                  {s.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <Screen style={styles.screen} backgroundColor="#F8F9FF">
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FF" />

      {/* Top Header Navigation */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (currentStep > 1 && !isWaitingForCustomerReview) {
                setCurrentStep((prev) => prev - 1);
              } else {
                router.back();
              }
            }}
            activeOpacity={0.7}
          >
            <ArrowLeft size={22} color="#0B1C30" />
          </TouchableOpacity>

          <View style={styles.logoBadge}>
            <Sparkles size={16} color="#FDBF35" />
          </View>

          <View style={styles.headerTitleCol}>
            <Text style={styles.headerMainTitle}>
              {currentStep === 1
                ? 'Check In'
                : currentStep === 2
                  ? 'Service Checklist'
                  : currentStep === 3
                    ? 'Completion Evidence'
                    : 'Review & Submit'}
            </Text>
            <Text style={styles.headerStepBadge}>
              STEP {currentStep} OF 4
            </Text>
          </View>
        </View>

        <View style={styles.headerRightAvatar}>
          <User size={18} color="#FFFFFF" />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Horizontal Progress Stepper */}
        {renderStepper()}

        {/* ============================================================ */}
        {/* GIAI ĐOẠN 1: CHECK-IN SCREEN */}
        {/* ============================================================ */}
        {currentStep === 1 && (
          <View style={styles.stageContent}>
            {/* 1. Pet & Appointment Context Card */}
            <View style={styles.contextCard}>
              <View style={styles.contextCardTop}>
                <View style={styles.petAvatarWrapper}>
                  <Image source={{ uri: primaryPet.avatar_url }} style={styles.petAvatarImg} />
                  <View style={styles.petPawBadge}>
                    <Sparkles size={10} color="#FDBF35" />
                  </View>
                </View>

                <View style={styles.petInfoCol}>
                  <View style={styles.petNameRow}>
                    <Text style={styles.petNameText} numberOfLines={1}>
                      {primaryPet.name}
                    </Text>
                    <View style={styles.petBreedTag}>
                      <Text style={styles.petBreedTagText}>
                        {primaryPet.breed} · {primaryPet.weight} kg
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.serviceNameText} numberOfLines={1}>
                    {serviceName}
                  </Text>

                  <View style={styles.timeScheduleRow}>
                    <Clock size={14} color="#7B5800" />
                    <Text style={styles.timeScheduleText}>09:00 – 10:30 (Hôm nay)</Text>
                  </View>
                </View>
              </View>

              <View style={styles.statusChipRow}>
                <View style={styles.acceptedStatusBadge}>
                  <Text style={styles.acceptedStatusText}>
                    {booking?.status || 'ACCEPTED'}
                  </Text>
                </View>
              </View>
            </View>

            {/* 2. Important Pet Notes Section */}
            <View style={styles.notesSection}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionHeaderLeft}>
                  <Info size={18} color="#0B2A4A" strokeWidth={2.5} />
                  <Text style={styles.sectionHeadingText}>Important Pet Notes</Text>
                </View>
                <View style={styles.careAlertBadge}>
                  <Text style={styles.careAlertText}>Care Alert</Text>
                </View>
              </View>

              <View style={styles.notesCardBox}>
                {/* Health Notes */}
                <View style={styles.noteItemRow}>
                  <View style={styles.noteIconCircle}>
                    <Heart size={16} color="#BA1A1A" />
                  </View>
                  <View style={styles.noteTextCol}>
                    <View style={styles.noteTitleDotRow}>
                      <Text style={styles.noteTitle}>Health Notes</Text>
                      <View style={styles.amberDot} />
                    </View>
                    <Text style={styles.noteDesc}>
                      Bé có tiền sử dị ứng xà phòng hương liệu nhân tạo, da vùng bụng hơi nhạy cảm. Đã tiêm phòng dại đầy đủ.
                    </Text>
                  </View>
                </View>

                <View style={styles.noteDivider} />

                {/* Behavior Notes */}
                <View style={styles.noteItemRow}>
                  <View style={styles.noteIconCircle}>
                    <Smile size={16} color="#0B2A4A" />
                  </View>
                  <View style={styles.noteTextCol}>
                    <Text style={styles.noteTitle}>Behavior Notes</Text>
                    <Text style={styles.noteDesc}>
                      Rất thân thiện nhưng nhát tiếng máy sấy công suất lớn lúc đầu. Thích được vuốt ve đầu trước khi bế.
                    </Text>
                  </View>
                </View>

                <View style={styles.noteDivider} />

                {/* Customer Notes */}
                <View style={styles.noteItemRow}>
                  <View style={styles.noteIconCircle}>
                    <MessageSquare size={16} color="#0B2A4A" />
                  </View>
                  <View style={styles.noteTextCol}>
                    <Text style={styles.noteTitle}>Customer Notes</Text>
                    <Text style={styles.noteDesc}>
                      {booking?.customer_note ||
                        'Nhờ thợ cắt ngắn lông quanh mắt để bé nhìn rõ hơn và kiểm tra kỹ kẽ móng chân giúp mình nhé.'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* 3. Service Location Card */}
            <View style={styles.locationCard}>
              <View style={styles.locationIconBox}>
                <MapPin size={20} color="#0B2A4A" />
              </View>
              <View style={styles.locationTextCol}>
                <Text style={styles.locationLabel}>SERVICE LOCATION</Text>
                <Text style={styles.locationAddress} numberOfLines={2}>
                  {fullAddress}
                </Text>
                <View style={styles.detectedRow}>
                  <View style={styles.greenPulseDot} />
                  <Text style={styles.detectedText}>
                    Current location detected · Client device location active
                  </Text>
                </View>
              </View>
            </View>

            {/* 4. Initial Condition Photos (Hero Section) */}
            <View style={styles.photosSection}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeadingText}>Initial Condition Photos</Text>
                <View style={styles.photosCountBadge}>
                  <CheckCircle2 size={13} color="#00A472" />
                  <Text style={styles.photosCountText}>
                    {initialPhotos.length} photos uploaded
                  </Text>
                </View>
              </View>
              <Text style={styles.sectionSubtitleText}>
                Capture clear photos of your pet before starting the service.
              </Text>

              {/* Helper Callout Card */}
              <View style={styles.calloutCard}>
                <Text style={styles.calloutIcon}>💡</Text>
                <Text style={styles.calloutText}>
                  <Text style={styles.calloutBold}>Lưu ý: </Text>
                  Chụp rõ các vết xước có sẵn, vùng da đỏ/viêm, lông rối bết, mắt hoặc tai nếu có dấu hiệu bất thường trước khi thực hiện dịch vụ.
                </Text>
              </View>

              {/* Action Buttons: Take Photo & From Gallery */}
              <View style={styles.photoActionButtonsRow}>
                <TouchableOpacity
                  style={styles.takePhotoButton}
                  onPress={handleTakePhotoCheckin}
                  activeOpacity={0.85}
                >
                  <Camera size={18} color="#FDBF35" />
                  <Text style={styles.takePhotoButtonText}>Take Photo</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.galleryButton}
                  onPress={handlePickGalleryCheckin}
                  activeOpacity={0.85}
                >
                  <ImageIcon size={18} color="#0B1C30" />
                  <Text style={styles.galleryButtonText}>From Gallery</Text>
                </TouchableOpacity>
              </View>

              {/* Thumbnail Grid */}
              <View style={styles.photoGrid}>
                {initialPhotos.map((photo) => (
                  <View key={photo.id} style={styles.photoGridItem}>
                    <View style={styles.photoImageWrapper}>
                      <Image source={{ uri: photo.uri }} style={styles.gridImage} />
                      <TouchableOpacity
                        style={styles.photoDeleteBtn}
                        onPress={() => handleRemoveInitialPhoto(photo.id)}
                        activeOpacity={0.8}
                      >
                        <X size={13} color="#FFFFFF" />
                      </TouchableOpacity>

                      <View style={styles.photoUploadedBadge}>
                        <Check size={10} color="#00A472" strokeWidth={3} />
                        <Text style={styles.photoUploadedText}>Uploaded</Text>
                      </View>
                    </View>
                    <Text style={styles.photoCaptionText} numberOfLines={1}>
                      {photo.caption}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* 5. Initial Pet Condition Note */}
            <View style={styles.conditionNoteSection}>
              <View style={styles.sectionHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.sectionHeadingText}>Initial Pet Condition</Text>
                  <Text style={styles.optionalTag}>(Optional)</Text>
                </View>
                <Text style={styles.charCounterText}>
                  {petConditionNote.length} / 1000
                </Text>
              </View>
              <Text style={styles.sectionSubtitleText}>
                Ghi chú tình trạng ban đầu của bé
              </Text>

              <View style={styles.textAreaBox}>
                <TextInput
                  style={styles.textAreaInput}
                  multiline
                  numberOfLines={3}
                  value={petConditionNote}
                  onChangeText={setPetConditionNote}
                  placeholder="Describe the pet’s health, mood, behavior or any condition you notice before starting…"
                  placeholderTextColor="#74777F"
                />
              </View>
            </View>

            <View style={{ height: 110 }} />
          </View>
        )}

        {/* ============================================================ */}
        {/* GIAI ĐOẠN 2: TASKLIST (CHECKLIST) SCREEN (THEO THIẾT KẾ STITCH SHOW_CHECKLIST) */}
        {/* ============================================================ */}
        {currentStep === 2 && (
          <View style={styles.stageContent}>
            {/* Top Bar Context / Booking Info */}
            <View style={styles.checklistContextBar}>
              <View>
                <View style={styles.checkTitleRow}>
                  <Text style={styles.checkTitleHeading}>Service Checklist</Text>
                  <View style={styles.bookingCodeBadge}>
                    <Text style={styles.bookingCodeBadgeText}>
                      {booking?.booking_code || '#BK-8924'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.checkSubtitleText}>
                  Step 2 of 4 · Service Execution
                </Text>
              </View>

              <View style={styles.inProgressPill}>
                <View style={styles.inProgressPulseDot} />
                <Text style={styles.inProgressPillText}>IN_PROGRESS</Text>
              </View>
            </View>

            {/* Real-time Progress Card */}
            <View style={styles.checklistSummaryCard}>
              <View style={styles.checklistProgressHeaderRow}>
                <View>
                  <Text style={styles.realtimeTagText}>REAL-TIME PROGRESS</Text>
                  <Text style={styles.taskCountHeading}>
                    {completedTaskCount} of {tasks.length} tasks completed
                  </Text>
                </View>
                <Text style={styles.largePercentText}>{taskProgressPercentage}%</Text>
              </View>

              {/* Linear Progress Bar */}
              <View style={styles.progressBarWrapper}>
                <View style={styles.progressBarTrack}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${taskProgressPercentage}%` },
                    ]}
                  />
                </View>
              </View>

              {/* Status Summary Pills Row */}
              <View style={styles.statusPillsRow}>
                <View style={styles.statusPillItem}>
                  <CheckCircle2 size={13} color="#00A472" />
                  <Text style={styles.statusPillText}>{completedTaskCount} Completed</Text>
                </View>
                <View style={styles.statusPillItem}>
                  <MinusCircle size={13} color="#7B5800" />
                  <Text style={styles.statusPillText}>{skippedTaskCount} Skipped</Text>
                </View>
                <View style={[styles.statusPillItem, styles.statusPillRemaining]}>
                  <View style={styles.navySmallDot} />
                  <Text style={styles.statusPillRemainingText}>{remainingTaskCount} Remaining</Text>
                </View>
              </View>
            </View>

            {/* Group Section Header */}
            <View style={styles.groupSectionHeader}>
              <View style={styles.groupHeaderLeft}>
                <View style={styles.petInitialsBox}>
                  <Text style={styles.petInitialsText}>
                    {primaryPet.name ? primaryPet.name.slice(0, 2).toUpperCase() : 'BM'}
                  </Text>
                </View>
                <View style={styles.groupHeaderTextCol}>
                  <View style={styles.groupPetNameRow}>
                    <Text style={styles.groupPetNameText}>{primaryPet.name}</Text>
                    <View style={styles.groupBreedChip}>
                      <Text style={styles.groupBreedChipText}>{primaryPet.breed}</Text>
                    </View>
                  </View>
                  <Text style={styles.groupServiceSubtext} numberOfLines={1}>
                    {serviceName}
                  </Text>
                </View>
              </View>
              <Sparkles size={18} color="#74777F" />
            </View>

            {/* Task Items List */}
            <View style={styles.taskListContainer}>
              {isLoadingTasks ? (
                <View style={{ padding: 24, alignItems: 'center' }}>
                  <ActivityIndicator size="small" color="#0B2A4A" />
                  <Text style={{ marginTop: 8, fontSize: 13, color: '#43474E' }}>
                    Đang tải danh sách công việc...
                  </Text>
                </View>
              ) : (
                tasks.map((task) => {
                  const isDone = task.status === 'DONE';
                  const isSkipped = task.status === 'SKIPPED';

                  if (isDone) {
                    return (
                      <View key={task.id} style={styles.taskDoneCard}>
                        <View style={styles.taskDoneStripe} />
                        <View style={styles.taskCardInner}>
                          <View style={styles.taskCardHeaderRow}>
                            <View style={{ flex: 1, minWidth: 0 }}>
                              <View style={styles.doneBadgeRow}>
                                <View style={styles.doneBadgePill}>
                                  <Check size={11} color="#00A472" strokeWidth={3} />
                                  <Text style={styles.doneBadgeText}>
                                    Done · {task.completedAt || '09:15'}
                                  </Text>
                                </View>
                              </View>
                              <Text style={styles.taskDoneTitleText}>{task.title}</Text>
                            </View>
                            <View style={styles.verifiedCircle}>
                              <CheckCircle2 size={18} color="#00A472" />
                            </View>
                          </View>

                          {task.note ? (
                            <View style={styles.taskNoteBox}>
                              <Edit3 size={14} color="#74777F" style={{ marginTop: 2 }} />
                              <Text style={styles.taskNoteItalicText}>"{task.note}"</Text>
                            </View>
                          ) : null}
                        </View>
                      </View>
                    );
                  }

                  if (isSkipped) {
                    return (
                      <View key={task.id} style={styles.taskSkippedCard}>
                        <View style={styles.taskSkippedStripe} />
                        <View style={styles.taskCardInner}>
                          <View style={styles.taskCardHeaderRow}>
                            <View style={{ flex: 1, minWidth: 0 }}>
                              <View style={styles.skippedBadgeRow}>
                                <View style={styles.skippedBadgePill}>
                                  <MinusCircle size={12} color="#7B5800" strokeWidth={2.5} />
                                  <Text style={styles.skippedBadgeText}>Skipped</Text>
                                </View>
                              </View>
                              <Text style={styles.taskSkippedTitleText}>{task.title}</Text>
                            </View>
                            <View style={styles.infoCircle}>
                              <Info size={18} color="#7B5800" />
                            </View>
                          </View>

                          {task.note ? (
                            <View style={styles.taskNoteBox}>
                              <Info size={14} color="#7B5800" style={{ marginTop: 2 }} />
                              <Text style={styles.taskNoteItalicText}>"{task.note}"</Text>
                            </View>
                          ) : null}
                        </View>
                      </View>
                    );
                  }

                  // Pending State (Active with Mark Done & Add Note actions)
                  return (
                    <View key={task.id} style={styles.taskPendingCard}>
                      <View style={styles.taskCardInner}>
                        <View style={styles.taskCardHeaderRow}>
                          <View style={{ flex: 1, minWidth: 0 }}>
                            <View style={styles.pendingBadgeRow}>
                              <View style={styles.pendingBadgePill}>
                                <View style={styles.pendingGrayDot} />
                                <Text style={styles.pendingBadgeText}>Pending</Text>
                              </View>
                            </View>
                            <Text style={styles.taskPendingTitleText}>{task.title}</Text>
                          </View>
                          <TouchableOpacity
                            style={styles.moreOptionsBtn}
                            onPress={() => handleOpenSkipModal(task)}
                            activeOpacity={0.7}
                          >
                            <MoreHorizontal size={18} color="#74777F" />
                          </TouchableOpacity>
                        </View>

                        {task.note ? (
                          <View style={styles.taskNoteBox}>
                            <Edit3 size={14} color="#74777F" style={{ marginTop: 2 }} />
                            <Text style={styles.taskNoteItalicText}>"{task.note}"</Text>
                          </View>
                        ) : null}

                        {/* Action buttons row */}
                        <View style={styles.pendingActionsRow}>
                          <TouchableOpacity
                            style={styles.addNoteBtn}
                            onPress={() => handleOpenNoteModal(task)}
                            activeOpacity={0.8}
                          >
                            <Edit3 size={15} color="#0B1C30" />
                            <Text style={styles.addNoteBtnText}>Add Note</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.markDoneBtn}
                            onPress={() => handleMarkTaskDone(task)}
                            activeOpacity={0.85}
                          >
                            <CheckCircle2 size={16} color="#FFFFFF" />
                            <Text style={styles.markDoneBtnText}>Mark Done</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  );
                })
              )}
            </View>

            <View style={{ height: 110 }} />
          </View>
        )}

        {/* ============================================================ */}
        {/* GIAI ĐOẠN 3: UPLOAD EVIDENCE HÌNH ẢNH SAU KHI XONG DỊCH VỤ (STITCH DESIGN) */}
        {/* ============================================================ */}
        {currentStep === 3 && (
          <View style={styles.stageContent}>
            {/* 1. Pet & Service Context Card (Matching upload_evidence) */}
            <View style={styles.evidencePetContextCard}>
              <View style={styles.evidencePetRow}>
                <View style={styles.evidencePetAvatarWrapper}>
                  <Image
                    source={{ uri: primaryPet.avatar_url }}
                    style={styles.evidencePetAvatarImg}
                  />
                  <View style={styles.evidencePetPawBadge}>
                    <Sparkles size={11} color="#00A472" />
                  </View>
                </View>

                <View style={styles.evidencePetInfoCol}>
                  <View style={styles.evidencePetNameRow}>
                    <Text style={styles.evidencePetNameText} numberOfLines={1}>
                      {primaryPet.name}
                    </Text>
                    <View style={styles.evidenceBreedChip}>
                      <Text style={styles.evidenceBreedChipText}>
                        {primaryPet.breed} • {primaryPet.weight}kg
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.evidenceServiceText} numberOfLines={1}>
                    {serviceName}
                  </Text>

                  {/* Checklist Completion Status */}
                  <View style={styles.checklistStatusRow}>
                    <View style={styles.checklistCompletedBadge}>
                      <CheckCircle2 size={13} color="#005236" />
                      <Text style={styles.checklistCompletedBadgeText}>
                        Checklist completed
                      </Text>
                    </View>
                    <Text style={styles.tasksProcessedText}>
                      {completedTaskCount}/{tasks.length} tasks processed
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* 2. Before Service Reference (Read-only) (Ảnh đối chiếu) */}
            <View style={styles.beforeServiceCard}>
              <View style={styles.beforeServiceHeader}>
                <View style={styles.beforeHeaderLeft}>
                  <View style={styles.historyIconBox}>
                    <History size={16} color="#0B2A4A" />
                  </View>
                  <Text style={styles.beforeHeaderTitle}>
                    Before Service (Ảnh đối chiếu)
                  </Text>
                </View>

              </View>

              <Text style={styles.beforeServiceSubtitle}>
                Ảnh ghi nhận lúc tiếp nhận để đối chiếu chất lượng hoàn thành.
              </Text>

              {/* Horizontal Scroll Initial Photos */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.beforePhotoScrollContent}
              >
                {initialPhotos.map((photo) => (
                  <View key={photo.id} style={styles.beforePhotoThumbnailCard}>
                    <View style={styles.beforePhotoImgWrapper}>
                      <Image
                        source={{ uri: photo.uri }}
                        style={styles.beforePhotoImg}
                      />
                      <View style={styles.initialTagBadge}>
                        <Text style={styles.initialTagText}>INITIAL</Text>
                      </View>
                    </View>
                    <View style={styles.beforePhotoInfo}>
                      <Text style={styles.beforePhotoCaption} numberOfLines={1}>
                        {photo.caption}
                      </Text>
                      <Text style={styles.beforePhotoMeta}>
                        {photo.category || '08:58 • Toàn thân'}
                      </Text>
                    </View>
                  </View>
                ))}

                {/* Reference Notice Card */}
                <View style={styles.referenceNoticeCard}>
                  <Lock size={20} color="#74777F" style={{ marginBottom: 6 }} />
                  <Text style={styles.referenceNoticeText}>
                    Chỉ dùng đối chiếu thị giác
                  </Text>
                </View>
              </ScrollView>
            </View>

            {/* 3. Main Section: Completion Evidence */}
            <View style={styles.evidenceMainSection}>
              {/* Title & Subtitle */}
              <View style={styles.evidenceTitleRow}>
                <Text style={styles.evidenceTitleText}>Completion Evidence</Text>
                <Text style={styles.requiredAsterisk}>*</Text>
                <Text style={styles.evidenceTitleSub}>(Minh chứng hoàn tất)</Text>
              </View>
              <Text style={styles.evidenceDescText}>
                Take clear photos showing the result after completing the service.
              </Text>

              {/* Helper Guidance Banner */}
              <View style={styles.guidanceBanner}>
                <Camera
                  size={20}
                  color="#466083"
                  style={{ marginTop: 2, marginRight: 8 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.guidanceTitle}>
                    Chụp ảnh kết quả đạt chuẩn
                  </Text>
                  <Text style={styles.guidanceDesc}>
                    Chụp toàn thân sau khi chải chuốt và các chi tiết như kẽ chân, vệ sinh tai, form lông gọn gàng.
                  </Text>
                </View>
              </View>

              {/* Action Buttons: Take Photo & Gallery */}
              <View style={styles.photoActionButtonsRow}>
                <TouchableOpacity
                  style={styles.takePhotoButtonDark}
                  onPress={handleTakePhotoEvidence}
                  activeOpacity={0.88}
                >
                  <Camera size={19} color="#FFFFFF" />
                  <Text style={styles.takePhotoButtonDarkText}>Take Photo</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.galleryButtonLight}
                  onPress={handlePickGalleryEvidence}
                  activeOpacity={0.88}
                >
                  <ImageIcon size={19} color="#0B2A4A" />
                  <Text style={styles.galleryButtonLightText}>Gallery</Text>
                </TouchableOpacity>
              </View>

              {/* Format Hint */}
              <View style={styles.formatInfoRow}>
                <Info size={13} color="#74777F" />
                <Text style={styles.formatInfoText}>
                  PNG, JPEG, JPG, WEBP • Max 10 MB/ảnh • multipart: file
                </Text>
              </View>

              {/* Completion Photo Cards */}
              <View style={styles.completionPhotosContainer}>
                {completionPhotos.map((photo) => (
                  <View key={photo.id} style={styles.completionPhotoCard}>
                    <View style={styles.completionPhotoImgBox}>
                      <Image
                        source={{ uri: photo.uri }}
                        style={styles.completionPhotoImg}
                      />
                      {/* Delete Button */}
                      <TouchableOpacity
                        style={styles.deletePhotoCircleBtn}
                        onPress={() => handleRemoveCompletionPhoto(photo.id)}
                        activeOpacity={0.8}
                      >
                        <X size={15} color="#FFFFFF" strokeWidth={2.5} />
                      </TouchableOpacity>

                      {/* Uploaded Badge */}
                      <View style={styles.uploadedCheckmarkBadge}>
                        <CheckCircle2 size={13} color="#00A472" />
                        <Text style={styles.uploadedCheckmarkText}>
                          Uploaded ✓
                        </Text>
                      </View>
                    </View>

                    {/* Card Body with Caption & Edit */}
                    <View style={styles.completionCardBody}>
                      <View style={styles.captionEditRow}>
                        <View style={styles.captionLeft}>
                          <Tag size={15} color="#466083" />
                          <Text
                            style={styles.photoCaptionTitle}
                            numberOfLines={1}
                          >
                            {photo.caption}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => handleOpenCaptionModal(photo)}
                          style={styles.editCaptionBtn}
                          activeOpacity={0.7}
                        >
                          <Edit3 size={15} color="#74777F" />
                        </TouchableOpacity>
                      </View>

                      <View style={styles.completionCardMetaRow}>
                        <Text style={styles.photoMetaText}>
                          COMPLETION • {photo.size || '3.0 MB'}
                        </Text>
                        <Text style={styles.photoMetaText}>
                          {photo.timestamp || 'Vừa chụp'}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>

              {/* Upload Summary Indicator */}
              <View style={styles.uploadSummaryBox}>
                <View style={styles.uploadSummaryLeft}>
                  <CheckCircle2 size={18} color="#00A472" />
                  <Text style={styles.uploadSummaryCountText}>
                    {completionPhotos.length} photos uploaded
                  </Text>
                </View>
                <View style={styles.recommendedPill}>
                  <Text style={styles.recommendedPillText}>
                    1 minimum • 2–4 recommended
                  </Text>
                </View>
              </View>

              {/* Evidence Quality Tips Card */}
              <View style={styles.tipsCard}>
                <View style={styles.tipsCardHeader}>
                  <Lightbulb size={18} color="#7B5800" />
                  <Text style={styles.tipsCardTitle}>
                    Tips for good evidence (Kinh nghiệm chụp)
                  </Text>
                </View>
                <View style={styles.tipsList}>
                  <View style={styles.tipItem}>
                    <CheckCircle2
                      size={15}
                      color="#00A472"
                      style={{ marginTop: 2 }}
                    />
                    <Text style={styles.tipText}>
                      <Text style={styles.tipBold}>
                        Use clear, well-lit photos:{' '}
                      </Text>
                      Đầy đủ ánh sáng, rõ nét, không bị rung mờ máy ảnh.
                    </Text>
                  </View>
                  <View style={styles.tipItem}>
                    <CheckCircle2
                      size={15}
                      color="#00A472"
                      style={{ marginTop: 2 }}
                    />
                    <Text style={styles.tipText}>
                      <Text style={styles.tipBold}>Show completed result:{' '} </Text>
                      Bao quát toàn diện kết quả sau khi thực hiện dịch vụ.
                    </Text>
                  </View>
                  <View style={styles.tipItem}>
                    <CheckCircle2
                      size={15}
                      color="#00A472"
                      style={{ marginTop: 2 }}
                    />
                    <Text style={styles.tipText}>
                      <Text style={styles.tipBold}>
                        Capture relevant details:{' '}
                      </Text>
                      Cận cảnh các vùng nhạy cảm hoặc vết cắt tỉa đặc thù đã yêu cầu.
                    </Text>
                  </View>
                </View>
              </View>

              {/* Provider Final Notes for customer */}
              <View style={styles.providerNoteWrapper}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionHeadingText}>
                    Lời nhắn / Ghi chú gửi kèm khách hàng
                  </Text>
                  <Text style={styles.charCounterText}>
                    {providerFinalNote.length} / 500
                  </Text>
                </View>
                <View style={styles.textAreaBox}>
                  <TextInput
                    style={styles.textAreaInput}
                    multiline
                    numberOfLines={3}
                    value={providerFinalNote}
                    onChangeText={setProviderFinalNote}
                    placeholder="Ghi chú thêm về bé hoặc lưu ý dặn dò sau chăm sóc..."
                    placeholderTextColor="#74777F"
                  />
                </View>
              </View>
            </View>

            <View style={{ height: 110 }} />
          </View>
        )}

        {/* ============================================================ */}
        {/* GIAI ĐOẠN 4: REVIEW & SUBMIT (STITCH REVIEW_SUBMIT DESIGN) */}
        {/* ============================================================ */}
        {currentStep === 4 && (
          <View style={styles.stageContent}>
            {!isWaitingForCustomerReview ? (
              // Stage 4A: Pre-submit full review
              <View style={styles.stage4SummaryContainer}>
                {/* 1. Pet & Appointment Context Card */}
                <View style={styles.evidencePetContextCard}>
                  <View style={styles.evidencePetRow}>
                    <View style={styles.evidencePetAvatarWrapper}>
                      <Image
                        source={{ uri: primaryPet.avatar_url }}
                        style={styles.evidencePetAvatarImg}
                      />
                      <View style={styles.evidencePetPawBadge}>
                        <Sparkles size={11} color="#00A472" />
                      </View>
                    </View>

                    <View style={styles.evidencePetInfoCol}>
                      <View style={styles.evidencePetNameRow}>
                        <Text style={styles.evidencePetNameText} numberOfLines={1}>
                          {primaryPet.name}
                        </Text>
                        <View style={styles.evidenceBreedChip}>
                          <Text style={styles.evidenceBreedChipText}>
                            {primaryPet.breed} · {primaryPet.weight} kg
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.evidenceServiceText} numberOfLines={1}>
                        {serviceName}
                      </Text>

                      <View style={styles.timeScheduleRow}>
                        <Clock size={14} color="#74777F" />
                        <Text style={styles.reviewScheduleText}>09:00 – 10:30 (Hôm nay)</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* 2. Checklist Summary Card */}
                <View style={styles.reviewCard}>
                  <View style={styles.reviewCardHeaderRow}>
                    <View style={styles.reviewHeaderLeft}>
                      <View style={styles.historyIconBox}>
                        <ListChecks size={18} color="#0B2A4A" />
                      </View>
                      <Text style={styles.reviewCardTitle}>Service Checklist</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => setCurrentStep(2)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.viewDetailLinkText}>View Checklist</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Status Badges 3-col Grid */}
                  <View style={styles.checklistStatsGrid}>
                    <View style={styles.checklistStatColDone}>
                      <Text style={styles.checklistStatNumDone}>{completedTaskCount}</Text>
                      <Text style={styles.checklistStatLabelDone}>Completed</Text>
                    </View>
                    <View style={styles.checklistStatColSkipped}>
                      <Text style={styles.checklistStatNumSkipped}>{skippedTaskCount}</Text>
                      <Text style={styles.checklistStatLabelSkipped}>Skipped</Text>
                    </View>
                    <View style={styles.checklistStatColPending}>
                      <Text style={styles.checklistStatNumPending}>{remainingTaskCount}</Text>
                      <Text style={styles.checklistStatLabelPending}>Pending</Text>
                    </View>
                  </View>

                  {/* Summary progress bar text */}
                  <View style={styles.checklistProcessedRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                      <CheckCircle2 size={16} color="#00A472" />
                      <Text style={styles.checklistProcessedText} numberOfLines={2}>
                        Tất cả {tasks.length} nhiệm vụ quy trình dịch vụ đã được xử lý xong.
                      </Text>
                    </View>
                    <View style={styles.processedBadge}>
                      <Text style={styles.processedBadgeText}>{taskProgressPercentage}% processed</Text>
                    </View>
                  </View>
                </View>

                {/* 3. Before Service Evidence (Ảnh lúc tiếp nhận - Read-only) */}
                <View style={styles.reviewCard}>
                  <View style={styles.reviewCardHeaderRow}>
                    <View>
                      <Text style={styles.reviewCardTitle}>Before Service (Ảnh lúc tiếp nhận)</Text>
                      <Text style={styles.reviewCardSubtitle}>Minh chứng tình trạng ban đầu của thú cưng</Text>
                    </View>
                  </View>

                  <View style={styles.beforePhotosGrid}>
                    {initialPhotos.slice(0, 2).map((photo) => (
                      <View key={photo.id} style={styles.beforePhotoGridItem}>
                        <Image source={{ uri: photo.uri }} style={styles.beforePhotoImg2} />
                        <View style={styles.photoOverlayFooter}>
                          <Text style={styles.photoOverlayTitle} numberOfLines={1}>
                            {photo.caption}
                          </Text>
                          <Text style={styles.photoOverlayTime}>
                            {photo.category?.split('•')[0]?.trim() || '08:58'}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>

                {/* 4. After Service Evidence (Minh chứng hoàn tất) */}
                <View style={styles.reviewCard}>
                  <View style={styles.reviewCardHeaderRow}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.reviewCardTitle}>After Service (Minh chứng hoàn tất)</Text>
                        <View style={styles.photoCountPill}>
                          <Text style={styles.photoCountPillText}>
                            {completionPhotos.length} photos
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.reviewCardSubtitle}>Minh chứng kết quả grooming hoàn thiện</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => setCurrentStep(3)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.viewDetailLinkText}>Edit Photos</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.afterPhotosGrid}>
                    {completionPhotos.map((photo) => (
                      <View key={photo.id} style={styles.afterPhotoGridItem}>
                        <Image source={{ uri: photo.uri }} style={styles.afterPhotoImg} />
                        <View style={styles.afterPhotoMetaBar}>
                          <CheckCircle2 size={13} color="#00A472" />
                          <Text style={styles.afterPhotoMetaCaption} numberOfLines={1}>
                            {photo.caption}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>

                {/* 5. Handover Note (Ghi chú bàn giao) */}
                <View style={styles.reviewCard}>
                  <View style={styles.reviewCardHeaderRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Edit3 size={17} color="#0B2A4A" />
                      <Text style={styles.reviewCardTitle}>Handover Note (Ghi chú bàn giao)</Text>
                    </View>
                    <View style={styles.readOnlyBadge}>
                      <Text style={styles.readOnlyBadgeText}>Tùy chọn</Text>
                    </View>
                  </View>

                  <View style={styles.handoverTextAreaBox}>
                    <TextInput
                      style={styles.handoverTextInput}
                      multiline
                      numberOfLines={3}
                      value={providerFinalNote}
                      onChangeText={setProviderFinalNote}
                      placeholder="Nhập ghi chú quan sát sức khỏe, thái độ hoặc khuyến nghị cho chủ nuôi..."
                      placeholderTextColor="#74777F"
                    />
                    <View style={styles.handoverFooterRow}>
                      <Text style={styles.handoverCounterText}>
                        {providerFinalNote.length} / 1000 ký tự
                      </Text>
                      <CheckCircle2 size={15} color="#00A472" />
                    </View>
                  </View>

                  <View style={styles.handoverInfoCallout}>
                    <Info size={15} color="#0B2A4A" style={{ marginTop: 1 }} />
                    <Text style={styles.handoverInfoText}>
                      Ghi chú này sẽ được hiển thị trên báo cáo dịch vụ để khách hàng xem và xác nhận.
                    </Text>
                  </View>
                </View>

                {/* 6. Ready to Submit Summary Card */}
                <View style={styles.reviewCard}>
                  <View style={styles.reviewCardHeaderRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <ClipboardCheck size={18} color="#7B5800" />
                      <Text style={styles.reviewCardTitle}>Ready to Submit</Text>
                    </View>
                    <View style={styles.readyBadge}>
                      <Text style={styles.readyBadgeText}>Sẵn sàng gửi duyệt</Text>
                    </View>
                  </View>

                  <View style={styles.readyKeyValuesList}>
                    <View style={styles.readyRow}>
                      <Text style={styles.readyRowLabel}>Pet</Text>
                      <Text style={styles.readyRowVal}>
                        {primaryPet.name} ({primaryPet.breed}, {primaryPet.weight}kg)
                      </Text>
                    </View>
                    <View style={styles.readyRowDivider} />
                    <View style={styles.readyRow}>
                      <Text style={styles.readyRowLabel}>Service</Text>
                      <Text style={styles.readyRowVal}>{serviceName}</Text>
                    </View>
                    <View style={styles.readyRowDivider} />
                    <View style={styles.readyRow}>
                      <Text style={styles.readyRowLabel}>Checklist</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Text style={styles.readyRowVal}>
                          {completedTaskCount} done · {skippedTaskCount} skipped
                        </Text>
                        <CheckCircle2 size={14} color="#00A472" />
                      </View>
                    </View>
                    <View style={styles.readyRowDivider} />
                    <View style={styles.readyRow}>
                      <Text style={styles.readyRowLabel}>Completion Evidence</Text>
                      <Text style={styles.readyRowVal}>
                        {completionPhotos.length} photos (COMPLETION)
                      </Text>
                    </View>
                    <View style={styles.readyRowDivider} />
                    <View style={styles.readyRow}>
                      <Text style={styles.readyRowLabel}>Handover Note</Text>
                      <Text style={[styles.readyRowVal, { color: '#00A472' }]}>Added ✓</Text>
                    </View>
                  </View>
                </View>
              </View>
            ) : (
              // Stage 4B: Interactive Post-Submission Success State (Matching Stitch design)
              <View style={styles.waitingContainer}>
                <View style={styles.waitingCard}>
                  <View style={styles.successIconCircleBig}>
                    <Check size={36} color="#00301E" strokeWidth={3.5} />
                  </View>

                  <Text style={styles.successTitleText}>Service Submitted</Text>

                  <View style={styles.awaitingBadge}>
                    <Text style={styles.awaitingBadgeText}>
                      Waiting for Customer Confirmation
                    </Text>
                  </View>

                  <Text style={styles.successDescText}>
                    Kết quả buổi spa của <Text style={{ fontWeight: '700', color: '#0B1C30' }}>{primaryPet.name}</Text> đã được gửi tới khách hàng. Bạn sẽ nhận thông báo ngay khi chủ nuôi duyệt hoàn tất.
                  </Text>

                  {/* Timeline Tracker */}
                  <View style={styles.timelineBox}>
                    <View style={styles.timelineItem}>
                      <View style={styles.timelineCheckCircle}>
                        <Check size={14} color="#FFFFFF" strokeWidth={3} />
                      </View>
                      <View style={styles.timelineTextCol}>
                        <Text style={styles.timelineItemTitle}>1. Check-in lúc tiếp nhận</Text>
                        <Text style={styles.timelineItemDesc}>Đã lưu {initialPhotos.length} hình ảnh ban đầu & ghi chú</Text>
                      </View>
                    </View>

                    <View style={styles.timelineItem}>
                      <View style={styles.timelineCheckCircle}>
                        <Check size={14} color="#FFFFFF" strokeWidth={3} />
                      </View>
                      <View style={styles.timelineTextCol}>
                        <Text style={styles.timelineItemTitle}>2. Thực hiện checklist</Text>
                        <Text style={styles.timelineItemDesc}>
                          Đã xử lý {completedTaskCount}/{tasks.length} danh mục công việc ({taskProgressPercentage}%)
                        </Text>
                      </View>
                    </View>

                    <View style={styles.timelineItem}>
                      <View style={styles.timelineCheckCircle}>
                        <Check size={14} color="#FFFFFF" strokeWidth={3} />
                      </View>
                      <View style={styles.timelineTextCol}>
                        <Text style={styles.timelineItemTitle}>3. Minh chứng hoàn thành</Text>
                        <Text style={styles.timelineItemDesc}>
                          Đã gửi {completionPhotos.length} ảnh kết quả rõ nét
                        </Text>
                      </View>
                    </View>

                    <View style={styles.timelineItem}>
                      <View style={styles.timelineActiveCircle}>
                        <Clock size={14} color="#FDBF35" />
                      </View>
                      <View style={styles.timelineTextCol}>
                        <Text style={[styles.timelineItemTitle, { color: '#0B2A4A', fontWeight: '700' }]}>
                          4. Chờ khách hàng review & xác nhận
                        </Text>
                        <Text style={styles.timelineItemDesc}>
                          Tiền công sẽ tự động giải phóng vào ví của bạn sau khi khách hàng xác nhận hài lòng.
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Actions matching Stitch design */}
                  <TouchableOpacity
                    style={styles.backJobsPrimaryBtn}
                    onPress={() => router.replace('/(provider)/(tabs)/jobs' as any)}
                    activeOpacity={0.88}
                  >
                    <Text style={styles.backJobsPrimaryBtnText}>Back to My Jobs</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.messageCustomerBtn}
                    onPress={() => {
                      Alert.alert(
                        'Nhắn tin khách hàng',
                        `Đang kết nối tin nhắn đến khách hàng ${customerName}...`
                      );
                    }}
                    activeOpacity={0.8}
                  >
                    <MessageSquare size={17} color="#0B2A4A" />
                    <Text style={styles.messageCustomerBtnText}>Message Customer</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            <View style={{ height: 110 }} />
          </View>
        )}
      </ScrollView>

      {/* ============================================================ */}
      {/* STICKY BOTTOM ACTION BAR */}
      {/* ============================================================ */}
      {!isWaitingForCustomerReview && (
        <View style={styles.stickyBottomBar}>
          {currentStep === 1 && (
            <>
              <View style={styles.bottomStatusChip}>
                <CheckCircle size={14} color="#00A472" />
                <Text style={styles.bottomStatusChipText}>
                  ✓ Initial condition documented ({initialPhotos.length} photos attached)
                </Text>
              </View>

              <TouchableOpacity
                style={styles.primaryCtaBtn}
                onPress={() => setIsConfirmStartModalVisible(true)}
                activeOpacity={0.9}
              >
                <Text style={styles.primaryCtaBtnText}>Start Service</Text>
                <ArrowRight size={20} color="#001C38" strokeWidth={2.5} />
              </TouchableOpacity>

              <Text style={styles.ctaFootnote}>
                Nhấn bắt đầu sẽ cập nhật trạng thái lịch hẹn sang{' '}
                <Text style={{ fontWeight: '700', color: '#0B1C30' }}>
                  Đang thực hiện (IN_PROGRESS)
                </Text>
              </Text>
            </>
          )}

          {currentStep === 2 && (
            <>
              <View style={styles.checklistBottomStatusRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Clock size={15} color="#43474E" />
                  <Text style={styles.bottomStatusNoticeText}>
                    {remainingTaskCount > 0
                      ? `${remainingTaskCount} tasks remaining`
                      : 'All tasks completed'}
                  </Text>
                </View>

                {remainingTaskCount > 0 && (
                  <TouchableOpacity onPress={handleMarkAllTasksDone}>
                    <Text style={styles.quickMarkAllText}>Hoàn tất tất cả</Text>
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                style={styles.primaryCtaBtn}
                onPress={() => setCurrentStep(3)}
                activeOpacity={0.9}
              >
                <Text style={styles.primaryCtaBtnText}>
                  Continue to Evidence →
                </Text>
                <ArrowRight size={20} color="#001C38" strokeWidth={2.5} />
              </TouchableOpacity>
            </>
          )}

          {currentStep === 3 && (
            <>
              {/* Validation Status Banner */}
              <View style={styles.stage3StatusBanner}>
                <ShieldCheck size={16} color="#00A472" />
                <Text style={styles.stage3StatusBannerText}>
                  Completion evidence ready ({completionPhotos.length} photos uploaded)
                </Text>
              </View>

              {/* Primary Action CTA Button: Explicitly 'Continue to Review' */}
              <TouchableOpacity
                style={styles.primaryCtaBtn}
                onPress={handleProceedToConfirmation}
                activeOpacity={0.9}
              >
                <Text style={styles.primaryCtaBtnText}>
                  Continue to Review
                </Text>
                <ArrowRight size={20} color="#001C38" strokeWidth={2.5} />
              </TouchableOpacity>

              {/* Explanatory Context Subtext */}
              <Text style={styles.ctaFootnote}>
                Bước kế tiếp: Xem lại toàn bộ thông tin & ký xác nhận bàn giao (Step 4 of 4)
              </Text>
            </>
          )}

          {currentStep === 4 && (
            <>
              <View style={styles.sendNoticeRow}>
                <Send size={15} color="#0B2A4A" />
                <Text style={styles.sendNoticeText}>
                  Kết quả dịch vụ sẽ được gửi đến khách hàng để xác nhận.
                </Text>
              </View>

              <TouchableOpacity
                style={styles.primaryCtaBtn}
                onPress={() => setIsSubmitConfirmationModalVisible(true)}
                disabled={isSubmitting}
                activeOpacity={0.9}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#001C38" />
                ) : (
                  <>
                    <Text style={styles.primaryCtaBtnText}>
                      Send for Customer Confirmation
                    </Text>
                    <ArrowRight size={20} color="#001C38" strokeWidth={2.5} />
                  </>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      )}

      {/* ============================================================ */}
      {/* CONFIRMATION BOTTOM SHEET MODAL (STEP 1: START SERVICE) */}
      {/* ============================================================ */}
      <Modal
        visible={isConfirmStartModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsConfirmStartModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheetCard}>
            <View style={styles.sheetHandle} />

            <View style={styles.modalHeaderRow}>
              <View style={styles.modalIconBox}>
                <Sparkles size={24} color="#6E4F00" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalSheetTitle}>Start this service?</Text>
                <Text style={styles.modalSheetSubtitle}>
                  Make sure the pet’s initial condition has been documented before beginning.
                </Text>
              </View>
            </View>

            {/* Summary Mini-Card */}
            <View style={styles.miniSummaryCard}>
              <View style={styles.miniSummaryRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={16} color="#00A472" />
                  <Text style={styles.miniSummaryLabel}>Photos Documented</Text>
                </View>
                <Text style={styles.miniSummaryValue}>
                  {initialPhotos.length} photos uploaded
                </Text>
              </View>

              <View style={styles.noteDivider} />

              <View style={styles.miniSummaryRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={16} color="#00A472" />
                  <Text style={styles.miniSummaryLabel}>Initial Condition Note</Text>
                </View>
                <Text style={styles.miniSummaryValue}>
                  Notes added ({petConditionNote.length} chars)
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.modalButtonsStack}>
              <TouchableOpacity
                style={styles.confirmStartBtn}
                onPress={handleConfirmStartService}
                disabled={isSubmitting}
                activeOpacity={0.88}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#001C38" />
                ) : (
                  <>
                    <Text style={styles.confirmStartBtnText}>Start Service</Text>
                    <ArrowRight size={18} color="#001C38" />
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelModalBtn}
                onPress={() => setIsConfirmStartModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelModalBtnText}>Go Back</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ============================================================ */}
      {/* ADD TASK NOTE MODAL (STEP 2: CHECKLIST) */}
      {/* ============================================================ */}
      <Modal
        visible={isNoteModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsNoteModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheetCard}>
            <View style={styles.sheetHandle} />

            <View style={styles.modalHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalSheetTitle}>Add Task Note</Text>
                <Text style={styles.modalSheetSubtitle} numberOfLines={2}>
                  {selectedTaskForModal?.title || 'Task title'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseCircle}
                onPress={() => setIsNoteModalVisible(false)}
              >
                <X size={18} color="#43474E" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalInputBox}>
              <TextInput
                style={styles.modalTextInput}
                multiline
                numberOfLines={3}
                value={taskNoteInput}
                onChangeText={setTaskNoteInput}
                placeholder="Add an observation or note about this task..."
                placeholderTextColor="#74777F"
                autoFocus
              />
            </View>

            <View style={styles.modalTwoButtonsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsNoteModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleSaveTaskNote}
                activeOpacity={0.85}
              >
                <Text style={styles.modalSaveBtnText}>Save Note</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ============================================================ */}
      {/* SKIP TASK MODAL (STEP 2: CHECKLIST) */}
      {/* ============================================================ */}
      <Modal
        visible={isSkipModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsSkipModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheetCard}>
            <View style={styles.sheetHandle} />

            <View style={styles.modalHeaderRow}>
              <View style={styles.modalWarningIconBox}>
                <AlertTriangle size={22} color="#7B5800" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalSheetTitle}>Skip this task?</Text>
                <Text style={styles.modalSheetSubtitle} numberOfLines={2}>
                  Add a note explaining why this task could not be completed.
                </Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseCircle}
                onPress={() => setIsSkipModalVisible(false)}
              >
                <X size={18} color="#43474E" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalInputBox}>
              <TextInput
                style={styles.modalTextInput}
                multiline
                numberOfLines={3}
                value={taskSkipReasonInput}
                onChangeText={setTaskSkipReasonInput}
                placeholder="Reason for skipping (e.g., Pet showed signs of stress, owner requested skip)..."
                placeholderTextColor="#74777F"
                autoFocus
              />
            </View>

            <View style={styles.modalTwoButtonsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsSkipModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSkipConfirmBtn}
                onPress={handleConfirmSkipTask}
                activeOpacity={0.85}
              >
                <Text style={styles.modalSkipConfirmBtnText}>Skip Task</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ============================================================ */}
      {/* EDIT PHOTO CAPTION MODAL (STEP 3: EVIDENCE) */}
      {/* ============================================================ */}
      <Modal
        visible={isCaptionModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsCaptionModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheetCard}>
            <View style={styles.sheetHandle} />

            <View style={styles.modalHeaderRow}>
              <View style={styles.modalCaptionIconBox}>
                <Tag size={20} color="#0B2A4A" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalSheetTitle}>Sửa chú thích ảnh</Text>
                <Text style={styles.modalSheetSubtitle}>
                  Thêm mô tả cho bức ảnh hoàn tất để khách hàng xem
                </Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseCircle}
                onPress={() => setIsCaptionModalVisible(false)}
              >
                <X size={18} color="#43474E" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalInputBox}>
              <TextInput
                style={styles.modalTextInput}
                multiline
                numberOfLines={3}
                value={photoCaptionInput}
                onChangeText={setPhotoCaptionInput}
                placeholder="Nhập chú thích ảnh..."
                placeholderTextColor="#74777F"
                autoFocus
              />
            </View>

            <View style={styles.modalTwoButtonsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsCaptionModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelBtnText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleSavePhotoCaption}
                activeOpacity={0.85}
              >
                <Text style={styles.modalSaveBtnText}>Lưu chú thích</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ============================================================ */}
      {/* CONFIRMATION BOTTOM SHEET MODAL (STEP 4: SUBMIT SERVICE) */}
      {/* ============================================================ */}
      <Modal
        visible={isSubmitConfirmationModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsSubmitConfirmationModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheetCard}>
            <View style={styles.sheetHandle} />

            <View style={styles.modalHeaderRow}>
              <View style={styles.modalIconBoxGold}>
                <ClipboardCheck size={22} color="#7B5800" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalSheetTitle}>Submit completed service?</Text>
                <Text style={styles.modalSheetSubtitle}>
                  Kiểm tra thông tin chi tiết trước khi gửi kết quả cho chủ nuôi xem xét.
                </Text>
              </View>
            </View>

            {/* Quick checklist recap */}
            <View style={styles.recapCardBox}>
              <View style={styles.recapItemRow}>
                <CheckCircle2 size={16} color="#00A472" />
                <Text style={styles.recapItemText}>
                  Checklist: {taskProgressPercentage}% nhiệm vụ đã xử lý ({completedTaskCount} hoàn thành, {skippedTaskCount} bỏ qua)
                </Text>
              </View>
              <View style={styles.recapItemRow}>
                <CheckCircle2 size={16} color="#00A472" />
                <Text style={styles.recapItemText}>
                  Minh chứng: {completionPhotos.length} ảnh hoàn tất chất lượng cao
                </Text>
              </View>
              <View style={styles.recapItemRow}>
                <CheckCircle2 size={16} color="#00A472" />
                <Text style={styles.recapItemText}>
                  Ghi chú bàn giao: Đã sẵn sàng gửi khách
                </Text>
              </View>
            </View>

            {/* Explicit State Notice */}
            <View style={styles.explicitNoticeCard}>
              <AlertTriangle size={18} color="#7B5800" style={{ marginTop: 1 }} />
              <Text style={styles.explicitNoticeText}>
                Sau khi gửi, trạng thái sẽ chuyển thành{' '}
                <Text style={{ fontWeight: '700', color: '#5D4200' }}>Waiting for Customer Confirmation</Text>.
                Đơn sẽ hoàn tất khi khách hàng kiểm tra và xác nhận.
              </Text>
            </View>

            {/* Action Buttons Row */}
            <View style={styles.modalTwoButtonsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsSubmitConfirmationModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelBtnText}>Go Back</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmSendBtn}
                onPress={handleSubmitCompletion}
                disabled={isSubmitting}
                activeOpacity={0.88}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#001C38" />
                ) : (
                  <>
                    <Text style={styles.modalConfirmSendBtnText}>Send Now</Text>
                    <Send size={16} color="#001C38" />
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8F9FF',
  },
  header: {
    height: 60,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(248, 249, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#EFF4FF',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF4FF',
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0B2A4A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleCol: {
    marginLeft: 4,
  },
  headerMainTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0B1C30',
  },
  headerStepBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#43474E',
    letterSpacing: 0.5,
  },
  headerRightAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#00152D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 24,
  },

  /* Stepper */
  stepperContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
    gap: 8,
  },
  bookingStatusPillBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(220, 233, 255, 0.6)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusPillLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  amberPulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FDBF35',
  },
  bookingCodeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0B2A4A',
  },
  dotSeparator: {
    fontSize: 11,
    color: '#74777F',
  },
  inProgressBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#7B5800',
    letterSpacing: 0.5,
  },
  stepCounterText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#43474E',
  },
  stepperInner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#0B2A4A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  stepperLineBg: {
    position: 'absolute',
    left: 36,
    right: 36,
    top: 28,
    height: 2,
    backgroundColor: '#DCE9FF',
    zIndex: 0,
  },
  stepperLineActive: {
    position: 'absolute',
    left: 36,
    top: 28,
    height: 2,
    backgroundColor: '#00A472',
    zIndex: 0,
  },
  stepItem: {
    alignItems: 'center',
    gap: 4,
    zIndex: 1,
    width: 70,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#C4C6CF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: '#FDBF35',
    borderColor: '#FDBF35',
    shadowColor: '#FDBF35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 3,
  },
  stepCircleCompleted: {
    backgroundColor: '#00301E',
    borderColor: '#00301E',
  },
  stepActiveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0B2A4A',
  },
  stepPendingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#C4C6CF',
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#43474E',
    textAlign: 'center',
  },
  stepLabelActive: {
    color: '#0B1C30',
    fontWeight: '800',
  },
  stepLabelCompleted: {
    color: '#00A472',
    fontWeight: '700',
  },

  stageContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 12,
  },

  /* Pet & Appointment Context Card (Step 1) */
  contextCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    shadowColor: '#0B2A4A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    gap: 10,
  },
  contextCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  petAvatarWrapper: {
    width: 62,
    height: 62,
    borderRadius: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  petAvatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  petPawBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#0B2A4A',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderTopLeftRadius: 6,
  },
  petInfoCol: {
    flex: 1,
    gap: 2,
  },
  petNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  petNameText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0B1C30',
  },
  petBreedTag: {
    backgroundColor: '#DCE9FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  petBreedTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0B2A4A',
  },
  serviceNameText: {
    fontSize: 13,
    color: '#43474E',
    marginTop: 1,
  },
  timeScheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  timeScheduleText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#7B5800',
  },
  statusChipRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#EFF4FF',
    paddingTop: 8,
  },
  acceptedStatusBadge: {
    backgroundColor: '#DCE9FF',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  acceptedStatusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0B2A4A',
    letterSpacing: 0.5,
  },

  /* Important Pet Notes Section */
  notesSection: {
    gap: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionHeadingText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0B1C30',
  },
  careAlertBadge: {
    backgroundColor: '#FFDEA5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  careAlertText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#261900',
  },
  notesCardBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    gap: 10,
    shadowColor: '#0B2A4A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  noteItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  noteIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EFF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  noteTextCol: {
    flex: 1,
    gap: 2,
  },
  noteTitleDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  noteTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0B1C30',
  },
  amberDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#7B5800',
  },
  noteDesc: {
    fontSize: 12,
    color: '#43474E',
    lineHeight: 18,
  },
  noteDivider: {
    height: 1,
    backgroundColor: '#EFF4FF',
    width: '100%',
  },

  /* Service Location Card */
  locationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    shadowColor: '#0B2A4A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  locationIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#DCE9FF',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  locationTextCol: {
    flex: 1,
    gap: 2,
  },
  locationLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#43474E',
    letterSpacing: 0.5,
  },
  locationAddress: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0B1C30',
  },
  detectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  greenPulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#00A472',
  },
  detectedText: {
    fontSize: 11,
    color: '#43474E',
  },

  /* Photos Hero Section */
  photosSection: {
    gap: 8,
  },
  photosCountBadge: {
    backgroundColor: '#00301E',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  photosCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00A472',
  },
  sectionSubtitleText: {
    fontSize: 12,
    color: '#43474E',
  },
  calloutCard: {
    backgroundColor: '#DCE9FF',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  calloutIcon: {
    fontSize: 16,
    marginTop: -1,
  },
  calloutText: {
    fontSize: 12,
    color: '#0B1C30',
    lineHeight: 18,
    flex: 1,
  },
  calloutBold: {
    fontWeight: '700',
  },
  photoActionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  takePhotoButton: {
    flex: 1,
    height: 46,
    backgroundColor: '#0B2A4A',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#0B2A4A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  takePhotoButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  galleryButton: {
    flex: 1,
    height: 46,
    backgroundColor: '#D3E4FE',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  galleryButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0B1C30',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  photoGridItem: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    gap: 6,
    shadowColor: '#0B2A4A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  photoImageWrapper: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#EFF4FF',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  photoDeleteBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(11, 42, 74, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoUploadedBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: '#00301E',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  photoUploadedText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#00A472',
  },
  photoCaptionText: {
    fontSize: 11,
    color: '#0B1C30',
    fontWeight: '600',
  },

  /* Initial Condition Note Section */
  conditionNoteSection: {
    gap: 6,
  },
  optionalTag: {
    fontSize: 11,
    color: '#74777F',
  },
  charCounterText: {
    fontSize: 11,
    color: '#74777F',
  },
  textAreaBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#0B2A4A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  textAreaInput: {
    fontSize: 13,
    color: '#0B1C30',
    minHeight: 65,
    textAlignVertical: 'top',
  },

  /* ============================================================ */
  /* GIAI ĐOẠN 2: CHECKLIST DESIGN STYLES (STITCH SHOW_CHECKLIST) */
  /* ============================================================ */
  checklistContextBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  checkTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkTitleHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0B1C30',
    letterSpacing: -0.2,
  },
  bookingCodeBadge: {
    backgroundColor: '#D3E4FE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  bookingCodeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0B2A4A',
  },
  checkSubtitleText: {
    fontSize: 12,
    color: '#43474E',
    marginTop: 2,
  },
  inProgressPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF4FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  inProgressPulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#FDBF35',
  },
  inProgressPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0B1C30',
    letterSpacing: 0.5,
  },

  /* Real-time Progress Card */
  checklistSummaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    gap: 10,
    shadowColor: '#0B2A4A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  checklistProgressHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  realtimeTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#43474E',
    letterSpacing: 0.6,
  },
  taskCountHeading: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0B1C30',
    marginTop: 2,
  },
  largePercentText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0B2A4A',
  },
  progressBarWrapper: {
    marginVertical: 4,
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EFF4FF',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FDBF35',
    borderRadius: 4,
  },
  statusPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 4,
  },
  statusPillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF4FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  statusPillText: {
    fontSize: 11,
    color: '#0B1C30',
    fontWeight: '600',
  },
  statusPillRemaining: {
    marginLeft: 'auto',
    backgroundColor: '#EFF4FF',
  },
  navySmallDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0B2A4A',
  },
  statusPillRemainingText: {
    fontSize: 11,
    color: '#0B1C30',
    fontWeight: '700',
  },

  /* Group Section Header */
  groupSectionHeader: {
    backgroundColor: 'rgba(220, 233, 255, 0.6)',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  groupHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  petInitialsBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#0B2A4A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  petInitialsText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  groupHeaderTextCol: {
    flex: 1,
  },
  groupPetNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  groupPetNameText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0B1C30',
  },
  groupBreedChip: {
    backgroundColor: '#D3E4FE',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 999,
  },
  groupBreedChipText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#43474E',
  },
  groupServiceSubtext: {
    fontSize: 11,
    color: '#43474E',
    marginTop: 1,
  },

  /* Task Cards Container */
  taskListContainer: {
    gap: 10,
  },

  /* Task State 1: DONE Card */
  taskDoneCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    shadowColor: '#0B2A4A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  taskDoneStripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    backgroundColor: '#00A472',
  },
  taskCardInner: {
    padding: 14,
    paddingLeft: 16,
    gap: 10,
  },
  taskCardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  doneBadgeRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  doneBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF4FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  doneBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#00A472',
  },
  taskDoneTitleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0B1C30',
    lineHeight: 20,
  },
  verifiedCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EFF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  /* Task State 2: PENDING Card */
  taskPendingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    shadowColor: '#0B2A4A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  pendingBadgeRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  pendingBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF4FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  pendingGrayDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#74777F',
  },
  pendingBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#43474E',
  },
  taskPendingTitleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0B1C30',
    lineHeight: 20,
  },
  moreOptionsBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF4FF',
    flexShrink: 0,
  },
  pendingActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 4,
  },
  addNoteBtn: {
    height: 42,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#EFF4FF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addNoteBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0B1C30',
  },
  markDoneBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#0B2A4A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#0B2A4A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  markDoneBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* Task State 3: SKIPPED Card */
  taskSkippedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    shadowColor: '#0B2A4A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    position: 'relative',
    overflow: 'hidden',
    opacity: 0.95,
  },
  taskSkippedStripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    backgroundColor: '#FDBF35',
  },
  skippedBadgeRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  skippedBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF4FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  skippedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7B5800',
  },
  taskSkippedTitleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0B1C30',
    lineHeight: 20,
  },
  infoCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EFF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  /* Attached Task Note */
  taskNoteBox: {
    backgroundColor: '#EFF4FF',
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 2,
  },
  taskNoteItalicText: {
    fontSize: 12,
    color: '#43474E',
    fontStyle: 'italic',
    lineHeight: 18,
    flex: 1,
  },

  /* Step 2 Bottom Sticky Row */
  checklistBottomStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  bottomStatusNoticeText: {
    fontSize: 12,
    color: '#43474E',
    fontWeight: '600',
  },
  quickMarkAllText: {
    fontSize: 12,
    color: '#0B2A4A',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },

  /* ============================================================ */
  /* GIAI ĐOẠN 3: UPLOAD EVIDENCE STITCH DESIGN STYLES */
  /* ============================================================ */
  evidencePetContextCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#0B2A4A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  evidencePetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  evidencePetAvatarWrapper: {
    width: 60,
    height: 60,
    borderRadius: 12,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#EFF4FF',
  },
  evidencePetAvatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  evidencePetPawBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#00301E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  evidencePetInfoCol: {
    flex: 1,
    gap: 2,
  },
  evidencePetNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  evidencePetNameText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0B2A4A',
  },
  evidenceBreedChip: {
    backgroundColor: '#DCE9FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  evidenceBreedChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0B2A4A',
  },
  evidenceServiceText: {
    fontSize: 13,
    color: '#43474E',
    marginTop: 1,
  },
  checklistStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  checklistCompletedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF4FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  checklistCompletedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#005236',
  },
  tasksProcessedText: {
    fontSize: 11,
    color: '#74777F',
    fontWeight: '500',
  },

  /* Before Service Reference (Read-only) */
  beforeServiceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    gap: 8,
    shadowColor: '#0B2A4A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  beforeServiceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  beforeHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  historyIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#EFF4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  beforeHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0B2A4A',
  },
  readOnlyBadge: {
    backgroundColor: '#EFF4FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  readOnlyBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#43474E',
  },
  beforeServiceSubtitle: {
    fontSize: 12,
    color: '#74777F',
  },
  beforePhotoScrollContent: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 4,
  },
  beforePhotoThumbnailCard: {
    width: 142,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#EFF4FF',
    shadowColor: '#0B2A4A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  beforePhotoImgWrapper: {
    width: '100%',
    height: 96,
    position: 'relative',
    backgroundColor: '#DCE9FF',
  },
  beforePhotoImg: {
    width: '100%',
    height: '100%',
  },
  initialTagBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0, 21, 45, 0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  initialTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  beforePhotoInfo: {
    padding: 8,
    gap: 1,
  },
  beforePhotoCaption: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0B2A4A',
  },
  beforePhotoMeta: {
    fontSize: 10,
    color: '#74777F',
  },
  referenceNoticeCard: {
    width: 120,
    height: 142,
    borderRadius: 12,
    backgroundColor: '#EFF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  referenceNoticeText: {
    fontSize: 11,
    color: '#74777F',
    textAlign: 'center',
    fontWeight: '500',
  },

  /* Completion Evidence Section */
  evidenceMainSection: {
    gap: 10,
  },
  evidenceTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  evidenceTitleText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0B2A4A',
  },
  requiredAsterisk: {
    fontSize: 18,
    fontWeight: '800',
    color: '#BA1A1A',
  },
  evidenceTitleSub: {
    fontSize: 12,
    color: '#43474E',
  },
  evidenceDescText: {
    fontSize: 12,
    color: '#74777F',
    marginTop: -4,
  },
  guidanceBanner: {
    backgroundColor: 'rgba(220, 233, 255, 0.6)',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  guidanceTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0B2A4A',
  },
  guidanceDesc: {
    fontSize: 12,
    color: '#43474E',
    lineHeight: 17,
    marginTop: 2,
  },
  takePhotoButtonDark: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#0B2A4A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#0B2A4A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  takePhotoButtonDarkText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  galleryButtonLight: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE9FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  galleryButtonLightText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0B2A4A',
  },
  formatInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 2,
  },
  formatInfoText: {
    fontSize: 11,
    color: '#74777F',
    fontWeight: '500',
  },

  /* Completion Photo Cards */
  completionPhotosContainer: {
    gap: 12,
  },
  completionPhotoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#0B2A4A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  completionPhotoImgBox: {
    width: '100%',
    height: 190,
    position: 'relative',
    backgroundColor: '#EFF4FF',
  },
  completionPhotoImg: {
    width: '100%',
    height: '100%',
  },
  deletePhotoCircleBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 21, 45, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadedCheckmarkBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: '#00301E',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  uploadedCheckmarkText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#00A472',
  },
  completionCardBody: {
    padding: 12,
    gap: 4,
  },
  captionEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  captionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  photoCaptionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0B2A4A',
    flex: 1,
  },
  editCaptionBtn: {
    padding: 4,
  },
  completionCardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  photoMetaText: {
    fontSize: 11,
    color: '#74777F',
  },

  /* Upload Summary Box */
  uploadSummaryBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#0B2A4A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  uploadSummaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  uploadSummaryCountText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0B2A4A',
  },
  recommendedPill: {
    backgroundColor: '#EFF4FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  recommendedPillText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#43474E',
  },

  /* Tips Card */
  tipsCard: {
    backgroundColor: 'rgba(220, 233, 255, 0.45)',
    borderRadius: 16,
    padding: 14,
    gap: 8,
  },
  tipsCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tipsCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0B2A4A',
  },
  tipsList: {
    gap: 6,
    paddingTop: 2,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  tipText: {
    fontSize: 12,
    color: '#43474E',
    flex: 1,
    lineHeight: 17,
  },
  tipBold: {
    fontWeight: '700',
    color: '#0B2A4A',
  },

  /* Provider Note Wrapper */
  providerNoteWrapper: {
    gap: 6,
    marginTop: 4,
  },

  /* Stage 3 Bottom Status Banner */
  stage3StatusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 2,
  },
  stage3StatusBannerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#005236',
  },

  /* Caption Modal Icon Box */
  modalCaptionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#DCE9FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Step 4 Review & Confirmation Styles (Stitch Design: review_submit) */
  stage4SummaryContainer: {
    gap: 12,
  },
  reviewScheduleText: {
    fontSize: 12,
    color: '#74777F',
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#0B2A4A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  reviewCardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  reviewHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reviewCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0B1C30',
  },
  reviewCardSubtitle: {
    fontSize: 12,
    color: '#74777F',
    marginTop: 2,
  },
  viewDetailLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0B2A4A',
  },

  /* Checklist Stats 3-Col Grid */
  checklistStatsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  checklistStatColDone: {
    flex: 1,
    backgroundColor: 'rgba(0, 164, 114, 0.12)',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checklistStatNumDone: {
    fontSize: 18,
    fontWeight: '800',
    color: '#00301E',
  },
  checklistStatLabelDone: {
    fontSize: 11,
    fontWeight: '700',
    color: '#005236',
    marginTop: 2,
  },
  checklistStatColSkipped: {
    flex: 1,
    backgroundColor: 'rgba(253, 191, 53, 0.22)',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checklistStatNumSkipped: {
    fontSize: 18,
    fontWeight: '800',
    color: '#7B5800',
  },
  checklistStatLabelSkipped: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5D4200',
    marginTop: 2,
  },
  checklistStatColPending: {
    flex: 1,
    backgroundColor: '#EFF4FF',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checklistStatNumPending: {
    fontSize: 18,
    fontWeight: '800',
    color: '#74777F',
  },
  checklistStatLabelPending: {
    fontSize: 11,
    fontWeight: '700',
    color: '#43474E',
    marginTop: 2,
  },

  checklistProcessedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EFF4FF',
    padding: 10,
    borderRadius: 12,
    gap: 8,
  },
  checklistProcessedText: {
    fontSize: 12,
    color: '#0B1C30',
  },
  processedBadge: {
    backgroundColor: '#6FFBBE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  processedBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00190E',
  },

  /* Before Photos Grid */
  beforePhotosGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  beforePhotoGridItem: {
    flex: 1,
    height: 110,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#E5EEFF',
  },
  beforePhotoImg2: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoOverlayFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 21, 45, 0.72)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  photoOverlayTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 4,
  },
  photoOverlayTime: {
    fontSize: 11,
    fontWeight: '600',
    color: '#D3E4FF',
  },

  /* After Photos Grid */
  photoCountPill: {
    backgroundColor: 'rgba(111, 251, 190, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  photoCountPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00301E',
  },
  afterPhotosGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  afterPhotoGridItem: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#EFF4FF',
    borderWidth: 1,
    borderColor: '#DCE9FF',
  },
  afterPhotoImg: {
    width: '100%',
    height: 115,
    resizeMode: 'cover',
  },
  afterPhotoMetaBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 6,
    backgroundColor: '#EFF4FF',
  },
  afterPhotoMetaCaption: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0B1C30',
    flex: 1,
  },

  /* Handover Note */
  handoverTextAreaBox: {
    backgroundColor: '#EFF4FF',
    borderRadius: 12,
    padding: 10,
  },
  handoverTextInput: {
    fontSize: 13,
    color: '#0B1C30',
    minHeight: 70,
    textAlignVertical: 'top',
  },
  handoverFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  handoverCounterText: {
    fontSize: 11,
    color: '#74777F',
  },
  handoverInfoCallout: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: '#EFF4FF',
    padding: 10,
    borderRadius: 10,
    marginTop: 8,
  },
  handoverInfoText: {
    fontSize: 11,
    color: '#43474E',
    flex: 1,
    lineHeight: 16,
  },

  /* Ready to Submit Summary Card */
  readyBadge: {
    backgroundColor: 'rgba(253, 191, 53, 0.35)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  readyBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6E4F00',
  },
  readyKeyValuesList: {
    marginTop: 4,
  },
  readyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  readyRowDivider: {
    height: 1,
    backgroundColor: '#EFF4FF',
  },
  readyRowLabel: {
    fontSize: 12,
    color: '#43474E',
  },
  readyRowVal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0B1C30',
  },

  /* Step 4 Waiting for Customer Review / Post Submission */
  waitingContainer: {
    paddingVertical: 10,
  },
  waitingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#0B2A4A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  successIconCircleBig: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#6FFBBE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    shadowColor: '#00A472',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  successTitleText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0B1C30',
  },
  awaitingBadge: {
    backgroundColor: 'rgba(253, 191, 53, 0.4)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  awaitingBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6E4F00',
  },
  successDescText: {
    fontSize: 13,
    color: '#43474E',
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 8,
  },
  timelineBox: {
    width: '100%',
    backgroundColor: '#F8F9FF',
    borderRadius: 12,
    padding: 14,
    gap: 14,
    marginTop: 4,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  timelineCheckCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#00A472',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  timelineActiveCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#0B2A4A',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  timelineTextCol: {
    flex: 1,
    gap: 1,
  },
  timelineItemTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0B1C30',
  },
  timelineItemDesc: {
    fontSize: 11,
    color: '#74777F',
  },
  backJobsPrimaryBtn: {
    width: '100%',
    height: 48,
    backgroundColor: '#00152D',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  backJobsPrimaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  messageCustomerBtn: {
    width: '100%',
    height: 44,
    backgroundColor: '#EFF4FF',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  messageCustomerBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0B2A4A',
  },

  /* Step 4 Sticky Bottom Bar Notice */
  sendNoticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 2,
  },
  sendNoticeText: {
    fontSize: 12,
    color: '#43474E',
  },

  /* Step 4 Submit Modal Specific Styles */
  modalIconBoxGold: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFDEA5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recapCardBox: {
    backgroundColor: '#EFF4FF',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  recapItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recapItemText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0B1C30',
    flex: 1,
  },
  explicitNoticeCard: {
    backgroundColor: 'rgba(253, 191, 53, 0.25)',
    borderRadius: 12,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  explicitNoticeText: {
    fontSize: 12,
    color: '#5D4200',
    flex: 1,
    lineHeight: 17,
  },
  modalConfirmSendBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#FDBF35',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  modalConfirmSendBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#001C38',
  },

  /* Sticky Bottom Action Bar */
  stickyBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderTopWidth: 1,
    borderTopColor: '#EFF4FF',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 32 : 14,
    gap: 8,
    shadowColor: '#0B2A4A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 10,
  },
  bottomStatusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 48, 30, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'center',
  },
  bottomStatusChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00A472',
  },
  primaryCtaBtn: {
    height: 48,
    backgroundColor: '#FDBF35',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#FDBF35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryCtaBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#001C38',
  },
  ctaFootnote: {
    fontSize: 10,
    textAlign: 'center',
    color: '#43474E',
  },

  /* Modals */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 21, 45, 0.65)',
    justifyContent: 'flex-end',
  },
  modalSheetCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 38 : 20,
    gap: 14,
  },
  sheetHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D3E4FE',
    alignSelf: 'center',
    marginBottom: 4,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalIconBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: 'rgba(253, 191, 53, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalWarningIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFDEA5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0B1C30',
  },
  modalSheetSubtitle: {
    fontSize: 12,
    color: '#43474E',
    marginTop: 2,
  },
  modalInputBox: {
    backgroundColor: '#EFF4FF',
    borderRadius: 12,
    padding: 12,
  },
  modalTextInput: {
    fontSize: 13,
    color: '#0B1C30',
    minHeight: 70,
    textAlignVertical: 'top',
  },
  modalTwoButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  modalCancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#EFF4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0B1C30',
  },
  modalSaveBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#0B2A4A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSaveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalSkipConfirmBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#FDBF35',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSkipConfirmBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#261900',
  },
  miniSummaryCard: {
    backgroundColor: '#EFF4FF',
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  miniSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  miniSummaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00A472',
  },
  miniSummaryValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0B1C30',
  },
  modalButtonsStack: {
    gap: 8,
    marginTop: 4,
  },
  confirmStartBtn: {
    height: 48,
    backgroundColor: '#FDBF35',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  confirmStartBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#001C38',
  },
  cancelModalBtn: {
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelModalBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#43474E',
  },
});
