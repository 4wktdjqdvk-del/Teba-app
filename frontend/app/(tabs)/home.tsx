import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { clinicAPI } from '../../utils/api';

export default function HomeScreen() {
  const { user } = useAuth();
  const [clinicInfo, setClinicInfo] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchClinicInfo();
  }, []);

  const fetchClinicInfo = async () => {
    try {
      const data = await clinicAPI.getInfo();
      setClinicInfo(data);
    } catch (error) {
      console.error('Error fetching clinic info:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchClinicInfo();
    setRefreshing(false);
  };

  const openURL = (url: string) => {
    Linking.openURL(url);
  };

  const callPhone = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const sendEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const openWhatsApp = (phone: string) => {
    Linking.openURL(`whatsapp://send?phone=+974${phone}`);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Ionicons name="medical" size={60} color={Colors.primary} />
        <Text style={styles.clinicName}>TEBA SPECIALIZED{"\n"}DENTAL CENTER</Text>
        <Text style={styles.tagline}>Your Smile, Our Priority</Text>
      </View>

      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeText}>Welcome, {user?.name}!</Text>
        <Text style={styles.roleText}>{user?.role?.toUpperCase()}</Text>
      </View>

      {clinicInfo && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About Us</Text>
            <Text style={styles.description}>{clinicInfo.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Our Specialists</Text>
            <View style={styles.specialistCard}>
              <Ionicons name="person-circle" size={24} color={Colors.primary} />
              <View style={styles.specialistInfo}>
                <Text style={styles.specialistName}>Dr. Louai Khalil</Text>
                <Text style={styles.specialistRole}>Consultant Oral Surgery & Implantation</Text>
              </View>
            </View>
            <View style={styles.specialistCard}>
              <Ionicons name="person-circle" size={24} color={Colors.secondary} />
              <View style={styles.specialistInfo}>
                <Text style={styles.specialistName}>Dr. Mona</Text>
                <Text style={styles.specialistRole}>Prosthodontics Specialist</Text>
              </View>
            </View>
            <View style={styles.specialistCard}>
              <Ionicons name="person-circle" size={24} color={Colors.primary} />
              <View style={styles.specialistInfo}>
                <Text style={styles.specialistName}>Dr. Bassem Nourdean</Text>
                <Text style={styles.specialistRole}>Orthodontics Specialist</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            
            <TouchableOpacity style={styles.contactItem} onPress={() => callPhone(clinicInfo.phone)}>
              <Ionicons name="call" size={20} color={Colors.primary} />
              <Text style={styles.contactText}>{clinicInfo.phone}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactItem} onPress={() => callPhone(clinicInfo.mobile)}>
              <Ionicons name="phone-portrait" size={20} color={Colors.secondary} />
              <Text style={styles.contactText}>{clinicInfo.mobile}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactItem} onPress={() => openWhatsApp(clinicInfo.whatsapp)}>
              <Ionicons name="logo-whatsapp" size={20} color={Colors.success} />
              <Text style={styles.contactText}>WhatsApp: {clinicInfo.whatsapp}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactItem} onPress={() => sendEmail(clinicInfo.email)}>
              <Ionicons name="mail" size={20} color={Colors.primary} />
              <Text style={styles.contactText}>{clinicInfo.email}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactItem} onPress={() => openURL(clinicInfo.google_maps)}>
              <Ionicons name="location" size={20} color={Colors.error} />
              <Text style={styles.contactText}>{clinicInfo.address}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Follow Us</Text>
            <View style={styles.socialContainer}>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => openURL(clinicInfo.instagram)}
              >
                <Ionicons name="logo-instagram" size={30} color={Colors.white} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => openURL(clinicInfo.facebook)}
              >
                <Ionicons name="logo-facebook" size={30} color={Colors.white} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Working Hours</Text>
            <View style={styles.hoursCard}>
              <View style={styles.hoursRow}>
                <Text style={styles.dayText}>Saturday - Thursday</Text>
                <View style={styles.timeColumn}>
                  <Text style={styles.timeText}>09:00 AM - 12:30 PM</Text>
                  <Text style={styles.timeText}>04:00 PM - 08:30 PM</Text>
                </View>
              </View>
              <View style={styles.hoursRow}>
                <Text style={styles.dayText}>Friday</Text>
                <Text style={styles.timeText}>Closed</Text>
              </View>
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: Colors.white,
    padding: 24,
    borderRadius: 16,
  },
  clinicName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: 12,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 4,
  },
  welcomeCard: {
    backgroundColor: Colors.primary,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
  },
  roleText: {
    fontSize: 12,
    color: Colors.white,
    marginTop: 4,
    opacity: 0.9,
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
  description: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
  },
  specialistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  specialistInfo: {
    marginLeft: 12,
    flex: 1,
  },
  specialistName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  specialistRole: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 2,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: Colors.text,
    marginLeft: 12,
    flex: 1,
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
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hoursCard: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dayText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600',
  },
  timeText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  timeColumn: {
    alignItems: 'flex-end',
  },
});
