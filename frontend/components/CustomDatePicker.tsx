import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

interface DatePickerProps {
  visible: boolean;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onClose: () => void;
  minimumDate?: Date;
}

const MONTHS_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTHS_AR = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

const DAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_AR = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

export default function CustomDatePicker({
  visible,
  selectedDate,
  onDateChange,
  onClose,
  minimumDate = new Date(),
}: DatePickerProps) {
  const { colors } = useTheme();
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [currentMonth, setCurrentMonth] = useState(selectedDate.getMonth());
  const [currentYear, setCurrentYear] = useState(selectedDate.getFullYear());
  const [tempSelectedDate, setTempSelectedDate] = useState(selectedDate);

  const months = isRTL ? MONTHS_AR : MONTHS_EN;
  const days = isRTL ? DAYS_AR : DAYS_EN;

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const selectDate = (day: number) => {
    const newDate = new Date(currentYear, currentMonth, day);
    const minDate = new Date(minimumDate);
    minDate.setHours(0, 0, 0, 0);
    if (newDate >= minDate) {
      setTempSelectedDate(newDate);
    }
  };

  const confirmDate = () => {
    onDateChange(tempSelectedDate);
    onClose();
  };

  const isDateDisabled = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    const minDate = new Date(minimumDate);
    minDate.setHours(0, 0, 0, 0);
    return date < minDate;
  };

  const isSelectedDate = (day: number) => {
    return (
      tempSelectedDate.getDate() === day &&
      tempSelectedDate.getMonth() === currentMonth &&
      tempSelectedDate.getFullYear() === currentYear
    );
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth &&
      today.getFullYear() === currentYear
    );
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const calendarDays = [];

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(
        <View key={`empty-${i}`} style={styles.dayCell} />
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const disabled = isDateDisabled(day);
      const selected = isSelectedDate(day);
      const today = isToday(day);

      calendarDays.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.dayCell,
            selected && styles.selectedDay,
            today && !selected && styles.todayCell,
            disabled && styles.disabledDay,
          ]}
          onPress={() => !disabled && selectDate(day)}
          disabled={disabled}
        >
          <Text
            style={[
              styles.dayText,
              selected && styles.selectedDayText,
              today && !selected && styles.todayText,
              disabled && styles.disabledDayText,
            ]}
          >
            {day}
          </Text>
        </TouchableOpacity>
      );
    }

    return calendarDays;
  };

  const styles = StyleSheet.create({
    modal: {
      margin: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    container: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 20,
      width: '100%',
      maxWidth: 350,
      ...Platform.select({
        web: {
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        },
        default: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 10,
          elevation: 8,
        },
      }),
    },
    header: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    monthYearText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
    },
    navButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: colors.background,
    },
    weekDaysRow: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      marginBottom: 10,
    },
    weekDay: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 8,
    },
    weekDayText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textLight,
    },
    calendarGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    dayCell: {
      width: '14.28%',
      aspectRatio: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 4,
    },
    dayText: {
      fontSize: 16,
      color: colors.text,
    },
    selectedDay: {
      backgroundColor: colors.primary,
      borderRadius: 20,
    },
    selectedDayText: {
      color: colors.white,
      fontWeight: 'bold',
    },
    todayCell: {
      borderWidth: 2,
      borderColor: colors.primary,
      borderRadius: 20,
    },
    todayText: {
      color: colors.primary,
      fontWeight: 'bold',
    },
    disabledDay: {
      opacity: 0.3,
    },
    disabledDayText: {
      color: colors.textLight,
    },
    selectedDateText: {
      textAlign: 'center',
      fontSize: 16,
      color: colors.primary,
      fontWeight: '600',
      marginTop: 16,
      marginBottom: 16,
      padding: 12,
      backgroundColor: colors.background,
      borderRadius: 10,
    },
    buttonContainer: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      gap: 12,
      marginTop: 8,
    },
    button: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    confirmButton: {
      backgroundColor: colors.primary,
    },
    confirmButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.white,
    },
  });

  // Format selected date in Gregorian calendar
  const formatDate = (date: Date) => {
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return isRTL ? `${day} ${month} ${year}` : `${month} ${day}, ${year}`;
  };

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      style={styles.modal}
      animationIn="zoomIn"
      animationOut="zoomOut"
    >
      <View style={styles.container}>
        {/* Header with month/year navigation */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.navButton} onPress={goToPreviousMonth}>
            <Ionicons 
              name={isRTL ? "chevron-forward" : "chevron-back"} 
              size={24} 
              color={colors.primary} 
            />
          </TouchableOpacity>
          <Text style={styles.monthYearText}>
            {months[currentMonth]} {currentYear}
          </Text>
          <TouchableOpacity style={styles.navButton} onPress={goToNextMonth}>
            <Ionicons 
              name={isRTL ? "chevron-back" : "chevron-forward"} 
              size={24} 
              color={colors.primary} 
            />
          </TouchableOpacity>
        </View>

        {/* Week days header */}
        <View style={styles.weekDaysRow}>
          {days.map((day, index) => (
            <View key={index} style={styles.weekDay}>
              <Text style={styles.weekDayText}>{day}</Text>
            </View>
          ))}
        </View>

        {/* Calendar grid */}
        <View style={styles.calendarGrid}>
          {renderCalendar()}
        </View>

        {/* Selected date display */}
        <Text style={styles.selectedDateText}>
          {isRTL ? 'التاريخ المختار: ' : 'Selected: '}
          {formatDate(tempSelectedDate)}
        </Text>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
            <Text style={styles.cancelButtonText}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.confirmButton]} onPress={confirmDate}>
            <Text style={styles.confirmButtonText}>
              {isRTL ? 'تأكيد' : 'Confirm'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
