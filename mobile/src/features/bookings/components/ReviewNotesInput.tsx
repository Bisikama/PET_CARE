import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { MessageSquareText, Plus } from 'lucide-react-native';
import { theme } from '@/core/theme';

interface ReviewNotesInputProps {
  notes: string;
  onChangeNotes: (text: string) => void;
}

const quickSuggestions = [
  'Bé sợ tiếng ồn lớn',
  'Nhẹ tay vùng tai & móng',
  'Da nhạy cảm, dùng sữa tắm dịu nhẹ',
  'Bé thích được vuốt cằm',
];

export function ReviewNotesInput({
  notes,
  onChangeNotes,
}: ReviewNotesInputProps) {
  const handleAddSuggestion = (suggestion: string) => {
    if (notes.includes(suggestion)) return;
    const newNotes = notes.trim()
      ? `${notes.trim()}, ${suggestion.toLowerCase()}`
      : suggestion;
    onChangeNotes(newNotes);
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleWrap}>
          <MessageSquareText size={18} color={theme.colors.secondary.onContainer} />
          <Text style={styles.titleText}>Ghi chú cho chuyên viên</Text>
        </View>
        <Text style={styles.optionalText}>Không bắt buộc</Text>
      </View>

      <View style={styles.inputWrap}>
        <TextInput
          style={styles.textInput}
          placeholder="Nhập thói quen, lưu ý sức khỏe hoặc dặn dò đặc biệt cho bé cưng của bạn..."
          placeholderTextColor={theme.colors.text.muted}
          value={notes}
          onChangeText={onChangeNotes}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      {/* Quick Suggestions */}
      <View style={styles.suggestionsSection}>
        <Text style={styles.suggestionsLabel}>GỢI Ý NHANH:</Text>
        <View style={styles.suggestionsChips}>
          {quickSuggestions.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.suggestionChip}
              onPress={() => handleAddSuggestion(item)}
              activeOpacity={0.7}
            >
              <Plus size={12} color={theme.colors.secondary.onContainer} />
              <Text style={styles.suggestionText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface.lowest,
    borderRadius: theme.radius.xl,
    padding: theme.spacing[4],
    borderWidth: 1,
    borderColor: theme.colors.border.subdued,
    ...theme.shadows.sm,
    gap: theme.spacing[3],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleText: {
    ...theme.typography.label,
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  optionalText: {
    ...theme.typography.bodySm,
    fontSize: 11,
    color: theme.colors.text.muted,
  },
  inputWrap: {
    backgroundColor: theme.colors.surface.subdued,
    borderRadius: theme.radius.lg,
    padding: theme.spacing[3],
    borderWidth: 1,
    borderColor: theme.colors.border.subdued,
    minHeight: 80,
  },
  textInput: {
    ...theme.typography.bodyMd,
    fontSize: 13,
    color: theme.colors.text.primary,
    padding: 0,
  },
  suggestionsSection: {
    gap: 6,
  },
  suggestionsLabel: {
    ...theme.typography.label,
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.text.muted,
    letterSpacing: 0.5,
  },
  suggestionsChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.surface.container,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: theme.radius.md,
  },
  suggestionText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.secondary.onContainer,
  },
});
