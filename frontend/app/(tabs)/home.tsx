import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  RefreshControl,
  I18nManager,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { clinicAPI, offersAPI } from '../../utils/api';
import { useTranslation } from 'react-i18next';

interface Offer {
  id: string;
  title: string;
  description: string;
  discount: string;
  valid_until: string;
}

export default function HomeScreen() {
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  const [clinicInfo, setClinicInfo] = useState<any>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchClinicInfo();
    fetchOffers();
  }, []);

  const fetchClinicInfo = async () => {
    try {
      const data = await clinicAPI.getInfo();
      setClinicInfo(data);
    } catch (error) {
      console.error('Error fetching clinic info:', error);
    }
  };

  const fetchOffers = async () => {
    try {
      const data = await offersAPI.getAll();
      setOffers(data);
    } catch (error) {
      console.error('Error fetching offers:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchClinicInfo(), fetchOffers()]);
    setRefreshing(false);
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
    try {
      const url = `tel:${phone}`;
      Linking.canOpenURL(url).then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          if (typeof window !== 'undefined') {
            window.location.href = url;
          }
        }
      });
    } catch (error) {
      console.error('Error calling:', error);
    }
  };

  const sendEmail = (email: string) => {
    try {
      const url = `mailto:${email}`;
      Linking.canOpenURL(url).then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          if (typeof window !== 'undefined') {
            window.location.href = url;
          }
        }
      });
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  const openWhatsApp = (phone: string) => {
    try {
      const url = `https://wa.me/974${phone}`;
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
      console.error('Error opening WhatsApp:', error);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    contentContainer: {
      padding: 20,
      paddingBottom: 40,
    },
    header: {
      alignItems: 'center',
      marginBottom: 20,
      backgroundColor: colors.card,
      padding: 24,
      borderRadius: 16,
    },
    clinicName: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.primary,
      marginTop: 12,
      textAlign: 'center',
    },
    tagline: {
      fontSize: 14,
      color: colors.textLight,
      marginTop: 4,
    },
    welcomeCard: {
      backgroundColor: colors.primary,
      padding: 20,
      borderRadius: 12,
      marginBottom: 20,
    },
    welcomeText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.white,
      textAlign: isRTL ? 'right' : 'left',
    },
    roleText: {
      fontSize: 12,
      color: colors.white,
      marginTop: 4,
      opacity: 0.9,
      textAlign: isRTL ? 'right' : 'left',
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
    description: {
      fontSize: 14,
      color: colors.textLight,
      lineHeight: 22,
      backgroundColor: colors.card,
      padding: 16,
      borderRadius: 12,
      textAlign: isRTL ? 'right' : 'left',
    },
    specialistCard: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      padding: 16,
      borderRadius: 12,
      marginBottom: 8,
    },
    specialistInfo: {
      marginLeft: isRTL ? 0 : 12,
      marginRight: isRTL ? 12 : 0,
      flex: 1,
    },
    specialistName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: isRTL ? 'right' : 'left',
    },
    specialistRole: {
      fontSize: 12,
      color: colors.textLight,
      marginTop: 2,
      textAlign: isRTL ? 'right' : 'left',
    },
    contactItem: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      padding: 16,
      borderRadius: 12,
      marginBottom: 8,
    },
    contactText: {
      fontSize: 14,
      color: colors.text,
      marginLeft: isRTL ? 0 : 12,
      marginRight: isRTL ? 12 : 0,
      flex: 1,
      textAlign: isRTL ? 'right' : 'left',
    },
    socialContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 16,
    },
    socialButton: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    hoursCard: {
      backgroundColor: colors.card,
      padding: 16,
      borderRadius: 12,
    },
    hoursRow: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    dayText: {
      fontSize: 14,
      color: colors.text,
      fontWeight: '600',
    },
    timeText: {
      fontSize: 14,
      color: colors.textLight,
    },
    timeColumn: {
      alignItems: isRTL ? 'flex-start' : 'flex-end',
    },
    // Offers styles
    offerCard: {
      backgroundColor: colors.secondary,
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
    },
    offerHeader: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    offerTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.white,
      flex: 1,
      textAlign: isRTL ? 'right' : 'left',
    },
    offerDiscount: {
      backgroundColor: colors.white,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    offerDiscountText: {
      fontSize: 12,
      fontWeight: 'bold',
      color: colors.secondary,
    },
    offerDescription: {
      fontSize: 14,
      color: colors.white,
      opacity: 0.9,
      marginBottom: 8,
      textAlign: isRTL ? 'right' : 'left',
    },
    offerValidity: {
      fontSize: 12,
      color: colors.white,
      opacity: 0.7,
      textAlign: isRTL ? 'right' : 'left',
    },
    noOffersText: {
      fontSize: 14,
      color: colors.textLight,
      textAlign: 'center',
      padding: 20,
      backgroundColor: colors.card,
      borderRadius: 12,
    },
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Ionicons name="medical" size={60} color={colors.primary} />
        <Text style={styles.clinicName}>{t('common.appName')}</Text>
        <Text style={styles.tagline}>{t('home.tagline')}</Text>
      </View>

      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeText}>{t('common.welcome')}، {user?.name}!</Text>
        <Text style={styles.roleText}>{user?.role?.toUpperCase()}</Text>
      </View>

      {/* Special Offers Section */}
      {offers.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isRTL ? '🎉 العروض الخاصة' : '🎉 Special Offers'}
          </Text>
          {offers.map((offer) => (
            <View key={offer.id} style={styles.offerCard}>
              <View style={styles.offerHeader}>
                <Text style={styles.offerTitle}>{offer.title}</Text>
                <View style={styles.offerDiscount}>
                  <Text style={styles.offerDiscountText}>{offer.discount}</Text>
                </View>
              </View>
              <Text style={styles.offerDescription}>{offer.description}</Text>
              <Text style={styles.offerValidity}>
                {isRTL ? `صالح حتى: ${offer.valid_until}` : `Valid until: ${offer.valid_until}`}
              </Text>
            </View>
          ))}
        </View>
      )}

      {clinicInfo && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('home.aboutUs')}</Text>
            <Text style={styles.description}>
              {isRTL 
                ? (clinicInfo.description_ar || 'مجمع طيبة التخصصي للأسنان - نقدم أفضل خدمات طب الأسنان بأحدث التقنيات وفريق طبي متخصص. رضاكم هدفنا وابتسامتكم أولويتنا.')
                : clinicInfo.description
              }
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('home.ourSpecialists')}</Text>
            <View style={styles.specialistCard}>
              <Ionicons name="person-circle" size={40} color={colors.primary} />
              <View style={styles.specialistInfo}>
                <Text style={styles.specialistName}>
                  {isRTL ? 'د. لؤي خليل' : 'Dr. Louai Khalil'}
                </Text>
                <Text style={styles.specialistRole}>
                  {isRTL ? t('doctors.oralSurgery') : 'Consultant Oral Surgery & Implantation'}
                </Text>
              </View>
            </View>
            <View style={styles.specialistCard}>
              <Ionicons name="person-circle" size={40} color={colors.secondary} />
              <View style={styles.specialistInfo}>
                <Text style={styles.specialistName}>
                  {isRTL ? 'د. منى' : 'Dr. Mona'}
                </Text>
                <Text style={styles.specialistRole}>
                  {isRTL ? t('doctors.prosthodontics') : 'Prosthodontics Specialist'}
                </Text>
              </View>
            </View>
            <View style={styles.specialistCard}>
              <Ionicons name="person-circle" size={40} color={colors.primary} />
              <View style={styles.specialistInfo}>
                <Text style={styles.specialistName}>
                  {isRTL ? 'د. باسم نورالدين' : 'Dr. Bassem Nourdean'}
                </Text>
                <Text style={styles.specialistRole}>
                  {isRTL ? t('doctors.orthodontics') : 'Orthodontics Specialist'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('home.contactInfo')}</Text>
            
            <TouchableOpacity style={styles.contactItem} onPress={() => callPhone(clinicInfo.phone)}>
              <Ionicons name="call" size={20} color={colors.primary} />
              <Text style={styles.contactText}>{clinicInfo.phone}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactItem} onPress={() => callPhone(clinicInfo.mobile)}>
              <Ionicons name="phone-portrait" size={20} color={colors.secondary} />
              <Text style={styles.contactText}>{clinicInfo.mobile}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactItem} onPress={() => openWhatsApp(clinicInfo.whatsapp)}>
              <Ionicons name="logo-whatsapp" size={20} color={colors.success} />
              <Text style={styles.contactText}>{isRTL ? 'واتساب' : 'WhatsApp'}: {clinicInfo.whatsapp}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactItem} onPress={() => sendEmail(clinicInfo.email)}>
              <Ionicons name="mail" size={20} color={colors.primary} />
              <Text style={styles.contactText}>{clinicInfo.email}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactItem} onPress={() => openURL(clinicInfo.google_maps)}>
              <Ionicons name="location" size={20} color={colors.error} />
              <Text style={styles.contactText}>
                {isRTL ? 'الدوحة، قطر - الوكرة' : clinicInfo.address}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('home.followUs')}</Text>
            <View style={styles.socialContainer}>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => openURL(clinicInfo.instagram)}
              >
                <Ionicons name="logo-instagram" size={30} color={colors.white} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => openURL(clinicInfo.facebook)}
              >
                <Ionicons name="logo-facebook" size={30} color={colors.white} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('home.workingHours')}</Text>
            <View style={styles.hoursCard}>
              <View style={styles.hoursRow}>
                <Text style={styles.dayText}>{t('home.satToThu')}</Text>
                <View style={styles.timeColumn}>
                  <Text style={styles.timeText}>{t('home.morning')}</Text>
                  <Text style={styles.timeText}>{t('home.evening')}</Text>
                </View>
              </View>
              <View style={[styles.hoursRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.dayText}>{t('home.friday')}</Text>
                <Text style={styles.timeText}>{t('home.closed')}</Text>
              </View>
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
}
