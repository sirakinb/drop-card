import React, { useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { generateVCard } from '../utils/qrGenerator';

/**
 * QR code generator component for business cards
 * 
 * @param {Object} props
 * @param {Object} props.card - Business card data
 * @param {number} props.size - QR code size in pixels (default: 200)
 * @param {string} props.backgroundColor - QR code background color (default: '#FFFFFF')
 * @param {string} props.color - QR code foreground color (default: '#000000')
 * @param {string} props.ecl - Error correction level: 'L', 'M', 'Q', 'H' (default: 'M')
 * @param {boolean} props.enableSave - Show save button (default: false)
 * @param {boolean} props.enableShare - Show share button (default: false)
 * @param {function} props.onError - Error callback function
 * @param {function} props.onSaveSuccess - Callback when save is successful
 * @param {function} props.onShareSuccess - Callback when share is successful
 * @param {Object} props.containerStyle - Additional style for container
 */
const QRGenerator = ({
  card,
  size = 200,
  backgroundColor = '#FFFFFF',
  color = '#000000',
  ecl = 'M',
  enableSave = false,
  enableShare = false,
  onError,
  onSaveSuccess,
  onShareSuccess,
  containerStyle = {},
}) => {
  // Reference to the QR code component for saving
  const qrRef = useRef();
  
  // Loading state for save/share operations
  const [loading, setLoading] = React.useState(false);
  
  // Generate vCard data from business card
  const getVCardData = () => {
    try {
      if (!card || !card.name) {
        throw new Error('Invalid card data');
      }
      return generateVCard(card);
    } catch (error) {
      console.error('Error generating vCard data:', error);
      if (onError) {
        onError(error);
      }
      return '';
    }
  };
  
  // Save QR code as image to device
  const saveQRCode = async () => {
    try {
      setLoading(true);
      
      // Request permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Media library permission not granted');
      }
      
      // Get SVG reference and convert to PNG
      if (qrRef.current) {
        const options = { width: size * 2, height: size * 2 };
        
        // Convert QR code to PNG and get URI
        qrRef.current.toDataURL(async (dataURL) => {
          try {
            // Create a temporary file
            const fileUri = FileSystem.documentDirectory + `${card.name.replace(/\s+/g, '_')}_qrcode.png`;
            
            // Write base64 data to file
            await FileSystem.writeAsStringAsync(
              fileUri,
              dataURL,
              { encoding: FileSystem.EncodingType.Base64 }
            );
            
            // Save to media library
            const asset = await MediaLibrary.createAssetAsync(fileUri);
            
            // Create album if needed and add asset
            const album = await MediaLibrary.getAlbumAsync('DropCard');
            if (album === null) {
              await MediaLibrary.createAlbumAsync('DropCard', asset, false);
            } else {
              await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
            }
            
            // Success callback
            if (onSaveSuccess) {
              onSaveSuccess(fileUri);
            }
          } catch (error) {
            console.error('Error saving QR code:', error);
            if (onError) {
              onError(error);
            }
          } finally {
            setLoading(false);
          }
        });
      }
    } catch (error) {
      console.error('Error saving QR code:', error);
      if (onError) {
        onError(error);
      }
      setLoading(false);
    }
  };
  
  // Share QR code
  const shareQRCode = async () => {
    try {
      setLoading(true);
      
      // Check if sharing is available
      if (!(await Sharing.isAvailableAsync())) {
        throw new Error('Sharing is not available on this device');
      }
      
      // Get SVG reference and convert to PNG
      if (qrRef.current) {
        qrRef.current.toDataURL(async (dataURL) => {
          try {
            // Create a temporary file
            const fileUri = FileSystem.cacheDirectory + `${card.name.replace(/\s+/g, '_')}_qrcode.png`;
            
            // Write base64 data to file
            await FileSystem.writeAsStringAsync(
              fileUri,
              dataURL,
              { encoding: FileSystem.EncodingType.Base64 }
            );
            
            // Share the file
            await Sharing.shareAsync(fileUri, {
              mimeType: 'image/png',
              dialogTitle: `${card.name}'s QR Code`,
            });
            
            // Success callback
            if (onShareSuccess) {
              onShareSuccess(fileUri);
            }
          } catch (error) {
            console.error('Error sharing QR code:', error);
            if (onError) {
              onError(error);
            }
          } finally {
            setLoading(false);
          }
        });
      }
    } catch (error) {
      console.error('Error sharing QR code:', error);
      if (onError) {
        onError(error);
      }
      setLoading(false);
    }
  };
  
  // Validate error correction level
  const validateECL = (level) => {
    const validLevels = ['L', 'M', 'Q', 'H'];
    return validLevels.includes(level) ? level : 'M';
  };
  
  // If no card data, return null
  if (!card) {
    return null;
  }
  
  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.qrContainer}>
        <QRCode
          value={getVCardData()}
          size={size}
          backgroundColor={backgroundColor}
          color={color}
          ecl={validateECL(ecl)}
          getRef={(ref) => (qrRef.current = ref)}
        />
      </View>
      
      {(enableSave || enableShare) && (
        <View style={styles.buttonContainer}>
          {enableSave && (
            <TouchableOpacity
              style={styles.button}
              onPress={saveQRCode}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.buttonText}>Save QR Code</Text>
              )}
            </TouchableOpacity>
          )}
          
          {enableShare && (
            <TouchableOpacity
              style={styles.button}
              onPress={shareQRCode}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.buttonText}>Share QR Code</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  qrContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default QRGenerator;
