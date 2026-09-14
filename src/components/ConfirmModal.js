import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export const ConfirmModal = ({ visible, title, message, onConfirm, onCancel, loading = false }) => {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.iconContainer}>
            <Ionicons name="warning-outline" size={32} color={colors.danger} />
          </View>
          <Text style={styles.title}>{title || 'Confirmar Exclusão'}</Text>
          <Text style={styles.message}>{message || 'Esta ação não poderá ser desfeita.'}</Text>
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={onCancel}
              disabled={loading}
              style={[styles.button, styles.cancelButton]}
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              disabled={loading}
              style={[styles.button, styles.deleteButton]}
            >
              <Text style={styles.deleteText}>{loading ? 'Excluindo...' : 'Excluir'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modal: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.dangerLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
    textAlign: 'center'
  },
  message: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%'
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cancelButton: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: colors.border
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary
  },
  deleteButton: {
    backgroundColor: colors.danger
  },
  deleteText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF'
  }
});
