import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { appointmentsAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

interface Appointment {
  id: string;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  doctor_name: string;
  date: string;
  time: string;
  notes?: string;
  status: string;
  created_at: string;
}

export default function AppointmentsScreen() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      let data;
      if (user?.role === 'patient') {
        data = await appointmentsAPI.getByPatient(user.id);
      } else if (user?.role === 'doctor') {
        data = await appointmentsAPI.getByDoctor(user.id);
      } else if (user?.role === 'receptionist' || user?.role === 'admin' || user?.role === 'nurse') {
        data = await appointmentsAPI.getAll();
      }
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      Alert.alert('Error', 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAppointments();
    setRefreshing(false);
  };

  const handleStatusUpdate = (appointmentId: string, newStatus: string) => {
    console.log('handleStatusUpdate called:', appointmentId, newStatus);
    Alert.alert(
      'Update Status',
      `Change appointment status to "${newStatus}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              console.log('Updating status...');
              await appointmentsAPI.updateStatus(appointmentId, newStatus);
              console.log('Status updated successfully');
              Alert.alert('Success', 'Appointment status updated');
              fetchAppointments();
            } catch (error) {
              console.error('Error updating status:', error);
              Alert.alert('Error', 'Failed to update status');
            }
          },
        },
      ]
    );
  };

  const handleDelete = (appointmentId: string) => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              await appointmentsAPI.delete(appointmentId);
              Alert.alert('Success', 'Appointment cancelled');
              fetchAppointments();
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel appointment');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#F59E0B';
      case 'confirmed':
        return Colors.primary;
      case 'completed':
        return Colors.success;
      case 'cancelled':
        return Colors.error;
      default:
        return Colors.textLight;
    }
  };

  const renderAppointmentCard = (appointment: Appointment) => {
    const canManage = user?.role === 'doctor' || user?.role === 'receptionist' || user?.role === 'admin' || user?.role === 'nurse';
    const canCancel = user?.role === 'patient' && appointment.status === 'pending';

    return (
      <View key={appointment.id} style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <Ionicons name="calendar" size={20} color={Colors.primary} />
            <Text style={styles.date}>{appointment.date}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appointment.status) }]}>
            <Text style={styles.statusText}>{appointment.status.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.infoRow}>
            <Ionicons name="time" size={16} color={Colors.textLight} />
            <Text style={styles.infoText}>{appointment.time}</Text>
          </View>

          {user?.role !== 'patient' && (
            <View style={styles.infoRow}>
              <Ionicons name="person" size={16} color={Colors.textLight} />
              <Text style={styles.infoText}>{appointment.patient_name}</Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Ionicons name="medkit" size={16} color={Colors.textLight} />
            <Text style={styles.infoText}>Dr. {appointment.doctor_name}</Text>
          </View>

          {appointment.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesLabel}>Notes:</Text>
              <Text style={styles.notesText}>{appointment.notes}</Text>
            </View>
          )}
        </View>

        {canManage && appointment.status === 'pending' && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.confirmButton]}
              onPress={() => handleStatusUpdate(appointment.id, 'confirmed')}
            >
              <Ionicons name="checkmark-circle" size={18} color={Colors.white} />
              <Text style={styles.actionButtonText}>Confirm</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handleStatusUpdate(appointment.id, 'cancelled')}
            >
              <Ionicons name="close-circle" size={18} color={Colors.white} />
              <Text style={styles.actionButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        {canManage && appointment.status === 'confirmed' && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.completeButton]}
              onPress={() => handleStatusUpdate(appointment.id, 'completed')}
            >
              <Ionicons name="checkbox" size={18} color={Colors.white} />
              <Text style={styles.actionButtonText}>Complete</Text>
            </TouchableOpacity>
          </View>
        )}

        {canCancel && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => handleDelete(appointment.id)}
            >
              <Ionicons name="trash" size={18} color={Colors.white} />
              <Text style={styles.actionButtonText}>Cancel Appointment</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.title}>
          {user?.role === 'patient' ? 'My Appointments' : 'Manage Appointments'}
        </Text>
        <Text style={styles.subtitle}>
          {appointments.length} {appointments.length === 1 ? 'appointment' : 'appointments'}
        </Text>

        {loading ? (
          <Text style={styles.emptyText}>Loading...</Text>
        ) : appointments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={60} color={Colors.textLight} />
            <Text style={styles.emptyText}>No appointments yet</Text>
          </View>
        ) : (
          appointments.map(renderAppointmentCard)
        )}
      </ScrollView>
    </View>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 20,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginLeft: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.white,
  },
  cardContent: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.text,
    marginLeft: 8,
  },
  notesContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: Colors.background,
    borderRadius: 8,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textLight,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 12,
    color: Colors.text,
    lineHeight: 18,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  confirmButton: {
    backgroundColor: Colors.success,
  },
  rejectButton: {
    backgroundColor: Colors.error,
  },
  completeButton: {
    backgroundColor: Colors.primary,
  },
  cancelButton: {
    backgroundColor: Colors.error,
  },
  actionButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textLight,
    marginTop: 16,
  },
});
