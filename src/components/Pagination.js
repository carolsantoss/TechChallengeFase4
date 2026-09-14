import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export const Pagination = ({ page, totalPages, total, onPageChange }) => {
  if (totalPages <= 1 && total <= 4) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => onPageChange(page - 1)}
        disabled={page <= 1}
        style={[styles.button, page <= 1 && styles.buttonDisabled]}
      >
        <Ionicons
          name="chevron-back"
          size={18}
          color={page <= 1 ? colors.textMuted : colors.primary}
        />
        <Text style={[styles.buttonText, page <= 1 && styles.buttonTextDisabled]}>
          Anterior
        </Text>
      </TouchableOpacity>

      <View style={styles.info}>
        <Text style={styles.pageInfo}>
          Página <Text style={styles.boldText}>{page}</Text> de{' '}
          <Text style={styles.boldText}>{totalPages || 1}</Text>
        </Text>
        {total !== undefined && (
          <Text style={styles.totalInfo}>({total} registros)</Text>
        )}
      </View>

      <TouchableOpacity
        onPress={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        style={[styles.button, page >= totalPages && styles.buttonDisabled]}
      >
        <Text style={[styles.buttonText, page >= totalPages && styles.buttonTextDisabled]}>
          Próxima
        </Text>
        <Ionicons
          name="chevron-forward"
          size={18}
          color={page >= totalPages ? colors.textMuted : colors.primary}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 8,
    marginTop: 8
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8
  },
  buttonDisabled: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0'
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary
  },
  buttonTextDisabled: {
    color: colors.textMuted
  },
  info: {
    alignItems: 'center'
  },
  pageInfo: {
    fontSize: 13,
    color: colors.textSecondary
  },
  boldText: {
    fontWeight: '700',
    color: colors.textPrimary
  },
  totalInfo: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2
  }
});
