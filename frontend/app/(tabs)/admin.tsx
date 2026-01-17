import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { offersAPI, appointmentsAPI } from '../../utils/api';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import Modal from 'react-native-modal';
import ConfirmDialog from '../../components/ConfirmDialog';

interface Offer {
  id: string;
  title: string;
  description: string;
  discount: string;
  valid_until: string;
}

export default function AdminScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
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

  // Delete confirmation dialog state
  const [deleteDialog, setDeleteDialog] = useState({
    visible: false,
    offerId: '',
    offerTitle: '',
  });

  // Success/Error message state
  const [messageDialog, setMessageDialog] = useState({
    visible: false,
    title: '',
    message: '',
    isError: false,
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

  const showMessage = (title: string, message: string, isError: boolean = false) => {
    setMessageDialog({
      visible: true,
      title,
      message,
      isError,
    });
  };

  const handleCreateOffer = async () => {
    if (!offerTitle || !offerDescription || !offerDiscount || !offerValidUntil) {
      showMessage(
        t('common.error'), 
        isRTL ? 'يرجى ملء جميع الحقول' : 'Please fill in all fields',
        true
      );
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
      
      setShowOfferModal(false);
      setOfferTitle('');
      setOfferDescription('');
      setOfferDiscount('');
      setOfferValidUntil('');
      fetchOffers();
      
      showMessage(
        t('common.success'), 
        isRTL ? 'تم إنشاء العرض بنجاح' : 'Offer created successfully'
      );
    } catch (error) {
      showMessage(
        t('common.error'), 
        isRTL ? 'فشل إنشاء العرض' : 'Failed to create offer',
        true
      );
    } finally {
      setLoading(false);
    }
  };

  const showDeleteConfirmation = (offerId: string, title: string) => {
    setDeleteDialog({
      visible: true,
      offerId,
      offerTitle: title,
    });
  };

  const handleDeleteOffer = async () => {
    setLoading(true);
    try {
      await offersAPI.delete(deleteDialog.offerId);
      setDeleteDialog({ ...deleteDialog, visible: false });
      fetchOffers();
      showMessage(
        t('common.success'), 
        isRTL ? 'تم حذف العرض بنجاح' : 'Offer deleted successfully'
      );
    } catch (error) {
      console.error('Error deleting offer:', error);
      showMessage(
        t('common.error'), 
        isRTL ? 'فشل حذف العرض' : 'Failed to delete offer',
        true
      );
    } finally {
      setLoading(false);
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
      marginBottom: 20,
      textAlign: isRTL ? 'right' : 'left',
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
      color: colors.white,
      marginTop: 8,
    },
    statLabel: {
      fontSize: 12,
      color: colors.white,
      marginTop: 4,
      textAlign: 'center',
    },
    section: {
      marginBottom: 24,
    },
    sectionHeader: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
    },
    addButton: {
      padding: 8,
      backgroundColor: colors.primary + '20',
      borderRadius: 20,
    },
    offerCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
    },
    offerHeader: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    offerTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
      marginLeft: isRTL ? 0 : 8,
      marginRight: isRTL ? 8 : 0,
      flex: 1,
      textAlign: isRTL ? 'right' : 'left',
    },
    deleteButton: {
      padding: 10,
      backgroundColor: colors.error + '15',
      borderRadius: 8,
    },
    offerDescription: {
      fontSize: 14,
      color: colors.textLight,
      marginBottom: 12,
      lineHeight: 20,
      textAlign: isRTL ? 'right' : 'left',
    },
    offerFooter: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    discountBadge: {
      backgroundColor: colors.secondary,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
    },
    discountText: {
      color: colors.white,
      fontSize: 12,
      fontWeight: 'bold',
    },
    validText: {
      fontSize: 12,
      color: colors.textLight,
    },
    actionCard: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
    },
    actionText: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
      marginLeft: isRTL ? 0 : 12,
      marginRight: isRTL ? 12 : 0,
      textAlign: isRTL ? 'right' : 'left',
    },
    emptyContainer: {
      alignItems: 'center',
      padding: 40,
      backgroundColor: colors.card,
      borderRadius: 16,
    },
    emptyText: {
      fontSize: 14,
      color: colors.textLight,
      marginTop: 12,
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
    // Message dialog styles
    messageModal: {
      margin: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    messageContainer: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 24,
      width: '100%',
      maxWidth: 320,
      alignItems: 'center',
    },
    messageIcon: {
      marginBottom: 16,
    },
    messageTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    messageText: {
      fontSize: 14,
      color: colors.textLight,
      marginBottom: 20,
      textAlign: 'center',
      lineHeight: 20,
    },
    messageButton: {
      backgroundColor: colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 40,
      borderRadius: 10,
    },
    messageButtonText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.title}>{t('admin.dashboard')}</Text>

        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.primary }]}>
            <Ionicons name="calendar" size={30} color={colors.white} />
            <Text style={styles.statValue}>{stats.totalAppointments}</Text>
            <Text style={styles.statLabel}>{isRTL ? 'إجمالي المواعيد' : 'Total Appointments'}</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#F59E0B' }]}>
            <Ionicons name="time" size={30} color={colors.white} />
            <Text style={styles.statValue}>{stats.pending}</Text>
            <Text style={styles.statLabel}>{isRTL ? 'قيد الانتظار' : 'Pending'}</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.secondary }]}>
            <Ionicons name="checkmark-circle" size={30} color={colors.white} />
            <Text style={styles.statValue}>{stats.confirmed}</Text>
            <Text style={styles.statLabel}>{isRTL ? 'مؤكد' : 'Confirmed'}</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.success }]}>
            <Ionicons name="checkbox" size={30} color={colors.white} />
            <Text style={styles.statValue}>{stats.completed}</Text>
            <Text style={styles.statLabel}>{isRTL ? 'مكتمل' : 'Completed'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('admin.specialOffers')}</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowOfferModal(true)}
            >
              <Ionicons name="add-circle" size={28} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {offers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="pricetag-outline" size={50} color={colors.textLight} />
              <Text style={styles.emptyText}>{t('admin.noOffers')}</Text>
            </View>
          ) : (
            offers.map((offer) => (
              <View key={offer.id} style={styles.offerCard}>
                <View style={styles.offerHeader}>
                  <Ionicons name="pricetag" size={20} color={colors.secondary} />
                  <Text style={styles.offerTitle}>{offer.title}</Text>
                  <TouchableOpacity 
                    onPress={() => showDeleteConfirmation(offer.id, offer.title)}
                    style={styles.deleteButton}
                  >
                    <Ionicons name="trash" size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.offerDescription}>{offer.description}</Text>
                <View style={styles.offerFooter}>
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>{offer.discount}</Text>
                  </View>
                  <Text style={styles.validText}>
                    {isRTL ? 'صالح حتى: ' : 'Valid until: '}{offer.valid_until}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('admin.quickActions')}</Text>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/appointments')}
          >
            <Ionicons name="calendar" size={24} color={colors.primary} />
            <Text style={styles.actionText}>{t('admin.manageAllAppointments')}</Text>
            <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={20} color={colors.textLight} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/staff')}
          >
            <Ionicons name="people" size={24} color={colors.primary} />
            <Text style={styles.actionText}>{t('admin.manageStaff')}</Text>
            <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={20} color={colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/analytics')}
          >
            <Ionicons name="bar-chart" size={24} color={colors.secondary} />
            <Text style={styles.actionText}>{t('admin.viewAnalytics')}</Text>
            <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={20} color={colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/settings')}
          >
            <Ionicons name="settings" size={24} color={colors.primary} />
            <Text style={styles.actionText}>{t('admin.appSettings')}</Text>
            <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={20} color={colors.textLight} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Create Offer Modal */}
      <Modal
        isVisible={showOfferModal}
        onBackdropPress={() => !loading && setShowOfferModal(false)}
        onBackButtonPress={() => !loading && setShowOfferModal(false)}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{t('admin.createOffer')}</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t('admin.offerTitle')}</Text>
            <TextInput
              style={styles.input}
              placeholder={isRTL ? 'مثال: عرض الصيف' : 'e.g., Summer Special'}
              placeholderTextColor={colors.textLight}
              value={offerTitle}
              onChangeText={setOfferTitle}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t('admin.offerDescription')}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder={isRTL ? 'وصف العرض...' : 'Describe the offer...'}
              placeholderTextColor={colors.textLight}
              value={offerDescription}
              onChangeText={setOfferDescription}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t('admin.discount')}</Text>
            <TextInput
              style={styles.input}
              placeholder={isRTL ? 'مثال: خصم 20%' : 'e.g., 20% OFF'}
              placeholderTextColor={colors.textLight}
              value={offerDiscount}
              onChangeText={setOfferDiscount}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t('admin.validUntil')}</Text>
            <TextInput
              style={styles.input}
              placeholder={isRTL ? 'مثال: 2025-12-31' : 'e.g., 2025-12-31'}
              placeholderTextColor={colors.textLight}
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
              <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton, loading && styles.buttonDisabled]}
              onPress={handleCreateOffer}
              disabled={loading}
            >
              <Text style={styles.confirmButtonText}>
                {loading ? t('common.loading') : t('common.add')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        visible={deleteDialog.visible}
        title={isRTL ? 'حذف العرض' : 'Delete Offer'}
        message={isRTL 
          ? `هل أنت متأكد من حذف "${deleteDialog.offerTitle}"؟`
          : `Are you sure you want to delete "${deleteDialog.offerTitle}"?`
        }
        confirmText={isRTL ? 'حذف' : 'Delete'}
        confirmColor={colors.error}
        onConfirm={handleDeleteOffer}
        onCancel={() => setDeleteDialog({ ...deleteDialog, visible: false })}
        loading={loading}
      />

      {/* Message Dialog */}
      <Modal
        isVisible={messageDialog.visible}
        onBackdropPress={() => setMessageDialog({ ...messageDialog, visible: false })}
        style={styles.messageModal}
      >
        <View style={styles.messageContainer}>
          <Ionicons 
            name={messageDialog.isError ? 'close-circle' : 'checkmark-circle'} 
            size={50} 
            color={messageDialog.isError ? colors.error : colors.success}
            style={styles.messageIcon}
          />
          <Text style={styles.messageTitle}>{messageDialog.title}</Text>
          <Text style={styles.messageText}>{messageDialog.message}</Text>
          <TouchableOpacity
            style={[styles.messageButton, { backgroundColor: messageDialog.isError ? colors.error : colors.success }]}
            onPress={() => setMessageDialog({ ...messageDialog, visible: false })}
          >
            <Text style={styles.messageButtonText}>{isRTL ? 'حسناً' : 'OK'}</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}
