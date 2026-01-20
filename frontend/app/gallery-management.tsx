import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import Modal from 'react-native-modal';
import ConfirmDialog from '../components/ConfirmDialog';

const { width } = Dimensions.get('window');
const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
  created_at?: string;
}

const categories = [
  { id: 'treatments', labelAr: 'العلاجات', labelEn: 'Treatments' },
  { id: 'clinic', labelAr: 'العيادة', labelEn: 'Clinic' },
  { id: 'offers', labelAr: 'العروض', labelEn: 'Offers' },
];

export default function GalleryManagementScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form fields
  const [imageTitle, setImageTitle] = useState('');
  const [imageDescription, setImageDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageCategory, setImageCategory] = useState('treatments');
  
  // Delete dialog
  const [deleteDialog, setDeleteDialog] = useState({
    visible: false,
    itemId: '',
    itemTitle: '',
  });

  // Message dialog
  const [messageDialog, setMessageDialog] = useState({
    visible: false,
    title: '',
    message: '',
    isError: false,
  });

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      const response = await fetch(`${API_URL}/api/gallery`);
      if (response.ok) {
        const data = await response.json();
        setGallery(data);
      }
    } catch (error) {
      console.error('Error fetching gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchGallery();
    setRefreshing(false);
  };

  const showMessage = (title: string, message: string, isError: boolean = false) => {
    setMessageDialog({ visible: true, title, message, isError });
  };

  const handleAddImage = async () => {
    if (!imageTitle || !imageUrl) {
      showMessage(
        isRTL ? 'خطأ' : 'Error',
        isRTL ? 'يرجى إدخال العنوان والرابط' : 'Please enter title and URL',
        true
      );
      return;
    }

    // Validate URL
    if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      showMessage(
        isRTL ? 'خطأ' : 'Error',
        isRTL ? 'يرجى إدخال رابط صحيح يبدأ بـ http:// أو https://' : 'Please enter a valid URL starting with http:// or https://',
        true
      );
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/gallery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: imageTitle,
          description: imageDescription,
          url: imageUrl,
          category: imageCategory,
        }),
      });

      if (response.ok) {
        setShowAddModal(false);
        clearForm();
        fetchGallery();
        showMessage(
          isRTL ? 'نجاح' : 'Success',
          isRTL ? 'تمت إضافة الصورة بنجاح' : 'Image added successfully'
        );
      } else {
        throw new Error('Failed to add image');
      }
    } catch (error) {
      showMessage(
        isRTL ? 'خطأ' : 'Error',
        isRTL ? 'فشل إضافة الصورة' : 'Failed to add image',
        true
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteImage = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/gallery/${deleteDialog.itemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDeleteDialog({ ...deleteDialog, visible: false });
        fetchGallery();
        showMessage(
          isRTL ? 'نجاح' : 'Success',
          isRTL ? 'تم حذف الصورة بنجاح' : 'Image deleted successfully'
        );
      } else {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      showMessage(
        isRTL ? 'خطأ' : 'Error',
        isRTL ? 'فشل حذف الصورة' : 'Failed to delete image',
        true
      );
    } finally {
      setSaving(false);
    }
  };

  const clearForm = () => {
    setImageTitle('');
    setImageDescription('');
    setImageUrl('');
    setImageCategory('treatments');
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      padding: 20,
      paddingTop: 60,
      backgroundColor: colors.primary,
    },
    backButton: {
      padding: 8,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.white,
      flex: 1,
      textAlign: 'center',
      marginHorizontal: 10,
    },
    addButton: {
      padding: 8,
    },
    contentContainer: {
      padding: 16,
      paddingBottom: 40,
    },
    infoCard: {
      backgroundColor: colors.card,
      padding: 16,
      borderRadius: 12,
      marginBottom: 16,
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
    },
    infoText: {
      flex: 1,
      fontSize: 14,
      color: colors.textLight,
      marginLeft: isRTL ? 0 : 12,
      marginRight: isRTL ? 12 : 0,
      textAlign: isRTL ? 'right' : 'left',
      lineHeight: 20,
    },
    statsRow: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      justifyContent: 'space-around',
      backgroundColor: colors.card,
      padding: 16,
      borderRadius: 12,
      marginBottom: 16,
    },
    statItem: {
      alignItems: 'center',
    },
    statNumber: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.primary,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textLight,
      marginTop: 4,
    },
    imageCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      marginBottom: 12,
      overflow: 'hidden',
    },
    imagePreview: {
      width: '100%',
      height: 150,
      backgroundColor: colors.background,
    },
    imageInfo: {
      padding: 12,
    },
    imageHeader: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    imageTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
      flex: 1,
      textAlign: isRTL ? 'right' : 'left',
    },
    deleteBtn: {
      padding: 8,
      backgroundColor: colors.error + '15',
      borderRadius: 8,
    },
    imageDescription: {
      fontSize: 13,
      color: colors.textLight,
      marginTop: 4,
      textAlign: isRTL ? 'right' : 'left',
    },
    categoryBadge: {
      alignSelf: isRTL ? 'flex-end' : 'flex-start',
      backgroundColor: colors.primary + '20',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
      marginTop: 8,
    },
    categoryBadgeText: {
      fontSize: 11,
      color: colors.primary,
      fontWeight: '600',
    },
    emptyContainer: {
      alignItems: 'center',
      padding: 60,
      backgroundColor: colors.card,
      borderRadius: 16,
    },
    emptyText: {
      fontSize: 16,
      color: colors.textLight,
      marginTop: 16,
      textAlign: 'center',
    },
    emptySubtext: {
      fontSize: 14,
      color: colors.textLight,
      marginTop: 8,
      textAlign: 'center',
      opacity: 0.7,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    // Modal styles
    modal: {
      margin: 0,
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 24,
      maxHeight: '85%',
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
      padding: 14,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      fontSize: 15,
      color: colors.text,
      textAlign: isRTL ? 'right' : 'left',
    },
    textArea: {
      height: 80,
      textAlignVertical: 'top',
    },
    categorySelector: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    categoryOption: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    categoryOptionActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    categoryOptionText: {
      fontSize: 14,
      color: colors.text,
    },
    categoryOptionTextActive: {
      color: colors.white,
    },
    previewSection: {
      marginTop: 8,
    },
    previewLabel: {
      fontSize: 12,
      color: colors.textLight,
      marginBottom: 8,
      textAlign: isRTL ? 'right' : 'left',
    },
    previewImage: {
      width: '100%',
      height: 150,
      borderRadius: 10,
      backgroundColor: colors.background,
    },
    modalButtons: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 16,
    },
    modalButton: {
      flex: 1,
      padding: 14,
      borderRadius: 10,
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
    // Message modal
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
    messageTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginTop: 12,
      marginBottom: 8,
    },
    messageText: {
      fontSize: 14,
      color: colors.textLight,
      marginBottom: 20,
      textAlign: 'center',
    },
    messageButton: {
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

  const getCategoryLabel = (categoryId: string) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat ? (isRTL ? cat.labelAr : cat.labelEn) : categoryId;
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isRTL ? 'إدارة المعرض' : 'Gallery Management'}
        </Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
          <Ionicons name="add-circle" size={28} color={colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.contentContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color={colors.primary} />
          <Text style={styles.infoText}>
            {isRTL 
              ? 'يمكنك إضافة صور من الإنترنت عن طريق لصق رابط الصورة. استخدم خدمات مثل Imgur أو Google Photos للحصول على روابط الصور.'
              : 'Add images from the internet by pasting the image URL. Use services like Imgur or Google Photos to get image URLs.'}
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{gallery.length}</Text>
            <Text style={styles.statLabel}>{isRTL ? 'إجمالي الصور' : 'Total Images'}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {gallery.filter(i => i.category === 'treatments').length}
            </Text>
            <Text style={styles.statLabel}>{isRTL ? 'علاجات' : 'Treatments'}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {gallery.filter(i => i.category === 'clinic').length}
            </Text>
            <Text style={styles.statLabel}>{isRTL ? 'العيادة' : 'Clinic'}</Text>
          </View>
        </View>

        {/* Gallery Items */}
        {gallery.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="images-outline" size={80} color={colors.textLight} />
            <Text style={styles.emptyText}>
              {isRTL ? 'لا توجد صور حالياً' : 'No images yet'}
            </Text>
            <Text style={styles.emptySubtext}>
              {isRTL ? 'اضغط على + لإضافة صورة جديدة' : 'Tap + to add a new image'}
            </Text>
          </View>
        ) : (
          gallery.map((item) => (
            <View key={item.id} style={styles.imageCard}>
              <Image
                source={{ uri: item.url }}
                style={styles.imagePreview}
                resizeMode="cover"
              />
              <View style={styles.imageInfo}>
                <View style={styles.imageHeader}>
                  <Text style={styles.imageTitle}>{item.title}</Text>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => setDeleteDialog({
                      visible: true,
                      itemId: item.id,
                      itemTitle: item.title,
                    })}
                  >
                    <Ionicons name="trash" size={18} color={colors.error} />
                  </TouchableOpacity>
                </View>
                {item.description ? (
                  <Text style={styles.imageDescription} numberOfLines={2}>
                    {item.description}
                  </Text>
                ) : null}
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>
                    {getCategoryLabel(item.category)}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Image Modal */}
      <Modal
        isVisible={showAddModal}
        onBackdropPress={() => !saving && setShowAddModal(false)}
        style={styles.modal}
      >
        <ScrollView>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isRTL ? 'إضافة صورة جديدة' : 'Add New Image'}
            </Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>{isRTL ? 'عنوان الصورة *' : 'Image Title *'}</Text>
              <TextInput
                style={styles.input}
                placeholder={isRTL ? 'مثال: تبييض الأسنان' : 'e.g., Teeth Whitening'}
                placeholderTextColor={colors.textLight}
                value={imageTitle}
                onChangeText={setImageTitle}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>{isRTL ? 'الوصف' : 'Description'}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder={isRTL ? 'وصف اختياري...' : 'Optional description...'}
                placeholderTextColor={colors.textLight}
                value={imageDescription}
                onChangeText={setImageDescription}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>{isRTL ? 'رابط الصورة *' : 'Image URL *'}</Text>
              <TextInput
                style={styles.input}
                placeholder="https://..."
                placeholderTextColor={colors.textLight}
                value={imageUrl}
                onChangeText={setImageUrl}
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>

            {imageUrl && imageUrl.startsWith('http') && (
              <View style={styles.previewSection}>
                <Text style={styles.previewLabel}>
                  {isRTL ? 'معاينة:' : 'Preview:'}
                </Text>
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.previewImage}
                  resizeMode="cover"
                />
              </View>
            )}

            <View style={styles.formGroup}>
              <Text style={styles.label}>{isRTL ? 'التصنيف' : 'Category'}</Text>
              <View style={styles.categorySelector}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryOption,
                      imageCategory === cat.id && styles.categoryOptionActive,
                    ]}
                    onPress={() => setImageCategory(cat.id)}
                  >
                    <Text style={[
                      styles.categoryOptionText,
                      imageCategory === cat.id && styles.categoryOptionTextActive,
                    ]}>
                      {isRTL ? cat.labelAr : cat.labelEn}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowAddModal(false);
                  clearForm();
                }}
                disabled={saving}
              >
                <Text style={styles.cancelButtonText}>
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton, saving && styles.buttonDisabled]}
                onPress={handleAddImage}
                disabled={saving}
              >
                <Text style={styles.confirmButtonText}>
                  {saving ? (isRTL ? 'جاري الإضافة...' : 'Adding...') : (isRTL ? 'إضافة' : 'Add')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        visible={deleteDialog.visible}
        title={isRTL ? 'حذف الصورة' : 'Delete Image'}
        message={isRTL
          ? `هل أنت متأكد من حذف "${deleteDialog.itemTitle}"؟`
          : `Are you sure you want to delete "${deleteDialog.itemTitle}"?`
        }
        confirmText={isRTL ? 'حذف' : 'Delete'}
        confirmColor={colors.error}
        onConfirm={handleDeleteImage}
        onCancel={() => setDeleteDialog({ ...deleteDialog, visible: false })}
        loading={saving}
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
          />
          <Text style={styles.messageTitle}>{messageDialog.title}</Text>
          <Text style={styles.messageText}>{messageDialog.message}</Text>
          <TouchableOpacity
            style={[styles.messageButton, {
              backgroundColor: messageDialog.isError ? colors.error : colors.success
            }]}
            onPress={() => setMessageDialog({ ...messageDialog, visible: false })}
          >
            <Text style={styles.messageButtonText}>{isRTL ? 'حسناً' : 'OK'}</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}
