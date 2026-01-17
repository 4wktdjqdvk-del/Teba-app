import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      t('common.logout'),
      isRTL ? 'هل أنت متأكد من تسجيل الخروج؟' : 'Are you sure you want to logout?',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.logout'),
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
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
    settingsButton: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      backgroundColor: colors.primary,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    settingsText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: 'bold',
      marginLeft: isRTL ? 0 : 8,
      marginRight: isRTL ? 8 : 0,
    },
  });

  const getRoleText = () => {
    if (!isRTL) return user?.role?.toUpperCase();
    switch (user?.role) {
      case 'admin': return 'مدير';
      case 'doctor': return 'طبيب';
      case 'nurse': return 'ممرض/ة';
      case 'receptionist': return 'موظف استقبال';
      case 'patient': return 'مريض';
      case 'guest': return 'ضيف';
      default: return user?.role;
    }
  };

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
