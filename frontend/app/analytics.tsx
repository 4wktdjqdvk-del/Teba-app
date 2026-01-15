import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { appointmentsAPI } from '../utils/api';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    todayAppointments: 0,
    thisWeekAppointments: 0,
    thisMonthAppointments: 0,
    pendingCount: 0,
    confirmedCount: 0,
    completedCount: 0,
    cancelledCount: 0,
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const appointments = await appointmentsAPI.getAll();
      
      const today = new Date().toISOString().split('T')[0];
      const todayCount = appointments.filter((apt: any) => apt.date === today).length;
      
      // Calculate this week
      const now = new Date();
      const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
      const weekEnd = new Date(now.setDate(now.getDate() - now.getDay() + 6));
      const thisWeekCount = appointments.filter((apt: any) => {
        const aptDate = new Date(apt.date);
        return aptDate >= weekStart && aptDate <= weekEnd;
      }).length;
      
      // Calculate this month
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const monthEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
      const thisMonthCount = appointments.filter((apt: any) => {
        const aptDate = new Date(apt.date);
        return aptDate >= monthStart && aptDate <= monthEnd;
      }).length;
      
      const pending = appointments.filter((apt: any) => apt.status === 'pending').length;
      const confirmed = appointments.filter((apt: any) => apt.status === 'confirmed').length;
      const completed = appointments.filter((apt: any) => apt.status === 'completed').length;
      const cancelled = appointments.filter((apt: any) => apt.status === 'cancelled').length;
      
      setStats({
        totalAppointments: appointments.length,
        todayAppointments: todayCount,
        thisWeekAppointments: thisWeekCount,
        thisMonthAppointments: thisMonthCount,
        pendingCount: pending,
        confirmedCount: confirmed,
        completedCount: completed,
        cancelledCount: cancelled,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytics</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.contentContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appointment Overview</Text>
          
          <View style={styles.bigStatCard}>
            <Ionicons name="calendar" size={40} color={Colors.white} />
            <Text style={styles.bigStatNumber}>{stats.totalAppointments}</Text>
            <Text style={styles.bigStatLabel}>Total Appointments</Text>
          </View>

          <View style={styles.row}>
            <View style={[styles.smallStatCard, { backgroundColor: '#10B981' }]}>
              <Ionicons name="today" size={24} color={Colors.white} />
              <Text style={styles.smallStatNumber}>{stats.todayAppointments}</Text>
              <Text style={styles.smallStatLabel}>Today</Text>
            </View>

            <View style={[styles.smallStatCard, { backgroundColor: '#3B82F6' }]}>
              <Ionicons name="calendar-outline" size={24} color={Colors.white} />
              <Text style={styles.smallStatNumber}>{stats.thisWeekAppointments}</Text>
              <Text style={styles.smallStatLabel}>This Week</Text>
            </View>

            <View style={[styles.smallStatCard, { backgroundColor: '#8B5CF6' }]}>
              <Ionicons name="calendar" size={24} color={Colors.white} />
              <Text style={styles.smallStatNumber}>{stats.thisMonthAppointments}</Text>
              <Text style={styles.smallStatLabel}>This Month</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appointment Status</Text>
          
          <View style={styles.statusCard}>
            <View style={styles.statusRow}>
              <View style={styles.statusLeft}>
                <View style={[styles.statusDot, { backgroundColor: '#F59E0B' }]} />
                <Text style={styles.statusLabel}>Pending</Text>
              </View>
              <Text style={styles.statusValue}>{stats.pendingCount}</Text>
            </View>

            <View style={styles.statusRow}>
              <View style={styles.statusLeft}>
                <View style={[styles.statusDot, { backgroundColor: Colors.primary }]} />
                <Text style={styles.statusLabel}>Confirmed</Text>
              </View>
              <Text style={styles.statusValue}>{stats.confirmedCount}</Text>
            </View>

            <View style={styles.statusRow}>
              <View style={styles.statusLeft}>
                <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
                <Text style={styles.statusLabel}>Completed</Text>
              </View>
              <Text style={styles.statusValue}>{stats.completedCount}</Text>
            </View>

            <View style={styles.statusRow}>
              <View style={styles.statusLeft}>
                <View style={[styles.statusDot, { backgroundColor: Colors.error }]} />
                <Text style={styles.statusLabel}>Cancelled</Text>
              </View>
              <Text style={styles.statusValue}>{stats.cancelledCount}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Metrics</Text>
          
          <View style={styles.metricCard}>
            <View style={styles.metricRow}>
              <View style={styles.metricIcon}>
                <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
              </View>
              <View style={styles.metricInfo}>
                <Text style={styles.metricLabel}>Completion Rate</Text>
                <Text style={styles.metricValue}>
                  {stats.totalAppointments > 0
                    ? Math.round((stats.completedCount / stats.totalAppointments) * 100)
                    : 0}%
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricRow}>
              <View style={styles.metricIcon}>
                <Ionicons name="close-circle" size={24} color={Colors.error} />
              </View>
              <View style={styles.metricInfo}>
                <Text style={styles.metricLabel}>Cancellation Rate</Text>
                <Text style={styles.metricValue}>
                  {stats.totalAppointments > 0
                    ? Math.round((stats.cancelledCount / stats.totalAppointments) * 100)
                    : 0}%
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricRow}>
              <View style={styles.metricIcon}>
                <Ionicons name="trending-up" size={24} color={Colors.primary} />
              </View>
              <View style={styles.metricInfo}>
                <Text style={styles.metricLabel}>Average Daily Appointments</Text>
                <Text style={styles.metricValue}>
                  {Math.round(stats.thisMonthAppointments / 30)}
                </Text>
              </View>
            </View>
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
    marginBottom: 16,
  },
  bigStatCard: {
    backgroundColor: Colors.primary,
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  bigStatNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.white,
    marginVertical: 8,
  },
  bigStatLabel: {
    fontSize: 16,
    color: Colors.white,
    opacity: 0.9,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  smallStatCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  smallStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
    marginTop: 8,
  },
  smallStatLabel: {
    fontSize: 12,
    color: Colors.white,
    marginTop: 4,
    textAlign: 'center',
  },
  statusCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusLabel: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600',
  },
  statusValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  metricCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  metricInfo: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
});
