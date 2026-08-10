import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Modal,
  PermissionsAndroid,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Share from 'react-native-share';
import { WebView } from 'react-native-webview';
import { launchCamera } from 'react-native-image-picker';
import { pick, types, isErrorWithCode, errorCodes } from '@react-native-documents/picker';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import CompanyLogo from '../../components/common/CompanyLogo';
import MainAsyncButton from '../../components/ui/MainAsyncButton';
import Input from '../../components/ui/Input';
import FeedbackModal from '../../components/ui/FeedbackModal';
import {
  useCreateSubmissionMutation,
  useUpdateSubmissionMutation,
  useGetPresignedSubmissionAttachmentUrlMutation,
} from '../../services/api';
import { COLORS } from '../../constants/colors';

export default function SubmissionFormScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const company = route.params?.company;
  const submissionType = route.params?.submissionType;
  const editingSubmission = route.params?.editingSubmission;

  const isEditing = Boolean(editingSubmission);

  // Modal Feedback state
  const [modalState, setModalState] = useState({
    visible: false,
    type: 'success',
    title: '',
    message: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    onConfirmCallback: null,
    onCloseCallback: null,
  });

  const showFeedback = ({ type = 'error', title, message, onClose }) => {
    setModalState({
      visible: true,
      type,
      title,
      message,
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
      onConfirmCallback: null,
      onCloseCallback: onClose || null,
    });
  };

  const handleCloseModal = () => {
    const cb = modalState.onCloseCallback;
    setModalState((prev) => ({
      ...prev,
      visible: false,
      onCloseCallback: null,
      onConfirmCallback: null,
    }));
    if (cb) cb();
  };

  // Header Title customization logic
  useEffect(() => {
    const rawTitle = submissionType?.title || editingSubmission?.type_title || '';
    const isOutros =
      !rawTitle ||
      rawTitle === 'Outros envios' ||
      rawTitle === 'Enviar outra coisa' ||
      rawTitle === 'Diversos' ||
      submissionType?.ref === 'default';

    let headerTitle = isOutros ? 'Novo Envio' : rawTitle;
    if (isEditing) {
      headerTitle = isOutros ? 'Editar Envio' : rawTitle;
    }

    navigation.setOptions({
      title: headerTitle,
    });
  }, [navigation, submissionType, editingSubmission, isEditing]);

  const [fieldData, setFieldData] = useState(() => {
    if (editingSubmission?.field_data) {
      const mapped = {};
      Object.entries(editingSubmission.field_data).forEach(([k, v]) => {
        const lower = k.toLowerCase();
        if (lower === 'description' || lower.includes('descrição')) {
          mapped['informacoes'] = v;
        } else {
          mapped[k] = v;
        }
      });
      return mapped;
    }
    const initial = {};
    (submissionType?.fields || []).forEach((f) => {
      const key = f.id || f.label;
      initial[key] = '';
    });
    return initial;
  });

  const [attachments, setAttachments] = useState(() => {
    return editingSubmission?.attachments ? [...editingSubmission.attachments] : [];
  });

  const [isUploading, setIsUploading] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState(null);

  const [createSubmission, { isLoading: isCreating }] = useCreateSubmissionMutation();
  const [updateSubmission, { isLoading: isUpdating }] = useUpdateSubmissionMutation();
  const [getPresignedUrl] = useGetPresignedSubmissionAttachmentUrlMutation();

  const handleFieldChange = (key, value) => {
    setFieldData((prev) => ({ ...prev, [key]: value }));
  };

  const validateRegex = (val, regexStr) => {
    if (!regexStr || !val) return true;
    try {
      const re = new RegExp(regexStr);
      return re.test(String(val).trim());
    } catch (e) {
      return true;
    }
  };

  const isValid = useMemo(() => {
    const fields = submissionType?.fields || [];
    let hasAnyValue = false;
    let hasRequiredFields = false;

    for (const f of fields) {
      if (f.required) hasRequiredFields = true;

      const key = f.id || f.label;
      const val = fieldData[key];
      const strVal = val ? String(val).trim() : '';

      if (strVal) hasAnyValue = true;

      if (f.required && !strVal) {
        return false;
      }

      if (strVal && f.regex && !validateRegex(strVal, f.regex)) {
        return false;
      }
    }

    if (submissionType?.attachment_required && attachments.length === 0) {
      return false;
    }

    // Default option or no required fields logic
    if (!hasRequiredFields && !submissionType?.attachment_required) {
      if (!hasAnyValue && attachments.length === 0) {
        return false;
      }
    }

    return true;
  }, [submissionType, fieldData, attachments]);

  const addLocalAttachment = (uri, mimeType, fileName, isCamera = false) => {
    const fileType = mimeType.startsWith('application/pdf') ? 'pdf' : 'image';
    const newAtt = {
      uri,
      type: fileType,
      mimeType,
      name: fileName || (isCamera ? 'Foto' : (fileType === 'pdf' ? 'Documento.pdf' : 'Anexo')),
      isCamera,
      isLocal: true,
      url: uri, // Temporary URL for UI preview
    };

    if (submissionType?.multiple_attachments) {
      setAttachments((prev) => [...prev, newAtt]);
    } else {
      setAttachments([newAtt]);
    }
  };

  const handleTakePhoto = async () => {
    try {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        showFeedback({
          type: 'warning',
          title: 'Permissão de Câmera',
          message: 'Permissão de câmera negada. Habilite nas configurações para tirar fotos.',
        });
        return;
      }

      const options = {
        mediaType: 'photo',
        quality: 0.8,
        saveToPhotos: false,
      };

      const result = await launchCamera(options);
      if (result.didCancel || !result.assets || result.assets.length === 0) return;

      const asset = result.assets[0];
      // Quantas fotos tiradas na câmera já foram anexadas
      const cameraPhotoCount =
        attachments.filter((a) => a.isCamera || a.name?.startsWith('Foto ')).length + 1;
      const photoName = `Foto ${cameraPhotoCount}`;

      addLocalAttachment(asset.uri, asset.type || 'image/jpeg', photoName, true);
    } catch (err) {
      showFeedback({
        type: 'error',
        title: 'Erro na Câmera',
        message: err.message || 'Falha ao acessar a câmera.',
      });
    }
  };

  const handlePickAttachment = async () => {
    try {
      const allowedTypes = [];
      const acceptsImage =
        !submissionType?.allowed_formats?.length || submissionType?.allowed_formats?.includes('image');
      const acceptsPdf =
        !submissionType?.allowed_formats?.length || submissionType?.allowed_formats?.includes('pdf');

      if (acceptsImage) allowedTypes.push(types.images);
      if (acceptsPdf) allowedTypes.push(types.pdf);

      const results = await pick({
        type: allowedTypes.length > 0 ? allowedTypes : [types.allFiles],
        allowMultiSelection: submissionType?.multiple_attachments || false,
        copyTo: 'cachesDirectory',
      });

      for (const res of results) {
        const localUri = res.fileCopyUri || res.uri;
        // Preserva o nome real do arquivo selecionado da galeria ou gerenciador de arquivos
        const fileName = res.name || 'Anexo';
        addLocalAttachment(localUri, res.type || 'application/octet-stream', fileName, false);
      }
    } catch (err) {
      if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) {
        return;
      }
      showFeedback({
        type: 'error',
        title: 'Erro ao Selecionar Arquivo',
        message: err.message || 'Falha ao selecionar documento.',
      });
    }
  };

  const handleRemoveAttachment = (index) => {
    if (isEditing) {
      setModalState({
        visible: true,
        type: 'confirm',
        title: 'Excluir anexo',
        message: 'Tem certeza de que deseja remover este anexo do envio?',
        confirmText: 'Excluir',
        cancelText: 'Cancelar',
        onConfirmCallback: () => {
          setAttachments((prev) => prev.filter((_, idx) => idx !== index));
        },
        onCloseCallback: null,
      });
    } else {
      setAttachments((prev) => prev.filter((_, idx) => idx !== index));
    }
  };

  const handleSubmit = async () => {
    if (!isValid) return;

    setIsUploading(true);
    try {
      const finalAttachments = [];

      // 1. Upload local attachments to R2
      for (const att of attachments) {
        if (att.isLocal) {
          const presignRes = await getPresignedUrl(att.mimeType).unwrap();
          const { upload_url, public_url } = presignRes;

          await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('PUT', upload_url);
            xhr.setRequestHeader('Content-Type', att.mimeType);
            xhr.onload = () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                resolve();
              } else {
                reject(new Error('Falha no upload para a nuvem. Status: ' + xhr.status));
              }
            };
            xhr.onerror = () => {
              reject(new Error('Falha de rede no upload. Verifique sua conexão.'));
            };
            xhr.send({ uri: att.uri, type: att.mimeType, name: att.name });
          });

          finalAttachments.push({
            url: public_url,
            type: att.type,
            name: att.name,
          });
        } else {
          // Already uploaded (e.g. from an edit)
          finalAttachments.push(att);
        }
      }

      const payloadCompanyId = company?.id || editingSubmission?.company_id;
      const payloadSubTypeId = submissionType?.id || null;

      if (!payloadCompanyId) {
        showFeedback({
          type: 'error',
          title: 'Erro de Empresa',
          message: 'ID da empresa não informado.',
        });
        setIsUploading(false);
        return;
      }

      const defaultTitle = submissionType?.title || 'Diversos';

      // 2. Submit form
      if (isEditing) {
        await updateSubmission({
          id: editingSubmission.id,
          field_data: fieldData,
          attachments: finalAttachments,
        }).unwrap();

        showFeedback({
          type: 'success',
          title: 'Envio Atualizado!',
          message: 'As alterações do seu envio foram salvas com sucesso.',
          onClose: () => navigation.navigate('SubmissionsList'),
        });
      } else {
        await createSubmission({
          company_id: payloadCompanyId,
          submission_type_id: payloadSubTypeId,
          type_title: defaultTitle,
          field_data: fieldData,
          attachments: finalAttachments,
        }).unwrap();

        showFeedback({
          type: 'success',
          title: 'Envio Realizado!',
          message: 'Seu envio foi entregue com sucesso para a empresa.',
          onClose: () => navigation.navigate('SubmissionsList'),
        });
      }
    } catch (err) {
      console.log('SUBMISSION ERROR:', err);
      showFeedback({
        type: 'error',
        title: 'Erro ao Enviar',
        message: err?.data?.detail?.message || err?.message || 'Ocorreu um erro ao processar seu envio.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpenAttachment = async (att) => {
    const url = att.url || att.uri;
    if (!url) return;

    const isPdf = att.type === 'pdf' || url.toLowerCase().includes('.pdf');

    if (isPdf) {
      try {
        if (url.startsWith('file://') || url.startsWith('content://')) {
          await Share.open({
            url: url,
            type: att.mimeType || 'application/pdf',
            failOnCancel: false,
          });
        } else {
          await Linking.openURL(url);
        }
      } catch (err) {
        try {
          await Linking.openURL(url);
        } catch (e) {
          console.log('Error opening PDF:', e);
        }
      }
    } else {
      setPreviewAttachment({ url, type: att.type, name: att.name });
    }
  };

  const acceptsImage =
    submissionType?.accepts_attachment &&
    (!submissionType?.allowed_formats?.length || submissionType?.allowed_formats?.includes('image'));

  const allowedFormatsText = submissionType?.allowed_formats?.length
    ? submissionType.allowed_formats.map((f) => f.toUpperCase()).join(' e ')
    : 'Imagem ou PDF';

  const companyName = company?.name || editingSubmission?.company_name;
  const companyBranch = company?.branch_name || editingSubmission?.company_branch_name;

  return (
    <ScreenWrapper noPadding={true} edges={['left', 'right', 'bottom']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Company Details - No divider underneath */}
        <View style={styles.companyHeader}>
          <CompanyLogo
            logoUrl={company?.logo_url || editingSubmission?.company_logo_url}
            name={companyName}
            companyId={company?.id || editingSubmission?.company_id}
            size={40}
            style={{ marginRight: 14 }}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.companyPretitle}>
              {isEditing ? 'Editando envio para' : 'Enviando para'}
            </Text>
            <Text style={styles.companyName}>{companyName}</Text>
            {companyBranch ? <Text style={styles.companyBranch}>{companyBranch}</Text> : null}
          </View>
        </View>

        {/* Attachments Section - Clean rows without background box & border */}
        {submissionType?.accepts_attachment && (
          <View style={styles.flatSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Anexos ({attachments.length}) {submissionType?.attachment_required ? '*' : '(Opcional)'}
              </Text>
            </View>
            <Text style={styles.attachmentConstraint}>
              Formatos aceitos: {allowedFormatsText}.{' '}
              {submissionType?.multiple_attachments ? 'Múltiplos permitidos.' : 'Apenas 1 arquivo.'}
            </Text>

            {attachments.length > 0 && (
              <View style={styles.attachmentsList}>
                {(() => {
                  let photoCounter = 0;
                  return attachments.map((att, idx) => {
                    const isPdf = att.type === 'pdf' || att.url?.toLowerCase().includes('.pdf');
                    const isTempName = att.name && (att.name.includes('rn_image_picker') || att.name.includes('image_picker'));

                    const attName = isTempName
                      ? `Foto ${idx + 1}`
                      : (att.name || (isPdf ? `Documento ${idx + 1}` : `Anexo ${idx + 1}`));

                    const attUrl = att.url || att.uri;

                    return (
                      <View key={idx} style={styles.attItem}>
                        <TouchableOpacity
                          style={styles.attContentTouch}
                          onPress={() => handleOpenAttachment({ ...att, name: attName })}
                          activeOpacity={0.7}
                        >
                          {isPdf ? (
                            <View style={styles.pdfThumbnail}>
                              <Icon name="file-pdf-box" size={24} color="#DC2626" />
                            </View>
                          ) : (
                            <Image source={{ uri: attUrl }} style={styles.imgThumbnail} />
                          )}
                          <View style={styles.attInfo}>
                            <Text style={styles.attName} numberOfLines={1}>
                              {attName}
                            </Text>
                            <Text style={styles.attType}>
                              Clique para visualizar
                            </Text>
                          </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => handleRemoveAttachment(idx)}
                          style={styles.removeBtn}
                        >
                          <Icon name="close" size={20} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    );
                  });
                })()}
              </View>
            )}

            {(!attachments.length || submissionType?.multiple_attachments) && (
              <View style={styles.actionButtonsRow}>
                {acceptsImage && (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.actionBtnCamera]}
                    onPress={handleTakePhoto}
                    disabled={isUploading}
                  >
                    <Icon name="camera-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.actionBtnCameraText}>Tirar Foto</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.actionBtn, styles.actionBtnGallery]}
                  onPress={handlePickAttachment}
                  disabled={isUploading}
                >
                  <Icon name="file-document-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.actionBtnGalleryText}>Anexar Arquivo</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Form Fields Section */}
        <View style={styles.flatSectionNoBorder}>
          <Text style={styles.sectionTitle}>Detalhes do Envio</Text>

          {(submissionType?.fields || []).length === 0 ? (
            <Text style={styles.emptyFieldsText}>
              Nenhum detalhe em texto exigido para este envio.
            </Text>
          ) : (
            (submissionType?.fields || []).map((field, idx) => {
              const key = field.id || field.label;
              const val = fieldData[key] !== undefined ? fieldData[key] : (fieldData['informacoes'] || fieldData['Informações'] || '');
              const rawLabel = field.label || '';
              const displayLabel =
                rawLabel.toLowerCase().includes('descrição') || field.id === 'description' || field.id === 'informacoes'
                  ? 'Informações'
                  : rawLabel;
              const isNumeric = field.type === 'number';
              const isMultiline = Boolean(field.multiline);
              const hasRegexError = Boolean(val && field.regex && !validateRegex(val, field.regex));

              return (
                <View key={key || idx} style={styles.inputGroup}>
                  <Input
                    label={`${displayLabel}${field.required ? ' *' : ''}`}
                    description={field.description}
                    value={val}
                    onChangeText={(text) => handleFieldChange(key, text)}
                    placeholder={field.placeholder || `Digite ${displayLabel.toLowerCase()}...`}
                    keyboardType={isNumeric ? 'numeric' : 'default'}
                    multiline={isMultiline}
                    numberOfLines={isMultiline ? 3 : 1}
                    error={hasRegexError ? 'Formato inválido para este campo.' : ''}
                  />
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Footer Submit Button */}
      <View style={styles.footer}>
        <MainAsyncButton
          title={isEditing ? 'Salvar Alterações' : 'Confirmar e Enviar'}
          onPress={handleSubmit}
          disabled={!isValid || isUploading || isCreating || isUpdating}
          loading={isUploading || isCreating || isUpdating}
        />
      </View>

      {/* Feedback Bottom Modal for Success / Error / Confirm */}
      <FeedbackModal
        visible={modalState.visible}
        onClose={handleCloseModal}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        confirmText={modalState.confirmText || 'Confirmar'}
        cancelText={modalState.cancelText || 'Cancelar'}
        onConfirm={modalState.onConfirmCallback}
      />

      {/* Fullscreen Attachment Preview Modal (Image or PDF) */}
      <Modal visible={Boolean(previewAttachment)} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle} numberOfLines={1}>
              {previewAttachment?.name || 'Visualização do Anexo'}
            </Text>
            <TouchableOpacity style={styles.modalClose} onPress={() => setPreviewAttachment(null)}>
              <Icon name="close" size={26} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {previewAttachment?.type === 'pdf' || previewAttachment?.url?.toLowerCase().includes('.pdf') ? (
            <View style={styles.pdfCardModalContainer}>
              <View style={styles.pdfCardContent}>
                <View style={styles.pdfCardIconBadge}>
                  <Icon name="file-pdf-box" size={56} color="#DC2626" />
                </View>
                <Text style={styles.pdfCardTitle} numberOfLines={2}>
                  {previewAttachment?.name || 'Documento PDF'}
                </Text>
                <Text style={styles.pdfCardSubtitle}>
                  Clique no botão abaixo para abrir e visualizar o arquivo PDF no leitor do seu dispositivo.
                </Text>

                <TouchableOpacity
                  style={styles.pdfCardOpenBtn}
                  onPress={() => {
                    if (previewAttachment?.url) {
                      Linking.openURL(previewAttachment.url);
                    }
                  }}
                  activeOpacity={0.85}
                >
                  <Icon name="open-in-new" size={20} color="#FFFFFF" />
                  <Text style={styles.pdfCardOpenBtnText}>Abrir Documento PDF</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <Image
              source={{ uri: previewAttachment?.url }}
              style={styles.modalImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  companyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  companyPretitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 2,
  },
  companyName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  companyBranch: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  flatSection: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  flatSectionNoBorder: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  attachmentConstraint: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12,
  },
  emptyFieldsText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
  },
  inputGroup: {
    marginBottom: 12,
  },
  attachmentsList: {
    gap: 8,
    marginBottom: 16,
  },
  attItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  attContentTouch: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  imgThumbnail: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  pdfThumbnail: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  attInfo: {
    flex: 1,
  },
  attName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  attType: {
    fontSize: 12,
    color: '#64748B',
  },
  removeBtn: {
    padding: 8,
    backgroundColor: 'transparent',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  actionBtnCamera: {
    backgroundColor: COLORS.primary,
  },
  actionBtnCameraText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  actionBtnGallery: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  actionBtnGalleryText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 14,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 10,
  },
  modalClose: {
    padding: 6,
  },
  modalImage: {
    width: '90%',
    height: '80%',
  },
  pdfCardModalContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  pdfCardContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    alignItems: 'center',
  },
  pdfCardIconBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  pdfCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  pdfCardSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  pdfCardOpenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignSelf: 'stretch',
    gap: 8,
  },
  pdfCardOpenBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
