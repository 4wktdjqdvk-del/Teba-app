import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface WhatsAppButtonProps {
  phoneNumber?: string;
  message?: string;
}

export default function WhatsAppButton({ 
  phoneNumber = '66868388',
  message = 'مرحباً، أريد الاستفسار عن خدمات العيادة'
}: WhatsAppButtonProps) {
  
  const openWhatsApp = () => {
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/974${phoneNumber}?text=${encodedMessage}`;
    
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        // Fallback for web
        if (typeof window !== 'undefined') {
          window.open(url, '_blank');
        }
      }
    }).catch((error) => {
      console.error('Error opening WhatsApp:', error);
    });
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={openWhatsApp}
      activeOpacity={0.8}
    >
      <Ionicons name="logo-whatsapp" size={28} color="#FFFFFF" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#25D366',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 12px rgba(37, 211, 102, 0.4)',
        cursor: 'pointer',
      },
      default: {
        shadowColor: '#25D366',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
      },
    }),
  },
});
