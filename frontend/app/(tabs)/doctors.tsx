import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { doctorsAPI, appointmentsAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import Modal from 'react-native-modal';
import CustomDatePicker from '../../components/CustomDatePicker';
import ConfirmDialog from '../../components/ConfirmDialog';

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  description: string;
  image?: string;
}

export default function DoctorsScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Alert dialog states
  const [alertDialog, setAlertDialog] = useState({
    visible: false,
    title: '',
    message: '',
    isSuccess: false,
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  const showAlert = (title: string, message: string, isSuccess: boolean = false) => {
    setAlertDialog({ visible: true, title, message, isSuccess });
  };

  const fetchDoctors = async () => {
    try {
      const data = await doctorsAPI.getAll();
      setDoctors(data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      showAlert(t('common.error'), isRTL ? 'فشل تحميل الأطباء' : 'Failed to load doctors');
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
      showAlert(t('common.error'), isRTL ? 'يرجى إدخال وقت الموعد' : 'Please enter appointment time');
      return;
    }

    if (!user) {
      showAlert(t('common.error'), isRTL ? 'يجب تسجيل الدخول' : 'You must be logged in');
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
      setShowModal(false);
      showAlert(
        t('common.success'), 
        isRTL 
          ? `تم حجز الموعد بنجاح!\n\nستتلقى رسالة تأكيد على ${user.email}`
          : `Appointment booked successfully!\n\nYou will receive a confirmation email at ${user.email}`,
        true
      );
    } catch (error: any) {
      console.error('Error booking appointment:', error);
      showAlert(t('common.error'), error.response?.data?.detail || (isRTL ? 'فشل حجز الموعد' : 'Failed to book appointment'));
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  // Format date for display in Gregorian calendar
  const formatDisplayDate = (date: Date) => {
    const months = isRTL 
      ? ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
      : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return isRTL ? `${day} ${month} ${year}` : `${month} ${day}, ${year}`;
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
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
      textAlign: isRTL ? 'right' : 'left',
    },
    subtitle: {
      fontSize: 14,
      color: colors.textLight,
      marginBottom: 20,
      textAlign: isRTL ? 'right' : 'left',
    },
    doctorCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      flexDirection: isRTL ? 'row-reverse' : 'row',
    },
    doctorIconContainer: {
      marginRight: isRTL ? 0 : 16,
      marginLeft: isRTL ? 16 : 0,
    },
    doctorInfo: {
      flex: 1,
    },
    doctorName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 4,
      textAlign: isRTL ? 'right' : 'left',
    },
    doctorSpecialization: {
      fontSize: 14,
      color: colors.primary,
      fontWeight: '600',
      marginBottom: 8,
      textAlign: isRTL ? 'right' : 'left',
    },
    doctorDescription: {
      fontSize: 12,
      color: colors.textLight,
      marginBottom: 12,
      lineHeight: 18,
      textAlign: isRTL ? 'right' : 'left',
    },
    bookButton: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      backgroundColor: colors.primary,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: isRTL ? 'flex-end' : 'flex-start',
    },
    bookButtonText: {
      color: colors.white,
      fontSize: 14,
      fontWeight: 'bold',
      marginLeft: isRTL ? 0 : 8,
      marginRight: isRTL ? 8 : 0,
    },
    modal: {
      margin: 0,
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 24,
      maxHeight: '80%',
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
      textAlign: isRTL ? 'right' : 'left',
    },
    modalDoctor: {
      fontSize: 16,
      color: colors.primary,
      fontWeight: '600',
      marginBottom: 20,
      textAlign: isRTL ? 'right' : 'left',
    },
    formGroup: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
      textAlign: isRTL ? 'right' : 'left',
    },
    dateButton: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    dateText: {
      fontSize: 16,
      color: colors.text,
      marginLeft: isRTL ? 0 : 12,
      marginRight: isRTL ? 12 : 0,
    },
    input: {
      backgroundColor: colors.background,
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      fontSize: 16,
      color: colors.text,
      textAlign: isRTL ? 'right' : 'left',
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
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cancelButtonText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
    },
    confirmButton: {
      backgroundColor: colors.primary,
    },
    confirmButtonText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: 'bold',
    },
    buttonDisabled: {
      opacity: 0.6,
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.title}>{t('doctors.title')}</Text>
        <Text style={styles.subtitle}>{t('doctors.subtitle')}</Text>

        {doctors.map((doctor) => (
          <View key={doctor.id} style={styles.doctorCard}>
            <View style={styles.doctorIconContainer}>
              <Ionicons name="person-circle" size={60} color={colors.primary} />
            </View>
            <View style={styles.doctorInfo}>
              <Text style={styles.doctorName}>{doctor.name}</Text>
              <Text style={styles.doctorSpecialization}>{doctor.specialization}</Text>
              <Text style={styles.doctorDescription}>{doctor.description}</Text>
              <TouchableOpacity
                style={styles.bookButton}
                onPress={() => handleBookAppointment(doctor)}
              >
                <Ionicons name="calendar" size={18} color={colors.white} />
                <Text style={styles.bookButtonText}>{t('doctors.bookAppointment')}</Text>
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
          <Text style={styles.modalTitle}>{t('doctors.bookAppointment')}</Text>
          <Text style={styles.modalDoctor}>{selectedDoctor?.name}</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t('appointments.date')}</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              <Text style={styles.dateText}>
                {formatDisplayDate(selectedDate)}
              </Text>
            </TouchableOpacity>
          </View>

          <CustomDatePicker
            visible={showDatePicker}
            selectedDate={selectedDate}
            onDateChange={onDateChange}
            onClose={() => setShowDatePicker(false)}
            minimumDate={new Date()}
          />

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t('appointments.time')}</Text>
            <TextInput
              style={styles.input}
              placeholder={isRTL ? 'مثال: 10:00 صباحاً' : 'e.g., 10:00 AM'}
              placeholderTextColor={colors.textLight}
              value={selectedTime}
              onChangeText={setSelectedTime}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t('appointments.notes')} ({isRTL ? 'اختياري' : 'Optional'})</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder={isRTL ? 'أي متطلبات أو ملاحظات خاصة؟' : 'Any special requirements or concerns?'}
              placeholderTextColor={colors.textLight}
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
              <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton, loading && styles.buttonDisabled]}
              onPress={submitAppointment}
              disabled={loading}
            >
              <Text style={styles.confirmButtonText}>
                {loading ? t('common.loading') : t('common.confirm')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
