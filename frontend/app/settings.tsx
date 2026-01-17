import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { saveLanguage } from '../i18n/config';
import { clinicAPI, offersAPI } from '../utils/api';

interface Offer {
  id: string;
  title: string;
  description: string;
  discount: string;
  valid_until: string;
}

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, isDark, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [clinicInfo, setClinicInfo] = useState<any>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [clinic, offersData] = await Promise.all([
        clinicAPI.getInfo(),
        offersAPI.getAll()
      ]);
      setClinicInfo(clinic);
      setOffers(offersData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleLanguageChange = (lang: 'ar' | 'en') => {
    saveLanguage(lang);
    Alert.alert(
      lang === 'ar' ? 'نجح' : 'Success',
      lang === 'ar' ? 'تم تغيير اللغة إلى العربية' : 'Language changed to English'
    );
  };

  const openURL = (url: string) => {
    try {
      Linking.canOpenURL(url).then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          if (typeof window !== 'undefined') {
            window.open(url, '_blank');
          }
        }
      });
    } catch (error) {
      console.error('Error opening URL:', error);
    }
  };

  const callPhone = (phone: string) => {
    const url = `tel:${phone}`;
    Linking.openURL(url).catch(() => {
      if (typeof window !== 'undefined') {
        window.location.href = url;
      }
    });
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
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
    },
    contactItem: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    contactItemLast: {
      borderBottomWidth: 0,
    },
    contactText: {
      flex: 1,
      fontSize: 14,
      color: colors.text,
      marginLeft: isRTL ? 0 : 12,
      marginRight: isRTL ? 12 : 0,
      textAlign: isRTL ? 'right' : 'left',
    },
    hoursRow: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    dayText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    timeText: {
      fontSize: 14,
      color: colors.textLight,
    },
    timeColumn: {
      alignItems: isRTL ? 'flex-start' : 'flex-end',
    },
    offerCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderLeftWidth: 4,
      borderLeftColor: colors.secondary,
    },
    offerTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 4,
      textAlign: isRTL ? 'right' : 'left',
    },
    offerDescription: {
      fontSize: 13,
      color: colors.textLight,
      marginBottom: 8,
      textAlign: isRTL ? 'right' : 'left',
    },
    offerFooter: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    discountBadge: {
      backgroundColor: colors.secondary,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 10,
    },
    discountText: {
      color: colors.white,
      fontSize: 12,
      fontWeight: 'bold',
    },
    validText: {
      fontSize: 11,
      color: colors.textLight,
    },
    languageContainer: {
      flexDirection: 'row',
      gap: 12,
    },
    languageButton: {
      flex: 1,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      borderWidth: 2,
    },
    languageButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    languageButtonInactive: {
      backgroundColor: colors.card,
      borderColor: colors.border,
    },
    languageText: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    languageTextActive: {
      color: colors.white,
    },
    languageTextInactive: {
      color: colors.text,
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
    emptyText: {
      fontSize: 14,
      color: colors.textLight,
      textAlign: 'center',
      padding: 20,
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

      <ScrollView 
        contentContainerStyle={styles.contentContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* معلومات المجمع */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{isRTL ? 'معلومات المجمع' : 'Clinic Information'}</Text>
          
          {clinicInfo && (
            <View style={styles.card}>
              <TouchableOpacity 
                style={styles.contactItem}
                onPress={() => callPhone(clinicInfo.phone)}
              >
                <Ionicons name="call" size={20} color={colors.primary} />
                <Text style={styles.contactText}>
                  {isRTL ? 'هاتف: ' : 'Phone: '}{clinicInfo.phone}
                </Text>
                <Ionicons name="open-outline" size={16} color={colors.textLight} />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.contactItem}
                onPress={() => callPhone(clinicInfo.mobile)}
              >
                <Ionicons name="phone-portrait" size={20} color={colors.secondary} />
                <Text style={styles.contactText}>
                  {isRTL ? 'جوال: ' : 'Mobile: '}{clinicInfo.mobile}
                </Text>
                <Ionicons name="open-outline" size={16} color={colors.textLight} />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.contactItem}
                onPress={() => openURL(`https://wa.me/974${clinicInfo.whatsapp}`)}
              >
                <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
                <Text style={styles.contactText}>
                  {isRTL ? 'واتساب: ' : 'WhatsApp: '}{clinicInfo.whatsapp}
                </Text>
                <Ionicons name="open-outline" size={16} color={colors.textLight} />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.contactItem}
                onPress={() => openURL(clinicInfo.instagram)}
              >
                <Ionicons name="logo-instagram" size={20} color="#E4405F" />
                <Text style={styles.contactText}>Instagram</Text>
                <Ionicons name="open-outline" size={16} color={colors.textLight} />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.contactItem}
                onPress={() => openURL(clinicInfo.facebook)}
              >
                <Ionicons name="logo-facebook" size={20} color="#1877F2" />
                <Text style={styles.contactText}>Facebook</Text>
                <Ionicons name="open-outline" size={16} color={colors.textLight} />
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.contactItem, styles.contactItemLast]}
                onPress={() => openURL(clinicInfo.google_maps)}
              >
                <Ionicons name="location" size={20} color={colors.error} />
                <Text style={styles.contactText}>
                  {isRTL ? 'الموقع: الدوحة، قطر' : 'Location: Doha, Qatar'}
                </Text>
                <Ionicons name="open-outline" size={16} color={colors.textLight} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* أوقات العمل */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{isRTL ? 'أوقات العمل' : 'Working Hours'}</Text>
          
          <View style={styles.card}>
            <View style={styles.hoursRow}>
              <Text style={styles.dayText}>{isRTL ? 'السبت - الخميس' : 'Saturday - Thursday'}</Text>
              <View style={styles.timeColumn}>
                <Text style={styles.timeText}>{isRTL ? '09:00 ص - 12:30 م' : '09:00 AM - 12:30 PM'}</Text>
                <Text style={styles.timeText}>{isRTL ? '04:00 م - 08:30 م' : '04:00 PM - 08:30 PM'}</Text>
              </View>
            </View>
            <View style={[styles.hoursRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.dayText}>{isRTL ? 'الجمعة' : 'Friday'}</Text>
              <Text style={[styles.timeText, { color: colors.error }]}>{isRTL ? 'مغلق' : 'Closed'}</Text>
            </View>
          </View>
        </View>

        {/* العروض */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{isRTL ? 'العروض الخاصة' : 'Special Offers'}</Text>
          
          {offers.length === 0 ? (
            <View style={styles.card}>
              <Text style={styles.emptyText}>
                {isRTL ? 'لا توجد عروض حالياً' : 'No offers available'}
              </Text>
            </View>
          ) : (
            offers.map((offer) => (
              <View key={offer.id} style={styles.offerCard}>
                <Text style={styles.offerTitle}>{offer.title}</Text>
                <Text style={styles.offerDescription}>{offer.description}</Text>
                <View style={styles.offerFooter}>
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>{offer.discount}</Text>
                  </View>
                  <Text style={styles.validText}>
                    {isRTL ? 'صالح حتى: ' : 'Valid until: '}{offer.valid_until}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* اللغة */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{isRTL ? 'اللغة' : 'Language'}</Text>
          
          <View style={styles.languageContainer}>
            <TouchableOpacity 
              style={[
                styles.languageButton,
                i18n.language === 'ar' ? styles.languageButtonActive : styles.languageButtonInactive
              ]}
              onPress={() => handleLanguageChange('ar')}
            >
              <Text style={[
                styles.languageText,
                i18n.language === 'ar' ? styles.languageTextActive : styles.languageTextInactive
              ]}>
                العربية
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.languageButton,
                i18n.language === 'en' ? styles.languageButtonActive : styles.languageButtonInactive
              ]}
              onPress={() => handleLanguageChange('en')}
            >
              <Text style={[
                styles.languageText,
                i18n.language === 'en' ? styles.languageTextActive : styles.languageTextInactive
              ]}>
                English
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* الوضع الليلي */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{isRTL ? 'المظهر' : 'Appearance'}</Text>
          
          <View style={styles.settingCard}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name={isDark ? 'sunny' : 'moon'} size={24} color={colors.secondary} />
              </View>
              <View>
                <Text style={styles.settingTitle}>{isRTL ? 'الوضع الليلي' : 'Dark Mode'}</Text>
                <Text style={styles.settingDescription}>
                  {isDark ? (isRTL ? 'مفعّل' : 'Enabled') : (isRTL ? 'غير مفعّل' : 'Disabled')}
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
        </View>

        {/* الإشعارات */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{isRTL ? 'الإشعارات' : 'Notifications'}</Text>
          
          <View style={styles.settingCard}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="notifications" size={24} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.settingTitle}>{isRTL ? 'إشعارات التطبيق' : 'Push Notifications'}</Text>
                <Text style={styles.settingDescription}>
                  {isRTL ? 'استلام إشعارات المواعيد' : 'Receive appointment notifications'}
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
                <Text style={styles.settingTitle}>{isRTL ? 'إشعارات البريد' : 'Email Notifications'}</Text>
                <Text style={styles.settingDescription}>
                  {isRTL ? 'استلام رسائل التأكيد' : 'Receive confirmation emails'}
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
        </View>

        {/* حول */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{isRTL ? 'حول التطبيق' : 'About App'}</Text>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>{isRTL ? 'الإصدار' : 'Version'}</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>{isRTL ? 'آخر تحديث' : 'Last Updated'}</Text>
            <Text style={styles.infoValue}>{isRTL ? 'يناير 2026' : 'January 2026'}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
