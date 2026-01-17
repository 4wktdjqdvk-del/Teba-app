import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import Modal from 'react-native-modal';
import ConfirmDialog from '../../components/ConfirmDialog';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const { login, loginAsGuest } = useAuth();
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t('common.error'), isRTL ? 'يرجى ملء جميع الحقول' : 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(email.toLowerCase().trim(), password);
      router.replace('/(tabs)/home');
    } catch (error: any) {
      Alert.alert(
        isRTL ? 'فشل تسجيل الدخول' : 'Login Failed', 
        error.response?.data?.detail || (isRTL ? 'بيانات غير صحيحة' : 'Invalid credentials')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    if (!guestName || !guestEmail || !guestPhone) {
      Alert.alert(t('common.error'), isRTL ? 'يرجى ملء جميع الحقول' : 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await loginAsGuest(guestName, guestEmail.toLowerCase().trim(), guestPhone);
      setShowGuestModal(false);
      router.replace('/(tabs)/home');
    } catch (error) {
      Alert.alert(t('common.error'), isRTL ? 'فشل المتابعة كضيف' : 'Failed to continue as guest');
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContainer: {
      flexGrow: 1,
      padding: 20,
      justifyContent: 'center',
    },
    header: {
      alignItems: 'center',
      marginBottom: 40,
    },
    title: {
      fontSize: 22,
      fontWeight: 'bold',
      color: colors.primary,
      marginTop: 16,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      color: colors.textLight,
      marginTop: 8,
    },
    form: {
      width: '100%',
    },
    inputContainer: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 12,
      marginBottom: 16,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    icon: {
      marginRight: isRTL ? 0 : 12,
      marginLeft: isRTL ? 12 : 0,
    },
    input: {
      flex: 1,
      height: 50,
      fontSize: 16,
      color: colors.text,
      textAlign: isRTL ? 'right' : 'left',
    },
    button: {
      backgroundColor: colors.primary,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 8,
      marginBottom: 16,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: 'bold',
    },
    linkText: {
      textAlign: 'center',
      color: colors.textLight,
      fontSize: 14,
    },
    linkTextBold: {
      color: colors.primary,
      fontWeight: 'bold',
    },
    guestButton: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.card,
      padding: 16,
      borderRadius: 12,
      marginBottom: 16,
      borderWidth: 2,
      borderColor: colors.primary,
    },
    guestButtonText: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: 'bold',
      marginLeft: isRTL ? 0 : 8,
      marginRight: isRTL ? 8 : 0,
    },
    modal: {
      margin: 0,
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 24,
      maxHeight: '80%',
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
      textAlign: isRTL ? 'right' : 'left',
    },
    modalSubtitle: {
      fontSize: 14,
      color: colors.textLight,
      marginBottom: 20,
      textAlign: isRTL ? 'right' : 'left',
    },
    formGroup: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
      textAlign: isRTL ? 'right' : 'left',
    },
    modalInput: {
      backgroundColor: colors.background,
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      fontSize: 16,
      color: colors.text,
      textAlign: isRTL ? 'right' : 'left',
    },
    modalButtons: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 8,
    },
    modalButton: {
      flex: 1,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cancelButtonText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
    },
    confirmButton: {
      backgroundColor: colors.primary,
    },
    confirmButtonText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: 'bold',
    },
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Ionicons name="medical" size={80} color={colors.primary} />
          <Text style={styles.title}>{t('common.appName')}</Text>
          <Text style={styles.subtitle}>
            {isRTL ? 'مرحباً بعودتك' : 'Welcome Back'}
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color={colors.textLight} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder={t('common.email')}
              placeholderTextColor={colors.textLight}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.textLight} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder={t('common.password')}
              placeholderTextColor={colors.textLight}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? t('common.loading') : t('common.login')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.guestButton}
            onPress={() => setShowGuestModal(true)}
          >
            <Ionicons name="person-outline" size={20} color={colors.primary} />
            <Text style={styles.guestButtonText}>
              {isRTL ? 'حجز موعد كضيف' : 'Book Appointment as Guest'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.linkText}>
              {isRTL ? 'ليس لديك حساب؟ ' : "Don't have an account? "}
              <Text style={styles.linkTextBold}>{t('common.register')}</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        isVisible={showGuestModal}
        onBackdropPress={() => !loading && setShowGuestModal(false)}
        onBackButtonPress={() => !loading && setShowGuestModal(false)}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {isRTL ? 'حجز كضيف' : 'Book as Guest'}
          </Text>
          <Text style={styles.modalSubtitle}>
            {isRTL ? 'أدخل بياناتك لحجز موعد' : 'Enter your details to book an appointment'}
          </Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t('common.name')} *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder={isRTL ? 'اسمك الكامل' : 'Your name'}
              placeholderTextColor={colors.textLight}
              value={guestName}
              onChangeText={setGuestName}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t('common.email')} *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="your@email.com"
              placeholderTextColor={colors.textLight}
              value={guestEmail}
              onChangeText={setGuestEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t('common.phone')} *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="66868388"
              placeholderTextColor={colors.textLight}
              value={guestPhone}
              onChangeText={setGuestPhone}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowGuestModal(false)}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton, loading && styles.buttonDisabled]}
              onPress={handleGuestLogin}
              disabled={loading}
            >
              <Text style={styles.confirmButtonText}>
                {loading ? t('common.loading') : t('common.confirm')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
