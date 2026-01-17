import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { saveLanguage } from '../i18n/config';

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, isDark, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);

  const handleLanguageChange = () => {
    Alert.alert(
      'اللغة / Language',
      isRTL ? 'اختر اللغة' : 'Select Language',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: 'English',
          onPress: async () => {
            await saveLanguage('en');
            Alert.alert('Success', 'Language changed to English');
          },
        },
        {
          text: 'العربية',
          onPress: async () => {
            await saveLanguage('ar');
            Alert.alert('نجح', 'تم تغيير اللغة إلى العربية');
          },
        },
      ]
    );
  };

  const handleBackupData = () => {
    Alert.alert(
      isRTL ? 'نسخ احتياطي' : 'Backup Data',
      isRTL ? 'تصدير بيانات العيادة؟' : 'Export clinic data?',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: isRTL ? 'تصدير' : 'Export',
          onPress: () => {
            Alert.alert(
              t('common.success'),
              isRTL ? 'تم تصدير البيانات بنجاح!\nتحقق من مجلد التنزيلات.' : 'Data exported successfully!\nCheck your downloads folder.'
            );
          },
        },
      ]
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.primary,
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: 50,
      paddingBottom: 16,
      paddingHorizontal: 16,
    },
    backButton: {
      padding: 8,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.white,
    },
    placeholder: {
      width: 40,
    },
    contentContainer: {
      padding: 20,
      paddingBottom: 40,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 12,
      textAlign: isRTL ? 'right' : 'left',
    },
    settingCard: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
    },
    settingLeft: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      flex: 1,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: isRTL ? 0 : 16,
      marginLeft: isRTL ? 16 : 0,
    },
    settingTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
      textAlign: isRTL ? 'right' : 'left',
    },
    settingDescription: {
      fontSize: 12,
      color: colors.textLight,
      textAlign: isRTL ? 'right' : 'left',
    },
    infoCard: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
    },
    infoLabel: {
      fontSize: 14,
      color: colors.textLight,
    },
    infoValue: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings.title')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.clinicInfo')}</Text>
          
          <TouchableOpacity style={styles.settingCard}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="business" size={24} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.settingTitle}>{t('settings.clinicDetails')}</Text>
                <Text style={styles.settingDescription}>
                  {isRTL ? 'الاسم، العنوان، معلومات الاتصال' : 'Name, address, contact info'}
                </Text>
              </View>
            </View>
            <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={20} color={colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingCard}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="time" size={24} color={colors.secondary} />
              </View>
              <View>
                <Text style={styles.settingTitle}>{t('settings.workingHours')}</Text>
                <Text style={styles.settingDescription}>
                  {isRTL ? 'تعيين أوقات عمل العيادة' : 'Set clinic operating hours'}
                </Text>
              </View>
            </View>
            <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={20} color={colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingCard}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="images" size={24} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.settingTitle}>{t('settings.gallery')}</Text>
                <Text style={styles.settingDescription}>
                  {isRTL ? 'إدارة صور العيادة' : 'Manage clinic photos'}
                </Text>
              </View>
            </View>
            <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={20} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.notifications')}</Text>
          
          <View style={styles.settingCard}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="notifications" size={24} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.settingTitle}>{t('settings.pushNotifications')}</Text>
                <Text style={styles.settingDescription}>
                  {isRTL ? 'استلام إشعارات التطبيق' : 'Receive app notifications'}
                </Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="mail" size={24} color={colors.secondary} />
              </View>
              <View>
                <Text style={styles.settingTitle}>{t('settings.emailNotifications')}</Text>
                <Text style={styles.settingDescription}>
                  {isRTL ? 'إرسال رسائل المواعيد' : 'Send appointment emails'}
                </Text>
              </View>
            </View>
            <Switch
              value={emailNotifications}
              onValueChange={setEmailNotifications}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="chatbubbles" size={24} color={colors.success} />
              </View>
              <View>
                <Text style={styles.settingTitle}>{t('settings.smsNotifications')}</Text>
                <Text style={styles.settingDescription}>
                  {isRTL ? 'إرسال رسائل SMS للمواعيد' : 'Send appointment SMS'}
                </Text>
              </View>
            </View>
            <Switch
              value={smsNotifications}
              onValueChange={setSmsNotifications}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{isRTL ? 'النظام' : 'System'}</Text>
          
          <TouchableOpacity style={styles.settingCard} onPress={handleLanguageChange}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="language" size={24} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.settingTitle}>{t('settings.language')}</Text>
                <Text style={styles.settingDescription}>
                  {isRTL ? 'العربية' : 'English'}
                </Text>
              </View>
            </View>
            <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={20} color={colors.textLight} />
          </TouchableOpacity>

          <View style={styles.settingCard}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name={isDark ? 'sunny' : 'moon'} size={24} color={colors.secondary} />
              </View>
              <View>
                <Text style={styles.settingTitle}>{t('settings.darkMode')}</Text>
                <Text style={styles.settingDescription}>
                  {isDark ? (isRTL ? 'الوضع الداكن' : 'Dark mode') : (isRTL ? 'الوضع الفاتح' : 'Light mode')}
                </Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>

          <TouchableOpacity style={styles.settingCard} onPress={handleBackupData}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="download" size={24} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.settingTitle}>{t('settings.backupData')}</Text>
                <Text style={styles.settingDescription}>
                  {t('settings.exportData')}
                </Text>
              </View>
            </View>
            <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={20} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{isRTL ? 'حول' : 'About'}</Text>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>{isRTL ? 'إصدار التطبيق' : 'App Version'}</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>{isRTL ? 'آخر تحديث' : 'Last Updated'}</Text>
            <Text style={styles.infoValue}>{isRTL ? 'يناير 2026' : 'January 2026'}</Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>{isRTL ? 'رقم البناء' : 'Build Number'}</Text>
            <Text style={styles.infoValue}>100</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
