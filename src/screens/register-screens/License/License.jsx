import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
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

import { COLORS } from '../../../constants/colors';
import { useUploadDocumentAsyncMutation } from '../../../services/api';
import {
  selectUploadStatus,
  selectDocumentError,
  selectCurrentDocument,
  resetDocumentState,
  selectUploadProgress
} from '../../../store/slices/documentSlice';
import { styles } from './License.styles';

const License = ({ route }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [selectedDocument, setSelectedDocument] = useState(null);

  const uploadStatus = useSelector(selectUploadStatus);
  const uploadError = useSelector(selectDocumentError);
  const currentDocument = useSelector(selectCurrentDocument);
  const uploadProgress = useSelector(selectUploadProgress);

  const [uploadDocumentAsync] = useUploadDocumentAsyncMutation();

  const uploading = uploadStatus === 'loading';

  useEffect(() => {
    dispatch(resetDocumentState());
  }, [dispatch]);

  const handleProceed = useCallback(() => {
    if (uploadStatus !== 'succeeded') {
      Alert.alert(
        'Documento Necessário',
        'Por favor, anexe ou tire foto do seu documento antes de avançar'
      );
      return;
    }
    navigation.navigate('FacialRecognition');
  }, [uploadStatus, navigation]);

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
  }, [uploadStatus, currentDocument, uploadError, dispatch, handleProceed]);

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
        return;
      }
      console.error('Erro ao selecionar documento:', error);
      Alert.alert('Erro', 'Não foi possível selecionar o documento');
    }
  };

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
  }, [route?.params?.documentPhoto, dispatch, uploadDocumentAsync]);

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

export default License;