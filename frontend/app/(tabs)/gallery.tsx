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
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import Modal from 'react-native-modal';

const { width } = Dimensions.get('window');
const imageWidth = (width - 60) / 2;

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  title: string;
  description: string;
  category: string;
}

// Sample gallery data - in production, this would come from the backend
const galleryData: MediaItem[] = [
  {
    id: '1',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800',
    title: 'تبييض الأسنان',
    description: 'نتائج مذهلة لتبييض الأسنان بالليزر',
    category: 'treatments',
  },
  {
    id: '2',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800',
    title: 'زراعة الأسنان',
    description: 'تقنية زراعة الأسنان الحديثة',
    category: 'treatments',
  },
  {
    id: '3',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=800',
    title: 'تقويم الأسنان',
    description: 'تقويم شفاف للحصول على ابتسامة مثالية',
    category: 'treatments',
  },
  {
    id: '4',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800',
    title: 'عيادتنا الحديثة',
    description: 'مرافق متطورة لراحتكم',
    category: 'clinic',
  },
  {
    id: '5',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1629909615957-be38d6c1efc6?w=800',
    title: 'فينير الأسنان',
    description: 'ابتسامة هوليوود مع الفينير',
    category: 'treatments',
  },
  {
    id: '6',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1445527815219-ecbfec67492e?w=800',
    title: 'عرض خاص',
    description: 'خصم 30% على تنظيف الأسنان',
    category: 'offers',
  },
  {
    id: '7',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1606265752439-1f18756aa5fc?w=800',
    title: 'علاج جذور الأسنان',
    description: 'علاج آمن وغير مؤلم',
    category: 'treatments',
  },
  {
    id: '8',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=800',
    title: 'غرفة العمليات',
    description: 'تجهيزات طبية متقدمة',
    category: 'clinic',
  },
];

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
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [showModal, setShowModal] = useState(false);

  const filteredMedia = selectedCategory === 'all' 
    ? galleryData 
    : galleryData.filter(item => item.category === selectedCategory);

  const onRefresh = async () => {
    setRefreshing(true);
    // In production, fetch new data here
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const openMedia = (item: MediaItem) => {
    if (item.type === 'video') {
      Linking.openURL(item.url);
    } else {
      setSelectedMedia(item);
      setShowModal(true);
    }
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
    videoOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: imageWidth,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.3)',
    },
    playButton: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: colors.white,
      justifyContent: 'center',
      alignItems: 'center',
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
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {isRTL ? 'معرض الصور والفيديوهات' : 'Media Gallery'}
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
        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {galleryData.filter(i => i.category === 'treatments').length}
            </Text>
            <Text style={styles.statLabel}>{isRTL ? 'علاجات' : 'Treatments'}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {galleryData.filter(i => i.type === 'video').length}
            </Text>
            <Text style={styles.statLabel}>{isRTL ? 'فيديوهات' : 'Videos'}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {galleryData.filter(i => i.category === 'offers').length}
            </Text>
            <Text style={styles.statLabel}>{isRTL ? 'عروض' : 'Offers'}</Text>
          </View>
        </View>

        {filteredMedia.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="images-outline" size={60} color={colors.textLight} />
            <Text style={styles.emptyText}>
              {isRTL ? 'لا توجد صور في هذا القسم' : 'No images in this category'}
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
                  source={{ uri: item.type === 'video' ? item.thumbnail : item.url }}
                  style={styles.mediaImage}
                  resizeMode="cover"
                />
                {item.type === 'video' && (
                  <View style={styles.videoOverlay}>
                    <View style={styles.playButton}>
                      <Ionicons name="play" size={24} color={colors.primary} />
                    </View>
                  </View>
                )}
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
