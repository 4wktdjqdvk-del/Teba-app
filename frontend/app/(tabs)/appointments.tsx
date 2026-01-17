import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { appointmentsAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import ConfirmDialog from '../../components/ConfirmDialog';

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
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    visible: false,
    title: '',
    message: '',
    confirmText: '',
    confirmColor: '',
    appointmentId: '',
    action: '' as 'confirm' | 'cancel' | 'complete' | 'delete',
  });

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
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAppointments();
    setRefreshing(false);
  };

  const showConfirmDialog = (
    appointmentId: string, 
    action: 'confirm' | 'cancel' | 'complete' | 'delete'
  ) => {
    let title = '';
    let message = '';
    let confirmText = '';
    let confirmColor = colors.primary;

    switch (action) {
      case 'confirm':
        title = isRTL ? 'تأكيد الموعد' : 'Confirm Appointment';
        message = isRTL 
          ? 'هل تريد تأكيد هذا الموعد؟' 
          : 'Do you want to confirm this appointment?';
        confirmText = isRTL ? 'تأكيد' : 'Confirm';
        confirmColor = colors.success;
        break;
      case 'cancel':
        title = isRTL ? 'إلغاء الموعد' : 'Cancel Appointment';
        message = isRTL 
          ? 'هل أنت متأكد من إلغاء هذا الموعد؟' 
          : 'Are you sure you want to cancel this appointment?';
        confirmText = isRTL ? 'إلغاء الموعد' : 'Cancel Appointment';
        confirmColor = colors.error;
        break;
      case 'complete':
        title = isRTL ? 'إكمال الموعد' : 'Complete Appointment';
        message = isRTL 
          ? 'هل تريد تحديد هذا الموعد كمكتمل؟' 
          : 'Do you want to mark this appointment as completed?';
        confirmText = isRTL ? 'إكمال' : 'Complete';
        confirmColor = colors.primary;
        break;
      case 'delete':
        title = isRTL ? 'حذف الموعد' : 'Delete Appointment';
        message = isRTL 
          ? 'هل أنت متأكد من حذف هذا الموعد نهائياً؟' 
          : 'Are you sure you want to permanently delete this appointment?';
        confirmText = isRTL ? 'حذف' : 'Delete';
        confirmColor = colors.error;
        break;
    }

    setConfirmDialog({
      visible: true,
      title,
      message,
      confirmText,
      confirmColor,
      appointmentId,
      action,
    });
  };

  const handleConfirmAction = async () => {
    setActionLoading(true);
    const { appointmentId, action } = confirmDialog;

    try {
      switch (action) {
        case 'confirm':
          await appointmentsAPI.updateStatus(appointmentId, 'confirmed');
          break;
        case 'cancel':
          await appointmentsAPI.updateStatus(appointmentId, 'cancelled');
          break;
        case 'complete':
          await appointmentsAPI.updateStatus(appointmentId, 'completed');
          break;
        case 'delete':
          await appointmentsAPI.delete(appointmentId);
          break;
      }
      
      // Close dialog and refresh
      setConfirmDialog({ ...confirmDialog, visible: false });
      await fetchAppointments();
    } catch (error) {
      console.error('Error performing action:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#F59E0B';
      case 'confirmed':
        return colors.primary;
      case 'completed':
        return colors.success;
      case 'cancelled':
        return colors.error;
      default:
        return colors.textLight;
    }
  };

  const getStatusText = (status: string) => {
    if (!isRTL) return status.toUpperCase();
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
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
    },
    cardHeader: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    headerLeft: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
    },
    date: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
      marginLeft: isRTL ? 0 : 8,
      marginRight: isRTL ? 8 : 0,
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
    },
    statusText: {
      fontSize: 10,
      fontWeight: 'bold',
      color: colors.white,
    },
    cardContent: {
      marginBottom: 12,
    },
    infoRow: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    infoText: {
      fontSize: 14,
      color: colors.text,
      marginLeft: isRTL ? 0 : 8,
      marginRight: isRTL ? 8 : 0,
      textAlign: isRTL ? 'right' : 'left',
    },
    notesContainer: {
      marginTop: 8,
      padding: 12,
      backgroundColor: colors.background,
      borderRadius: 8,
    },
    notesLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textLight,
      marginBottom: 4,
      textAlign: isRTL ? 'right' : 'left',
    },
    notesText: {
      fontSize: 12,
      color: colors.text,
      lineHeight: 18,
      textAlign: isRTL ? 'right' : 'left',
    },
    actionsContainer: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 12,
    },
    actionButton: {
      flex: 1,
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 12,
      borderRadius: 8,
    },
    confirmButton: {
      backgroundColor: colors.success,
    },
    rejectButton: {
      backgroundColor: colors.error,
    },
    completeButton: {
      backgroundColor: colors.primary,
    },
    cancelButton: {
      backgroundColor: colors.error,
    },
    actionButtonText: {
      color: colors.white,
      fontSize: 14,
      fontWeight: '600',
      marginLeft: isRTL ? 0 : 6,
      marginRight: isRTL ? 6 : 0,
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
    },
    emptyText: {
      fontSize: 16,
      color: colors.textLight,
      marginTop: 16,
    },
  });

  const renderAppointmentCard = (appointment: Appointment) => {
    const canManage = user?.role === 'doctor' || user?.role === 'receptionist' || user?.role === 'admin' || user?.role === 'nurse';
    const canCancel = user?.role === 'patient' && appointment.status === 'pending';

    return (
      <View key={appointment.id} style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <Ionicons name="calendar" size={20} color={colors.primary} />
            <Text style={styles.date}>{appointment.date}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appointment.status) }]}>
            <Text style={styles.statusText}>{getStatusText(appointment.status)}</Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.infoRow}>
            <Ionicons name="time" size={16} color={colors.textLight} />
            <Text style={styles.infoText}>{appointment.time}</Text>
          </View>

          {user?.role !== 'patient' && (
            <View style={styles.infoRow}>
              <Ionicons name="person" size={16} color={colors.textLight} />
              <Text style={styles.infoText}>{appointment.patient_name}</Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Ionicons name="medkit" size={16} color={colors.textLight} />
            <Text style={styles.infoText}>{isRTL ? 'د.' : 'Dr.'} {appointment.doctor_name}</Text>
          </View>

          {appointment.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesLabel}>{t('appointments.notes')}:</Text>
              <Text style={styles.notesText}>{appointment.notes}</Text>
            </View>
          )}
        </View>

        {canManage && appointment.status === 'pending' && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.confirmButton]}
              onPress={() => showConfirmDialog(appointment.id, 'confirm')}
            >
              <Ionicons name="checkmark-circle" size={18} color={colors.white} />
              <Text style={styles.actionButtonText}>{t('appointments.confirmBtn')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => showConfirmDialog(appointment.id, 'cancel')}
            >
              <Ionicons name="close-circle" size={18} color={colors.white} />
              <Text style={styles.actionButtonText}>{t('appointments.cancelBtn')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {canManage && appointment.status === 'confirmed' && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.completeButton]}
              onPress={() => showConfirmDialog(appointment.id, 'complete')}
            >
              <Ionicons name="checkbox" size={18} color={colors.white} />
              <Text style={styles.actionButtonText}>{t('appointments.complete')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {canCancel && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => showConfirmDialog(appointment.id, 'delete')}
            >
              <Ionicons name="trash" size={18} color={colors.white} />
              <Text style={styles.actionButtonText}>{t('appointments.cancelAppointment')}</Text>
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
          {user?.role === 'patient' ? t('appointments.title') : t('appointments.manageTitle')}
        </Text>
        <Text style={styles.subtitle}>
          {appointments.length} {isRTL ? 'موعد' : (appointments.length === 1 ? 'appointment' : 'appointments')}
        </Text>

        {loading ? (
          <View style={styles.emptyContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : appointments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={60} color={colors.textLight} />
            <Text style={styles.emptyText}>{t('appointments.noAppointments')}</Text>
          </View>
        ) : (
          appointments.map(renderAppointmentCard)
        )}
      </ScrollView>

      <ConfirmDialog
        visible={confirmDialog.visible}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        confirmColor={confirmDialog.confirmColor}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmDialog({ ...confirmDialog, visible: false })}
        loading={actionLoading}
      />
    </View>
  );
}
