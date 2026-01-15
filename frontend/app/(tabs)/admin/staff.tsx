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
import { Colors } from '../../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
}

export default function StaffManagementScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  
  // Default staff members
  const staffMembers: StaffMember[] = [
    { id: '1', name: 'Dr. Louai Khalil', email: 'louai@tebadental.com', role: 'doctor', phone: '66868388' },
    { id: '2', name: 'Dr. Mona', email: 'mona@tebadental.com', role: 'doctor' },
    { id: '3', name: 'Dr. Bassem Nourdean', email: 'bassem@tebadental.com', role: 'doctor' },
    { id: '4', name: 'Nurse 1', email: 'nurse1@tebadental.com', role: 'nurse' },
    { id: '5', name: 'Nurse 2', email: 'nurse2@tebadental.com', role: 'nurse' },
    { id: '6', name: 'Nurse 3', email: 'nurse3@tebadental.com', role: 'nurse' },
    { id: '7', name: 'Receptionist', email: 'reception@tebadental.com', role: 'receptionist', phone: '66868388' },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'doctor':
        return Colors.primary;
      case 'nurse':
        return Colors.secondary;
      case 'receptionist':
        return '#F59E0B';
      default:
        return Colors.textLight;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'doctor':
        return 'medical';
      case 'nurse':
        return 'heart';
      case 'receptionist':
        return 'person';
      default:
        return 'person-circle';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Staff</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.contentContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.statsRow}>
          <View style={[styles.statBox, { backgroundColor: Colors.primary }]}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Doctors</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: Colors.secondary }]}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Nurses</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: '#F59E0B' }]}>
            <Text style={styles.statNumber}>1</Text>
            <Text style={styles.statLabel}>Receptionist</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Staff Members</Text>

        {staffMembers.map((member) => (
          <View key={member.id} style={styles.staffCard}>
            <View style={[styles.roleIcon, { backgroundColor: getRoleColor(member.role) }]}>
              <Ionicons name={getRoleIcon(member.role)} size={24} color={Colors.white} />
            </View>
            <View style={styles.staffInfo}>
              <Text style={styles.staffName}>{member.name}</Text>
              <Text style={styles.staffEmail}>{member.email}</Text>
              {member.phone && (
                <View style={styles.phoneRow}>
                  <Ionicons name="call" size={14} color={Colors.textLight} />
                  <Text style={styles.staffPhone}>{member.phone}</Text>
                </View>
              )}
            </View>
            <View style={[styles.roleBadge, { backgroundColor: getRoleColor(member.role) }]}>
              <Text style={styles.roleText}>{member.role.toUpperCase()}</Text>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add-circle" size={24} color={Colors.primary} />
          <Text style={styles.addButtonText}>Add New Staff Member</Text>
        </TouchableOpacity>
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
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.white,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  staffCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  roleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  staffInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  staffEmail: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 2,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  staffPhone: {
    fontSize: 12,
    color: Colors.textLight,
    marginLeft: 4,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.white,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: 8,
  },
});
