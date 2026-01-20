import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  RefreshControl,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import Modal from 'react-native-modal';

const { width } = Dimensions.get('window');
const imageWidth = (width - 60) / 2;

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

interface MediaItem {
  id: string;
  url: string;
  title: string;
  description: string;
  category: string;
  created_at?: string;
}

const categories = [
  { id: 'all', labelAr: 'الكل', labelEn: 'All' },
  { id: 'treatments', labelAr: 'العلاجات', labelEn: 'Treatments' },
  { id: 'clinic', labelAr: 'العيادة', labelEn: 'Clinic' },
  { id: 'offers', labelAr: 'العروض', labelEn: 'Offers' },
];

export default function GalleryScreen() {
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [galleryData, setGalleryData] = useState<MediaItem[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch gallery data from API
  const fetchGallery = async () => {
    try {
      const response = await fetch(`${API_URL}/api/gallery`);
      if (response.ok) {
        const data = await response.json();
        setGalleryData(data);
      }
    } catch (error) {
      console.error('Error fetching gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const filteredMedia = selectedCategory === 'all' 
    ? galleryData 
    : galleryData.filter(item => item.category === selectedCategory);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchGallery();
    setRefreshing(false);
  };

  const openMedia = (item: MediaItem) => {
    setSelectedMedia(item);
    setShowModal(true);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      padding: 20,
      paddingTop: 60,
      backgroundColor: colors.primary,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.white,
      textAlign: isRTL ? 'right' : 'left',
    },
    headerSubtitle: {
      fontSize: 14,
      color: colors.white,
      opacity: 0.9,
      marginTop: 4,
      textAlign: isRTL ? 'right' : 'left',
    },
    categoriesContainer: {
      paddingVertical: 16,
      paddingHorizontal: 20,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    categoriesScroll: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
    },
    categoryButton: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 20,
      marginRight: isRTL ? 0 : 10,
      marginLeft: isRTL ? 10 : 0,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    categoryButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    categoryText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    categoryTextActive: {
      color: colors.white,
    },
    contentContainer: {
      padding: 20,
      paddingBottom: 40,
    },
    gridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    mediaCard: {
      width: imageWidth,
      marginBottom: 16,
      borderRadius: 16,
      overflow: 'hidden',
      backgroundColor: colors.card,
      ...Platform.select({
        web: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
        default: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        },
      }),
    },
    mediaImage: {
      width: '100%',
      height: imageWidth,
      backgroundColor: colors.background,
    },
    mediaInfo: {
      padding: 12,
    },
    mediaTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 4,
      textAlign: isRTL ? 'right' : 'left',
    },
    mediaDescription: {
      fontSize: 12,
      color: colors.textLight,
      textAlign: isRTL ? 'right' : 'left',
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
      textAlign: 'center',
    },
    emptySubtext: {
      fontSize: 14,
      color: colors.textLight,
      marginTop: 8,
      textAlign: 'center',
      opacity: 0.7,
    },
    // Modal styles
    modal: {
      margin: 0,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      width: width - 40,
      maxHeight: '80%',
      backgroundColor: colors.card,
      borderRadius: 20,
      overflow: 'hidden',
    },
    modalImage: {
      width: '100%',
      height: width - 40,
    },
    modalInfo: {
      padding: 20,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
      textAlign: isRTL ? 'right' : 'left',
    },
    modalDescription: {
      fontSize: 14,
      color: colors.textLight,
      lineHeight: 22,
      textAlign: isRTL ? 'right' : 'left',
    },
    closeButton: {
      position: 'absolute',
      top: 10,
      right: 10,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    statsContainer: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      justifyContent: 'space-around',
      padding: 16,
      backgroundColor: colors.card,
      marginBottom: 16,
      borderRadius: 16,
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
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 60,
    },
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {isRTL ? 'معرض الصور' : 'Photo Gallery'}
          </Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.emptyText, { marginTop: 16 }]}>
            {isRTL ? 'جاري التحميل...' : 'Loading...'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {isRTL ? 'معرض الصور' : 'Photo Gallery'}
        </Text>
        <Text style={styles.headerSubtitle}>
          {isRTL ? 'اكتشف خدماتنا وعروضنا' : 'Discover our services and offers'}
        </Text>
      </View>

      <View style={styles.categoriesContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryButton,
                selectedCategory === cat.id && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === cat.id && styles.categoryTextActive,
              ]}>
                {isRTL ? cat.labelAr : cat.labelEn}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {galleryData.length > 0 && (
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {galleryData.filter(i => i.category === 'treatments').length}
              </Text>
              <Text style={styles.statLabel}>{isRTL ? 'علاجات' : 'Treatments'}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {galleryData.filter(i => i.category === 'clinic').length}
              </Text>
              <Text style={styles.statLabel}>{isRTL ? 'العيادة' : 'Clinic'}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {galleryData.filter(i => i.category === 'offers').length}
              </Text>
              <Text style={styles.statLabel}>{isRTL ? 'عروض' : 'Offers'}</Text>
            </View>
          </View>
        )}

        {filteredMedia.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="images-outline" size={80} color={colors.textLight} />
            <Text style={styles.emptyText}>
              {isRTL ? 'لا توجد صور حالياً' : 'No images yet'}
            </Text>
            <Text style={styles.emptySubtext}>
              {isRTL 
                ? 'يمكن للأدمن إضافة صور من لوحة التحكم' 
                : 'Admin can add images from the dashboard'}
            </Text>
          </View>
        ) : (
          <View style={styles.gridContainer}>
            {filteredMedia.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.mediaCard}
                onPress={() => openMedia(item)}
                activeOpacity={0.8}
              >
                <Image
                  source={{ uri: item.url }}
                  style={styles.mediaImage}
                  resizeMode="cover"
                />
                <View style={styles.mediaInfo}>
                  <Text style={styles.mediaTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.mediaDescription} numberOfLines={2}>
                    {item.description}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Image Preview Modal */}
      <Modal
        isVisible={showModal}
        onBackdropPress={() => setShowModal(false)}
        onBackButtonPress={() => setShowModal(false)}
        style={styles.modal}
      >
        {selectedMedia && (
          <View style={styles.modalContent}>
            <Image
              source={{ uri: selectedMedia.url }}
              style={styles.modalImage}
              resizeMode="cover"
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowModal(false)}
            >
              <Ionicons name="close" size={24} color={colors.white} />
            </TouchableOpacity>
            <View style={styles.modalInfo}>
              <Text style={styles.modalTitle}>{selectedMedia.title}</Text>
              <Text style={styles.modalDescription}>{selectedMedia.description}</Text>
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
}
