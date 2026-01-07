import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Platform,
  PermissionsAndroid
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import * as DocumentPicker from '@react-native-documents/picker';
import Icon from 'react-native-vector-icons/Ionicons';

import { COLORS } from '../../constants/colors';
import { 
  uploadDocumentAsync, 
  selectUploadStatus, 
  selectDocumentError,
  selectCurrentDocument,
  resetDocumentState,
  selectUploadProgress
} from '../../store/slices/documentSlice';

const LicenseScreen = ({ route }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [selectedDocument, setSelectedDocument] = useState(null);

  const uploadStatus = useSelector(selectUploadStatus);
  const uploadError = useSelector(selectDocumentError);
  const currentDocument = useSelector(selectCurrentDocument);
  const uploadProgress = useSelector(selectUploadProgress);

  const uploading = uploadStatus === 'loading';

  // Limpa estado ao montar a tela
  useEffect(() => {
    dispatch(resetDocumentState());
  }, [dispatch]);

  // Observa resultado do upload
  useEffect(() => {
    if (uploadStatus === 'succeeded' && currentDocument) {
      Alert.alert(
        'Sucesso!',
        'Documento enviado com sucesso',
        [{ text: 'Continuar', onPress: handleProceed }]
      );
    }

    if (uploadStatus === 'failed' && uploadError) {
      Alert.alert(
        'Erro no Upload',
        uploadError,
        [{ text: 'Tentar Novamente', onPress: () => dispatch(resetDocumentState()) }]
      );
    }
  }, [uploadStatus, currentDocument, uploadError]);

  // Selecionar documento do dispositivo
  const handleSelectDocument = async () => {
  try {
    const result = await DocumentPicker.pick({
      type: [DocumentPicker.types.pdf, DocumentPicker.types.images],
      copyTo: 'cachesDirectory',
    });

    const document = result[0];

    if (document.size > 10 * 1024 * 1024) {
      Alert.alert('Erro', 'O arquivo deve ter no máximo 10MB');
      return;
    }

    setSelectedDocument(document);

    dispatch(uploadDocumentAsync({
      uri: document.uri,
      fileName: document.name,
      type: document.type || 'application/pdf',
    }));

  } catch (error) {
    if (error?.code === 'DOCUMENT_PICKER_CANCELED') {
      console.log('Seleção cancelada');
      return;
    }

    console.error('Erro ao selecionar documento:', error);
    Alert.alert('Erro', 'Não foi possível selecionar o documento');
  }
};

  // Permissão de câmera (Android)
  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Permissão de Câmera',
            message: 'Precisamos de acesso à câmera para tirar foto do documento',
            buttonNeutral: 'Perguntar Depois',
            buttonNegative: 'Cancelar',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  useEffect(() => {
  if (route?.params?.documentPhoto) {
    const photo = route.params.documentPhoto;

    const doc = {
      uri: photo.uri,
      name: photo.fileName || 'documento.jpg',
      type: photo.type || 'image/jpeg',
    };

    setSelectedDocument(doc);

    dispatch(uploadDocumentAsync({
      uri: doc.uri,
      fileName: doc.name,
      type: doc.type,
    }));
  }
}, [route?.params?.documentPhoto]);

  // Tirar foto do documento
  const handleTakePhoto = async () => {
    try {
      const hasPermission = await requestCameraPermission();

      if (!hasPermission) {
        Alert.alert(
          'Permissão Necessária',
          'Precisamos de acesso à câmera para tirar foto do documento'
        );
        return;
      }

      navigation.navigate('DocumentCamera');

    } catch (error) {
      console.error('Erro ao abrir câmera:', error);
      Alert.alert('Erro', 'Não foi possível abrir a câmera');
    }
  };

  const handleProceed = () => {
    if (uploadStatus !== 'succeeded') {
      Alert.alert(
        'Documento Necessário',
        'Por favor, anexe ou tire foto do seu documento antes de avançar'
      );
      return;
    }
    navigation.navigate('FacialRecognition');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Icon name="document-text-outline" size={80} color={COLORS.primary} />

        <Text style={styles.title}>Documento de Identificação</Text>
        <Text style={styles.subtitle}>
          Envie seu documento (CNH, RG ou CPF)
        </Text>

        <View style={styles.infoBox}>
          <Icon name="information-circle-outline" size={20} color={COLORS.primary} />
          <Text style={styles.infoText}>
            Formatos aceitos: PDF, PNG, JPG (máx. 10MB)
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.optionButton, styles.primaryButton]}
          onPress={handleSelectDocument}
          disabled={uploading}
        >
          <Icon name="folder-open-outline" size={24} color="#fff" />
          <Text style={styles.primaryButtonText}>Anexar Documento</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.optionButton, styles.secondaryButton]}
          onPress={handleTakePhoto}
          disabled={uploading}
        >
          <Icon name="camera-outline" size={24} color={COLORS.primary} />
          <Text style={styles.secondaryButtonText}>Tirar Foto</Text>
        </TouchableOpacity>

        {uploading && (
          <View style={styles.uploadingBox}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.uploadingText}>
              Enviando documento... {uploadProgress}%
            </Text>
          </View>
        )}

        {uploadStatus === 'succeeded' && selectedDocument && (
          <View style={styles.successBox}>
            <Icon name="checkmark-circle" size={24} color="#4CAF50" />
            <Text style={styles.successText}>
              {selectedDocument.name} anexado
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.proceedButton,
          (uploadStatus !== 'succeeded' || uploading) && styles.proceedButtonDisabled,
        ]}
        onPress={handleProceed}
        disabled={uploading || uploadStatus !== 'succeeded'}
      >
        <Text style={styles.proceedButtonText}>Avançar</Text>
        <Icon name="arrow-forward" size={20} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
    lineHeight: 22,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 30,
    width: '100%',
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '500',
  },
  optionButton: {
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginBottom: 15,
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  primaryButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    marginLeft: 10,
    flex: 1,
    textAlign: 'left',
  },
  secondaryButtonText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: 10,
    flex: 1,
    textAlign: 'left',
  },
  buttonSubtext: {
    fontSize: 12,
    color: '#999',
    position: 'absolute',
    bottom: 5,
    right: 15,
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    width: '100%',
  },
  successText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '500',
    flex: 1,
  },
  uploadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    width: '100%',
  },
  uploadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#E65100',
    fontWeight: '500',
  },
  proceedButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    flexDirection: 'row',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  proceedButtonDisabled: {
    backgroundColor: '#ccc',
  },
  proceedButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
});

export default LicenseScreen;