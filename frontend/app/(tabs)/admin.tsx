import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { offersAPI, appointmentsAPI } from '../../utils/api';
import Modal from 'react-native-modal';

interface Offer {
  id: string;
  title: string;
  description: string;
  discount: string;
  valid_until: string;
}

export default function AdminScreen() {
  const router = useRouter();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerTitle, setOfferTitle] = useState('');
  const [offerDescription, setOfferDescription] = useState('');
  const [offerDiscount, setOfferDiscount] = useState('');
  const [offerValidUntil, setOfferValidUntil] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    await Promise.all([fetchOffers(), fetchStats()]);
  };

  const fetchOffers = async () => {
    try {
      const data = await offersAPI.getAll();
      setOffers(data);
    } catch (error) {
      console.error('Error fetching offers:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const appointments = await appointmentsAPI.getAll();
      const pending = appointments.filter((apt: any) => apt.status === 'pending').length;
      const confirmed = appointments.filter((apt: any) => apt.status === 'confirmed').length;
      const completed = appointments.filter((apt: any) => apt.status === 'completed').length;
      
      setStats({
        totalAppointments: appointments.length,
        pending,
        confirmed,
        completed,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleCreateOffer = async () => {
    if (!offerTitle || !offerDescription || !offerDiscount || !offerValidUntil) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await offersAPI.create({
        title: offerTitle,
        description: offerDescription,
        discount: offerDiscount,
        valid_until: offerValidUntil,
      });
      Alert.alert('Success', 'Offer created successfully');
      setShowOfferModal(false);
      setOfferTitle('');
      setOfferDescription('');
      setOfferDiscount('');
      setOfferValidUntil('');
      fetchOffers();
    } catch (error) {
      Alert.alert('Error', 'Failed to create offer');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOffer = (offerId: string) => {
    Alert.alert(
      'Delete Offer',
      'Are you sure you want to delete this offer?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await offersAPI.delete(offerId);
              Alert.alert('Success', 'Offer deleted successfully');
              fetchOffers();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete offer');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.title}>Admin Dashboard</Text>

        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: Colors.primary }]}>
            <Ionicons name="calendar" size={30} color={Colors.white} />
            <Text style={styles.statValue}>{stats.totalAppointments}</Text>
            <Text style={styles.statLabel}>Total Appointments</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#F59E0B' }]}>
            <Ionicons name="time" size={30} color={Colors.white} />
            <Text style={styles.statValue}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: Colors.secondary }]}>
            <Ionicons name="checkmark-circle" size={30} color={Colors.white} />
            <Text style={styles.statValue}>{stats.confirmed}</Text>
            <Text style={styles.statLabel}>Confirmed</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: Colors.success }]}>
            <Ionicons name="checkbox" size={30} color={Colors.white} />
            <Text style={styles.statValue}>{stats.completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Special Offers</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowOfferModal(true)}
            >
              <Ionicons name="add-circle" size={24} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          {offers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="pricetag-outline" size={50} color={Colors.textLight} />
              <Text style={styles.emptyText}>No offers yet</Text>
            </View>
          ) : (
            offers.map((offer) => (
              <View key={offer.id} style={styles.offerCard}>
                <View style={styles.offerHeader}>
                  <Ionicons name="pricetag" size={20} color={Colors.secondary} />
                  <Text style={styles.offerTitle}>{offer.title}</Text>
                  <TouchableOpacity 
                    onPress={() => handleDeleteOffer(offer.id)}
                    style={styles.deleteButton}
                  >
                    <Ionicons name="trash" size={18} color={Colors.error} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.offerDescription}>{offer.description}</Text>
                <View style={styles.offerFooter}>
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>{offer.discount}</Text>
                  </View>
                  <Text style={styles.validText}>Valid until: {offer.valid_until}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/staff')}
          >
            <Ionicons name="people" size={24} color={Colors.primary} />
            <Text style={styles.actionText}>Manage Staff</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/analytics')}
          >
            <Ionicons name="bar-chart" size={24} color={Colors.secondary} />
            <Text style={styles.actionText}>View Analytics</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/settings')}
          >
            <Ionicons name="settings" size={24} color={Colors.primary} />
            <Text style={styles.actionText}>App Settings</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        isVisible={showOfferModal}
        onBackdropPress={() => !loading && setShowOfferModal(false)}
        onBackButtonPress={() => !loading && setShowOfferModal(false)}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Create New Offer</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Summer Special"
              placeholderTextColor={Colors.textLight}
              value={offerTitle}
              onChangeText={setOfferTitle}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe the offer..."
              placeholderTextColor={Colors.textLight}
              value={offerDescription}
              onChangeText={setOfferDescription}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Discount</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 20% OFF"
              placeholderTextColor={Colors.textLight}
              value={offerDiscount}
              onChangeText={setOfferDiscount}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Valid Until</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 2025-12-31"
              placeholderTextColor={Colors.textLight}
              value={offerValidUntil}
              onChangeText={setOfferValidUntil}
            />
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowOfferModal(false)}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton, loading && styles.buttonDisabled]}
              onPress={handleCreateOffer}
              disabled={loading}
            >
              <Text style={styles.confirmButtonText}>
                {loading ? 'Creating...' : 'Create'}
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
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.white,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.white,
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  addButton: {
    padding: 4,
  },
  offerCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  offerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  offerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginLeft: 8,
  },
  offerDescription: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 12,
    lineHeight: 20,
  },
  offerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  discountBadge: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  discountText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  validText: {
    fontSize: 12,
    color: Colors.textLight,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    marginLeft: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: Colors.white,
    borderRadius: 16,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 12,
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
