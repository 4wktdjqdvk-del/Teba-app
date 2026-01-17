import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { appointmentsAPI } from '../../utils/api';
import ConfirmDialog from '../../components/ConfirmDialog';

interface Appointment {
  id: string;
  patient_name: string;
  doctor_name: string;
  date: string;
  time: string;
  status: string;
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const router = useRouter();
  
  const isGuest = user && 'isGuest' in user && user.isGuest === true;
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    if (isGuest && user?.email) {
      fetchGuestAppointments();
    }
  }, [user]);

  const fetchGuestAppointments = async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      // Fetch appointments by guest email
      const allAppointments = await appointmentsAPI.getAll();
      const guestAppointments = allAppointments.filter(
        (apt: any) => apt.patient_email?.toLowerCase() === user.email?.toLowerCase()
      );
      setAppointments(guestAppointments);
    } catch (error) {
      console.error('Error fetching guest appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchGuestAppointments();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await logout();
      setShowLogoutDialog(false);
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Force navigation even if logout fails
      router.replace('/(auth)/login');
    } finally {
      setLogoutLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#F59E0B';
      case 'confirmed': return colors.primary;
      case 'completed': return colors.success;
      case 'cancelled': return colors.error;
      default: return colors.textLight;
    }
  };

  const getStatusText = (status: string) => {
    if (!isRTL) return status;
    switch (status) {
      case 'pending': return 'قيد الانتظار';
      case 'confirmed': return 'مؤكد';
      case 'completed': return 'مكتمل';
      case 'cancelled': return 'ملغي';
      default: return status;
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
      backgroundColor: colors.card,
      padding: 24,
      borderRadius: 16,
      marginBottom: 24,
    },
    avatarContainer: {
      marginBottom: 16,
    },
    name: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 4,
    },
    email: {
      fontSize: 14,
      color: colors.textLight,
      marginBottom: 12,
    },
    roleBadge: {
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 16,
    },
    roleText: {
      color: colors.white,
      fontSize: 12,
      fontWeight: 'bold',
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
    infoCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
    },
    infoRow: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    infoLeft: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
    },
    infoLabel: {
      fontSize: 14,
      color: colors.text,
      marginLeft: isRTL ? 0 : 12,
      marginRight: isRTL ? 12 : 0,
      fontWeight: '600',
    },
    infoValue: {
      fontSize: 14,
      color: colors.textLight,
    },
    menuCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 4,
    },
    menuItem: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
    },
    menuLeft: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
    },
    menuText: {
      fontSize: 16,
      color: colors.text,
      marginLeft: isRTL ? 0 : 12,
      marginRight: isRTL ? 12 : 0,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginHorizontal: 16,
    },
    logoutButton: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      backgroundColor: colors.error,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 8,
    },
    logoutText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: 'bold',
      marginLeft: isRTL ? 0 : 8,
      marginRight: isRTL ? 8 : 0,
    },
    version: {
      textAlign: 'center',
      color: colors.textLight,
      fontSize: 12,
      marginTop: 20,
    },
    appointmentCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
    },
    appointmentHeader: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    appointmentDate: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
    },
    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 10,
    },
    statusText: {
      fontSize: 10,
      fontWeight: 'bold',
      color: colors.white,
    },
    appointmentInfo: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      marginTop: 4,
    },
    appointmentText: {
      fontSize: 14,
      color: colors.textLight,
      marginLeft: isRTL ? 0 : 8,
      marginRight: isRTL ? 8 : 0,
    },
    emptyContainer: {
      alignItems: 'center',
      padding: 30,
      backgroundColor: colors.card,
      borderRadius: 16,
    },
    emptyText: {
      fontSize: 14,
      color: colors.textLight,
      marginTop: 12,
      textAlign: 'center',
    },
    guestNote: {
      backgroundColor: colors.primary + '20',
      padding: 16,
      borderRadius: 12,
      marginBottom: 16,
    },
    guestNoteText: {
      fontSize: 14,
      color: colors.primary,
      textAlign: 'center',
    },
  });

  const getRoleText = () => {
    if (isGuest) return isRTL ? 'زائر' : 'Guest';
    if (!isRTL) return user?.role?.toUpperCase();
    switch (user?.role) {
      case 'admin': return 'مدير';
      case 'doctor': return 'طبيب';
      case 'nurse': return 'ممرض/ة';
      case 'receptionist': return 'موظف استقبال';
      case 'patient': return 'مريض';
      default: return user?.role;
    }
  };

  // Guest Profile View
  if (isGuest) {
    return (
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.contentContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person-circle" size={100} color={colors.primary} />
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.myAppointments')}</Text>
          
          {loading ? (
            <Text style={[styles.emptyText, { textAlign: 'center' }]}>{t('common.loading')}</Text>
          ) : appointments.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={50} color={colors.textLight} />
              <Text style={styles.emptyText}>
                {isRTL ? 'لا توجد مواعيد سابقة' : 'No previous appointments'}
              </Text>
            </View>
          ) : (
            appointments.map((apt) => (
              <View key={apt.id} style={styles.appointmentCard}>
                <View style={styles.appointmentHeader}>
                  <Text style={styles.appointmentDate}>{apt.date}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(apt.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(apt.status)}</Text>
                  </View>
                </View>
                <View style={styles.appointmentInfo}>
                  <Ionicons name="time" size={16} color={colors.textLight} />
                  <Text style={styles.appointmentText}>{apt.time}</Text>
                </View>
                <View style={styles.appointmentInfo}>
                  <Ionicons name="medkit" size={16} color={colors.textLight} />
                  <Text style={styles.appointmentText}>{isRTL ? 'د.' : 'Dr.'} {apt.doctor_name}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.guestNote}>
          <Text style={styles.guestNoteText}>
            {isRTL 
              ? 'سجل حساباً للاحتفاظ بمواعيدك وتتبعها بسهولة'
              : 'Create an account to easily track and manage your appointments'
            }
          </Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={() => setShowLogoutDialog(true)}>
          <Ionicons name="log-out" size={20} color={colors.white} />
          <Text style={styles.logoutText}>{t('common.logout')}</Text>
        </TouchableOpacity>

        <Text style={styles.version}>{t('profile.version')} 1.0.0</Text>

        <ConfirmDialog
          visible={showLogoutDialog}
          title={t('common.logout')}
          message={isRTL ? 'هل أنت متأكد من تسجيل الخروج؟' : 'Are you sure you want to logout?'}
          confirmText={t('common.logout')}
          confirmColor={colors.error}
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutDialog(false)}
          loading={logoutLoading}
        />
      </ScrollView>
    );
  }

  // Regular User Profile View
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle" size={100} color={colors.primary} />
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{getRoleText()}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('profile.accountInfo')}</Text>
        
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoLeft}>
              <Ionicons name="mail" size={20} color={colors.primary} />
              <Text style={styles.infoLabel}>{t('common.email')}</Text>
            </View>
            <Text style={styles.infoValue}>{user?.email}</Text>
          </View>

          {user?.phone && (
            <View style={styles.infoRow}>
              <View style={styles.infoLeft}>
                <Ionicons name="call" size={20} color={colors.primary} />
                <Text style={styles.infoLabel}>{t('common.phone')}</Text>
              </View>
              <Text style={styles.infoValue}>{user?.phone}</Text>
            </View>
          )}

          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <View style={styles.infoLeft}>
              <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
              <Text style={styles.infoLabel}>{isRTL ? 'الدور' : 'Role'}</Text>
            </View>
            <Text style={styles.infoValue}>{getRoleText()}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('profile.appInfo')}</Text>
        
        <View style={styles.menuCard}>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/settings')}>
            <View style={styles.menuLeft}>
              <Ionicons name="settings" size={24} color={colors.primary} />
              <Text style={styles.menuText}>{t('settings.title')}</Text>
            </View>
            <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={20} color={colors.textLight} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <Ionicons name="information-circle" size={24} color={colors.primary} />
              <Text style={styles.menuText}>{t('profile.about')}</Text>
            </View>
            <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={20} color={colors.textLight} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <Ionicons name="help-circle" size={24} color={colors.primary} />
              <Text style={styles.menuText}>{t('profile.help')}</Text>
            </View>
            <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={20} color={colors.textLight} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <Ionicons name="document-text" size={24} color={colors.primary} />
              <Text style={styles.menuText}>{t('profile.terms')}</Text>
            </View>
            <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={20} color={colors.textLight} />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out" size={20} color={colors.white} />
        <Text style={styles.logoutText}>{t('common.logout')}</Text>
      </TouchableOpacity>

      <Text style={styles.version}>{t('profile.version')} 1.0.0</Text>
    </ScrollView>
  );
}
