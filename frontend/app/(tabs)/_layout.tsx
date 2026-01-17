import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';

export default function TabLayout() {
  const { user } = useAuth();

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
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textLight,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: Colors.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'الرئيسية',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="doctors"
        options={{
          title: 'الأطباء',
          tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} />,
        }}
      />

      <Tabs.Screen
        name="appointments"
        options={{
          title: 'المواعيد',
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar" size={size} color={color} />,
          href: canSeeAppointments ? undefined : null,
        }}
      />

      <Tabs.Screen
        name="admin"
        options={{
          title: 'الإدارة',
          tabBarIcon: ({ color, size }) => <Ionicons name="settings" size={size} color={color} />,
          href: isAdmin ? undefined : null,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'حسابي',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
