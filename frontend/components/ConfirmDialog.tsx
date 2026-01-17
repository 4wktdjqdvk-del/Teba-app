import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import Modal from 'react-native-modal';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ConfirmDialog({
  visible,
  title,
  message,
  confirmText,
  cancelText,
  confirmColor,
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) {
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const styles = StyleSheet.create({
    modal: {
      margin: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    container: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 24,
      width: '100%',
      maxWidth: 340,
      ...Platform.select({
        web: {
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        },
        default: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 10,
          elevation: 8,
        },
      }),
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 12,
      textAlign: isRTL ? 'right' : 'left',
    },
    message: {
      fontSize: 15,
      color: colors.textLight,
      marginBottom: 24,
      lineHeight: 22,
      textAlign: isRTL ? 'right' : 'left',
    },
    buttonContainer: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      gap: 12,
    },
    button: {
      flex: 1,
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelButton: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    confirmButton: {
      backgroundColor: confirmColor || colors.primary,
    },
    cancelText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    confirmText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.white,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
  });

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={loading ? undefined : onCancel}
      onBackButtonPress={loading ? undefined : onCancel}
      style={styles.modal}
      animationIn="zoomIn"
      animationOut="zoomOut"
      backdropOpacity={0.5}
    >
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
            disabled={loading}
          >
            <Text style={styles.cancelText}>
              {cancelText || t('common.cancel')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.button, 
              styles.confirmButton,
              loading && styles.buttonDisabled
            ]}
            onPress={onConfirm}
            disabled={loading}
          >
            <Text style={styles.confirmText}>
              {loading ? t('common.loading') : (confirmText || t('common.confirm'))}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
