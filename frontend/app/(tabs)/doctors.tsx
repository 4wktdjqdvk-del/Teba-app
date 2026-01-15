import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { doctorsAPI, appointmentsAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import Modal from 'react-native-modal';

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  description: string;
  image?: string;
}

export default function DoctorsScreen() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const data = await doctorsAPI.getAll();
      setDoctors(data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      Alert.alert('Error', 'Failed to load doctors');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDoctors();
    setRefreshing(false);
  };

  const handleBookAppointment = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setSelectedDate(new Date());
    setSelectedTime('');
    setNotes('');
    setShowModal(true);
  };

  const submitAppointment = async () => {
    if (!selectedTime) {
      Alert.alert('Error', 'Please enter appointment time');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in');
      return;
    }

    setLoading(true);
    try {
      const isGuest = 'isGuest' in user && user.isGuest;
      const appointmentData = {
        patient_id: isGuest ? 'guest' : user.id,
        patient_name: user.name,
        patient_email: user.email,
        patient_phone: user.phone || '',
        doctor_id: selectedDoctor!.id,
        doctor_name: selectedDoctor!.name,
        date: selectedDate.toISOString().split('T')[0],
        time: selectedTime,
        notes: notes,
      };

      await appointmentsAPI.create(appointmentData);
      Alert.alert('Success', 'Appointment booked successfully!\n\nYou will receive a confirmation email at ' + user.email);
      setShowModal(false);
    } catch (error: any) {
      console.error('Error booking appointment:', error);
      Alert.alert('Error', error.response?.data?.detail || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.title}>Our Specialists</Text>
        <Text style={styles.subtitle}>Book an appointment with our expert doctors</Text>

        {doctors.map((doctor) => (
          <View key={doctor.id} style={styles.doctorCard}>
            <View style={styles.doctorIconContainer}>
              <Ionicons name="person-circle" size={60} color={Colors.primary} />
            </View>
            <View style={styles.doctorInfo}>
              <Text style={styles.doctorName}>{doctor.name}</Text>
              <Text style={styles.doctorSpecialization}>{doctor.specialization}</Text>
              <Text style={styles.doctorDescription}>{doctor.description}</Text>
              <TouchableOpacity
                style={styles.bookButton}
                onPress={() => handleBookAppointment(doctor)}
              >
                <Ionicons name="calendar" size={18} color={Colors.white} />
                <Text style={styles.bookButtonText}>Book Appointment</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal
        isVisible={showModal}
        onBackdropPress={() => !loading && setShowModal(false)}
        onBackButtonPress={() => !loading && setShowModal(false)}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Book Appointment</Text>
          <Text style={styles.modalDoctor}>{selectedDoctor?.name}</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Date</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
              <Text style={styles.dateText}>
                {selectedDate.toLocaleDateString('en-GB')}
              </Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              minimumDate={new Date()}
              onChange={onDateChange}
            />
          )}

          <View style={styles.formGroup}>
            <Text style={styles.label}>Time</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 10:00 AM"
              placeholderTextColor={Colors.textLight}
              value={selectedTime}
              onChangeText={setSelectedTime}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Notes (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Any special requirements or concerns?"
              placeholderTextColor={Colors.textLight}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowModal(false)}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton, loading && styles.buttonDisabled]}
              onPress={submitAppointment}
              disabled={loading}
            >
              <Text style={styles.confirmButtonText}>
                {loading ? 'Booking...' : 'Confirm'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  doctorCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
  },
  doctorIconContainer: {
    marginRight: 16,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  doctorSpecialization: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  doctorDescription: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 12,
    lineHeight: 18,
  },
  bookButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  bookButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  modalDoctor: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dateText: {
    fontSize: 16,
    color: Colors.text,
    marginLeft: 12,
  },
  input: {
    backgroundColor: Colors.background,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 16,
    color: Colors.text,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
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
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: Colors.primary,
  },
  confirmButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
