import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Share,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { saveLanguage } from '../i18n/config';
import { appointmentsAPI, doctorsAPI } from '../utils/api';

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, toggleTheme, isDark } = useTheme();
  const { t, i18n } = useTranslation();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const currentColors = isDark ? require('../constants/Theme').DarkColors : Colors;

  const handleLanguageChange = async (lang: string) => {
    await saveLanguage(lang);
    Alert.alert(
      lang === 'ar' ? 'تم التغيير' : 'Changed',
      lang === 'ar' ? 'تم تغيير اللغة بنجاح' : 'Language changed successfully'
    );
  };

  const handleBackupData = async () => {
    Alert.alert(
      t('settings.backupData'),
      'Do you want to export clinic data?',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          onPress: async () => {
            setIsExporting(true);
            try {
              // Get all data
              const appointments = await appointmentsAPI.getAll();
              const doctors = await doctorsAPI.getAll();
              
              const backupData = {
                exportDate: new Date().toISOString(),
                appointments,
                doctors,
                clinic: {
                  name: 'TEBA SPECIALIZED DENTAL CENTER',
                  email: 'teba.s.d.center@gmail.com',
                },
              };
              
              const jsonData = JSON.stringify(backupData, null, 2);
              
              // Share the data
              await Share.share({
                message: jsonData,
                title: 'TEBA Dental Center Backup',
              });
              
              Alert.alert(t('common.success'), 'Data exported successfully');
            } catch (error) {
              console.error('Error exporting data:', error);
              Alert.alert(t('common.error'), 'Failed to export data');
            } finally {
              setIsExporting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: currentColors.background }]}>
      <View style={[styles.header, { backgroundColor: currentColors.primary }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={currentColors.white} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: currentColors.white }]}>{t('settings.title')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentColors.text }]}>
            {t('settings.clinicInfo')}
          </Text>
          
          <TouchableOpacity style={[styles.settingCard, { backgroundColor: currentColors.card }]}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: currentColors.background }]}>
                <Ionicons name=\"business\" size={24} color={currentColors.primary} />
              </View>
              <View>
                <Text style={[styles.settingTitle, { color: currentColors.text }]}>
                  {t('settings.clinicDetails')}
                </Text>
                <Text style={[styles.settingDescription, { color: currentColors.textLight }]}>
                  Name, address, contact info
                </Text>
              </View>
            </View>
            <Ionicons name=\"chevron-forward\" size={20} color={currentColors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingCard, { backgroundColor: currentColors.card }]}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: currentColors.background }]}>
                <Ionicons name=\"time\" size={24} color={currentColors.secondary} />
              </View>
              <View>
                <Text style={[styles.settingTitle, { color: currentColors.text }]}>
                  {t('settings.workingHours')}
                </Text>
                <Text style={[styles.settingDescription, { color: currentColors.textLight }]}>
                  Set clinic operating hours
                </Text>
              </View>
            </View>
            <Ionicons name=\"chevron-forward\" size={20} color={currentColors.textLight} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentColors.text }]}>
            {t('settings.notifications')}
          </Text>
          
          <View style={[styles.settingCard, { backgroundColor: currentColors.card }]}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: currentColors.background }]}>
                <Ionicons name=\"notifications\" size={24} color={currentColors.primary} />
              </View>
              <View>
                <Text style={[styles.settingTitle, { color: currentColors.text }]}>
                  {t('settings.pushNotifications')}
                </Text>
                <Text style={[styles.settingDescription, { color: currentColors.textLight }]}>
                  Receive app notifications
                </Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: currentColors.border, true: currentColors.primary }}
              thumbColor={currentColors.white}
            />
          </View>

          <View style={[styles.settingCard, { backgroundColor: currentColors.card }]}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: currentColors.background }]}>
                <Ionicons name=\"mail\" size={24} color={currentColors.secondary} />
              </View>
              <View>
                <Text style={[styles.settingTitle, { color: currentColors.text }]}>
                  {t('settings.emailNotifications')}
                </Text>
                <Text style={[styles.settingDescription, { color: currentColors.textLight }]}>
                  Send appointment emails
                </Text>
              </View>
            </View>
            <Switch
              value={emailNotifications}
              onValueChange={setEmailNotifications}
              trackColor={{ false: currentColors.border, true: currentColors.primary }}
              thumbColor={currentColors.white}
            />
          </View>

          <View style={[styles.settingCard, { backgroundColor: currentColors.card }]}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: currentColors.background }]}>
                <Ionicons name=\"chatbubbles\" size={24} color={currentColors.success} />
              </View>
              <View>
                <Text style={[styles.settingTitle, { color: currentColors.text }]}>
                  {t('settings.smsNotifications')}
                </Text>
                <Text style={[styles.settingDescription, { color: currentColors.textLight }]}>
                  Send appointment SMS
                </Text>
              </View>
            </View>
            <Switch
              value={smsNotifications}
              onValueChange={setSmsNotifications}
              trackColor={{ false: currentColors.border, true: currentColors.primary }}
              thumbColor={currentColors.white}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentColors.text }]}>System</Text>
          
          <TouchableOpacity 
            style={[styles.settingCard, { backgroundColor: currentColors.card }]}
            onPress={() => {
              Alert.alert(
                t('settings.language'),
                'Select Language / اختر اللغة',
                [
                  { text: 'Cancel / إلغاء', style: 'cancel' },
                  {
                    text: 'English',
                    onPress: () => handleLanguageChange('en'),
                  },
                  {
                    text: 'العربية',
                    onPress: () => handleLanguageChange('ar'),
                  },
                ]
              );
            }}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: currentColors.background }]}>
                <Ionicons name=\"language\" size={24} color={currentColors.primary} />
              </View>
              <View>
                <Text style={[styles.settingTitle, { color: currentColors.text }]}>
                  {t('settings.language')}
                </Text>
                <Text style={[styles.settingDescription, { color: currentColors.textLight }]}>
                  {i18n.language === 'ar' ? 'العربية' : 'English'}
                </Text>
              </View>
            </View>
            <Ionicons name=\"chevron-forward\" size={20} color={currentColors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.settingCard, { backgroundColor: currentColors.card }]}
            onPress={toggleTheme}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: currentColors.background }]}>
                <Ionicons name={isDark ? \"sunny\" : \"moon\"} size={24} color={currentColors.secondary} />
              </View>
              <View>
                <Text style={[styles.settingTitle, { color: currentColors.text }]}>
                  {t('settings.darkMode')}
                </Text>
                <Text style={[styles.settingDescription, { color: currentColors.textLight }]}>
                  {isDark ? 'Dark' : 'Light'} mode
                </Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: currentColors.border, true: currentColors.primary }}
              thumbColor={currentColors.white}
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.settingCard, { backgroundColor: currentColors.card }]}
            onPress={handleBackupData}
            disabled={isExporting}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: currentColors.background }]}>
                <Ionicons name=\"download\" size={24} color={currentColors.primary} />
              </View>
              <View>
                <Text style={[styles.settingTitle, { color: currentColors.text }]}>
                  {t('settings.backupData')}
                </Text>
                <Text style={[styles.settingDescription, { color: currentColors.textLight }]}>
                  {isExporting ? 'Exporting...' : t('settings.exportData')}
                </Text>
              </View>
            </View>
            <Ionicons name=\"chevron-forward\" size={20} color={currentColors.textLight} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentColors.text }]}>About</Text>
          
          <View style={[styles.infoCard, { backgroundColor: currentColors.card }]}>
            <Text style={[styles.infoLabel, { color: currentColors.textLight }]}>App Version</Text>
            <Text style={[styles.infoValue, { color: currentColors.text }]}>1.0.0</Text>
          </View>

          <View style={[styles.infoCard, { backgroundColor: currentColors.card }]}>
            <Text style={[styles.infoLabel, { color: currentColors.textLight }]}>Last Updated</Text>
            <Text style={[styles.infoValue, { color: currentColors.text }]}>January 2026</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [emailNotifications, setEmailNotifications] = React.useState(true);
  const [smsNotifications, setSmsNotifications] = React.useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>App Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Clinic Information</Text>
          
          <TouchableOpacity style={styles.settingCard}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="business" size={24} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.settingTitle}>Clinic Details</Text>
                <Text style={styles.settingDescription}>Name, address, contact info</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingCard}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="time" size={24} color={Colors.secondary} />
              </View>
              <View>
                <Text style={styles.settingTitle}>Working Hours</Text>
                <Text style={styles.settingDescription}>Set clinic operating hours</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingCard}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="images" size={24} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.settingTitle}>Gallery</Text>
                <Text style={styles.settingDescription}>Manage clinic photos</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <View style={styles.settingCard}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="notifications" size={24} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.settingTitle}>Push Notifications</Text>
                <Text style={styles.settingDescription}>Receive app notifications</Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.white}
            />
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="mail" size={24} color={Colors.secondary} />
              </View>
              <View>
                <Text style={styles.settingTitle}>Email Notifications</Text>
                <Text style={styles.settingDescription}>Send appointment emails</Text>
              </View>
            </View>
            <Switch
              value={emailNotifications}
              onValueChange={setEmailNotifications}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.white}
            />
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="chatbubbles" size={24} color={Colors.success} />
              </View>
              <View>
                <Text style={styles.settingTitle}>SMS Notifications</Text>
                <Text style={styles.settingDescription}>Send appointment SMS</Text>
              </View>
            </View>
            <Switch
              value={smsNotifications}
              onValueChange={setSmsNotifications}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.white}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appointment Settings</Text>
          
          <TouchableOpacity style={styles.settingCard}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="calendar" size={24} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.settingTitle}>Time Slots</Text>
                <Text style={styles.settingDescription}>Configure available times</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingCard}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="timer" size={24} color={Colors.secondary} />
              </View>
              <View>
                <Text style={styles.settingTitle}>Appointment Duration</Text>
                <Text style={styles.settingDescription}>Default appointment length</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingCard}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="close-circle" size={24} color={Colors.error} />
              </View>
              <View>
                <Text style={styles.settingTitle}>Cancellation Policy</Text>
                <Text style={styles.settingDescription}>Set cancellation rules</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System</Text>
          
          <TouchableOpacity style={styles.settingCard}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="language" size={24} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.settingTitle}>Language</Text>
                <Text style={styles.settingDescription}>English</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingCard}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="moon" size={24} color={Colors.secondary} />
              </View>
              <View>
                <Text style={styles.settingTitle}>Dark Mode</Text>
                <Text style={styles.settingDescription}>Coming soon</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingCard}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="download" size={24} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.settingTitle}>Backup Data</Text>
                <Text style={styles.settingDescription}>Export clinic data</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>App Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Last Updated</Text>
            <Text style={styles.infoValue}>January 2026</Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Build Number</Text>
            <Text style={styles.infoValue}>100</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
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
    color: Colors.white,
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
    color: Colors.text,
    marginBottom: 12,
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: Colors.textLight,
  },
  infoCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.textLight,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
});
