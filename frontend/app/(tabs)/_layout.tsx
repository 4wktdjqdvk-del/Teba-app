import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

export default function TabLayout() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const { t } = useTranslation();

  // Safe role checks
  const isGuest = user && 'isGuest' in user && user.isGuest === true;
  const isPatient = user?.role === 'patient';
  const isDoctor = user?.role === 'doctor';
  const isReceptionist = user?.role === 'receptionist';
  const isAdmin = user?.role === 'admin';
  const isNurse = user?.role === 'nurse';
  const isStaff = isDoctor || isNurse || isReceptionist || isAdmin;

  // Guests should NOT see appointments tab (they don't have history)
  const canSeeAppointments = !isGuest && (isPatient || isStaff);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="doctors"
        options={{
          title: t('tabs.doctors'),
          tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} />,
        }}
      />

      <Tabs.Screen
        name="appointments"
        options={{
          title: t('tabs.appointments'),
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar" size={size} color={color} />,
          href: canSeeAppointments ? undefined : null,
        }}
      />

      <Tabs.Screen
        name="admin"
        options={{
          title: t('tabs.admin'),
          tabBarIcon: ({ color, size }) => <Ionicons name="settings" size={size} color={color} />,
          href: isAdmin ? undefined : null,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
