import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Share from 'react-native-share';
import { WebView } from 'react-native-webview';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import CompanyLogo from '../../components/common/CompanyLogo';
import FeedbackModal from '../../components/ui/FeedbackModal';
import { useCancelSubmissionMutation, useFetchCompanySubmissionTypesQuery } from '../../services/api';
import { COLORS } from '../../constants/colors';

const formatDateLabel = (dateString) => {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} às ${hours}:${minutes}`;
  } catch (e) {
    return dateString;
  }
};

export default function SubmissionDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const submission = route.params?.submission;

  const [previewAttachment, setPreviewAttachment] = useState(null);
  const [cancelSubmission, { isLoading: isCancelling }] = useCancelSubmissionMutation();

  const [modalState, setModalState] = useState({
    visible: false,
    type: 'success',
    title: '',
    message: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    onConfirm: null,
    onCloseCallback: null,
  });

  const showFeedback = ({
    type = 'error',
    title,
    message,
    confirmText,
    cancelText,
    onConfirm,
    onClose,
  }) => {
    setModalState({
      visible: true,
      type,
      title,
      message,
      confirmText: confirmText || 'Confirmar',
      cancelText: cancelText || 'Cancelar',
      onConfirm: onConfirm || null,
      onCloseCallback: onClose || null,
    });
  };

  const handleCloseModal = () => {
    const cb = modalState.onCloseCallback;
    setModalState((prev) => ({ ...prev, visible: false, onCloseCallback: null }));
    if (cb) cb();
  };

  // Header Title customization logic
  useEffect(() => {
    const rawTitle = submission?.type_title || '';
    const isOutros =
      !rawTitle ||
      rawTitle === 'Outros envios' ||
      rawTitle === 'Enviar outra coisa' ||
      rawTitle === 'Diversos';

    const headerTitle = isOutros ? 'Detalhes do Envio' : rawTitle;

    navigation.setOptions({
      title: headerTitle,
    });
  }, [navigation, submission]);

  // Fetch type config to check if allow_edit is enabled
  const { data: typesResponse } = useFetchCompanySubmissionTypesQuery(
    submission?.company_id,
    { skip: !submission?.company_id }
  );

  const submissionTypes = typesResponse?.data || [];
  const currentType = submissionTypes.find((t) => t.id === submission?.submission_type_id);
  const allowEdit = currentType ? currentType.allow_edit : true;

  const handleEdit = () => {
    navigation.navigate('SubmissionForm', {
      company: {
        id: submission.company_id,
        name: submission.company_name,
        branch_name: submission.company_branch_name,
        logo_url: submission.company_logo_url,
      },
      submissionType: currentType || {
        id: submission.submission_type_id,
        title: submission.type_title,
        accepts_attachment: true,
        multiple_attachments: true,
        allowed_formats: ['image', 'pdf'],
        fields: Object.keys(submission.field_data || {}).map((k) => ({
          id: k,
          label: k,
          type: 'text',
        })),
      },
      editingSubmission: submission,
    });
  };

  const handleConfirmCancel = () => {
    showFeedback({
      type: 'confirm',
      title: 'Cancelar Envio',
      message: 'Tem certeza que deseja cancelar este envio? O envio e seus anexos serão excluídos permanentemente.',
      confirmText: 'Sim, Cancelar',
      cancelText: 'Voltar',
      onConfirm: async () => {
        try {
          await cancelSubmission(submission.id).unwrap();
          showFeedback({
            type: 'success',
            title: 'Envio Cancelado',
            message: 'O envio foi cancelado com sucesso.',
            onClose: () => navigation.navigate('SubmissionsList'),
          });
        } catch (err) {
          showFeedback({
            type: 'error',
            title: 'Erro ao Cancelar',
            message: err?.data?.detail?.message || 'Falha ao cancelar envio.',
          });
        }
      },
    });
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

  const fieldEntries = Object.entries(submission?.field_data || {});
  const attachments = submission?.attachments || [];
  const isEdited = submission?.status === 'EDITED';

  return (
    <ScreenWrapper noPadding={true} edges={['left', 'right', 'bottom']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Header Company Details - Status badge placed cleanly in its own wrapper below company name */}
        <View style={styles.companyHeader}>
          <CompanyLogo
            logoUrl={submission?.company_logo_url}
            name={submission?.company_name}
            companyId={submission?.company_id}
            size={40}
            style={{ marginRight: 14 }}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.companyName}>{submission?.company_name}</Text>
            {submission?.company_branch_name ? (
              <Text style={styles.companyBranch}>{submission?.company_branch_name}</Text>
            ) : null}
            <View style={styles.statusBadgeWrapper}>
              {isEdited ? (
                <View style={[styles.statusBadge, styles.statusBadgeEdited]}>
                  <Icon name="pencil-outline" size={12} color="#2563EB" />
                  <Text style={[styles.statusBadgeText, styles.statusBadgeTextEdited]}>Editado</Text>
                </View>
              ) : (
                <View style={[styles.statusBadge, styles.statusBadgeSent]}>
                  <Icon name="check" size={12} color="#059669" />
                  <Text style={[styles.statusBadgeText, styles.statusBadgeTextSent]}>Enviado</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Date Row Section */}
        <View style={styles.flatSectionNoDivider}>
          <View style={styles.datesRow}>
            <Text style={styles.dateText}>Enviado em {formatDateLabel(submission?.created_at)}</Text>
            {submission?.edited_at && (
              <Text style={styles.dateTextEdited}>
                Editado em {formatDateLabel(submission?.edited_at)}
              </Text>
            )}
          </View>
        </View>

        {/* Attachments Section - Clean rows without box background/border */}
        {attachments.length > 0 && (
          <View style={styles.flatSectionNoDivider}>
            <Text style={styles.sectionTitle}>Anexos ({attachments.length})</Text>
            <View style={styles.attList}>
              {(() => {
                let photoCounter = 0;
                return attachments.map((att, idx) => {
                  const isPdf = att.type === 'pdf' || att.url?.toLowerCase().includes('.pdf');
                  const isTempName = att.name && (att.name.includes('rn_image_picker') || att.name.includes('image_picker'));

                  const attName = isTempName
                    ? `Foto ${idx + 1}`
                    : (att.name || (isPdf ? `Documento ${idx + 1}` : `Anexo ${idx + 1}`));

                  return (
                    <TouchableOpacity
                      key={idx}
                      style={styles.attRow}
                      onPress={() => handleOpenAttachment({ ...att, name: attName })}
                      activeOpacity={0.7}
                    >
                      {isPdf ? (
                        <View style={styles.pdfIconWrap}>
                          <Icon name="file-pdf-box" size={24} color="#DC2626" />
                        </View>
                      ) : (
                        <Image source={{ uri: att.url || att.uri }} style={styles.attImg} />
                      )}

                      <View style={{ flex: 1 }}>
                        <Text style={styles.attName} numberOfLines={1}>
                          {attName}
                        </Text>
                        <Text style={styles.attMeta}>
                          Clique para visualizar
                        </Text>
                      </View>

                      <Icon name={isPdf ? "open-in-new" : "eye-outline"} size={20} color={COLORS.primary} />
                    </TouchableOpacity>
                  );
                });
              })()}
            </View>
          </View>
        )}

        {/* Filled Fields Section */}
        <View style={styles.flatSectionNoDivider}>
          <Text style={styles.sectionTitle}>Detalhes do Envio</Text>
          {fieldEntries.length === 0 ? (
            <Text style={styles.emptyText}>Nenhum detalhe em texto preenchido.</Text>
          ) : (
            <View style={styles.fieldsGrid}>
              {fieldEntries.map(([key, val]) => {
                const lowerKey = String(key).toLowerCase();
                const displayLabel =
                  lowerKey === 'description' || lowerKey.includes('descrição') || lowerKey === 'informacoes' || lowerKey === 'informações'
                    ? 'Informações'
                    : key;

                return (
                  <View key={key} style={styles.fieldItem}>
                    <Text style={styles.fieldLabel}>{displayLabel}</Text>
                    <Text style={styles.fieldValue}>{String(val)}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Footer Action Buttons - Side by Side (Cancelar na esquerda, Editar na direita) */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={handleConfirmCancel}
          disabled={isCancelling}
        >
          <Icon name="trash-can-outline" size={18} color="#FFFFFF" />
          <Text style={styles.cancelBtnText}>
            {isCancelling ? 'Cancelando...' : 'Cancelar Envio'}
          </Text>
        </TouchableOpacity>

        {allowEdit && (
          <TouchableOpacity
            style={styles.editBtn}
            onPress={handleEdit}
            disabled={isCancelling}
          >
            <Icon name="pencil" size={18} color="#FFFFFF" />
            <Text style={styles.editBtnText}>Editar Envio</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Feedback Modal for Confirmation / Success / Error */}
      <FeedbackModal
        visible={modalState.visible}
        onClose={handleCloseModal}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        onConfirm={modalState.onConfirm}
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
    paddingBottom: 6,
    backgroundColor: '#FFFFFF',
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
  statusBadgeWrapper: {
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusBadgeSent: {
    backgroundColor: '#ECFDF5',
  },
  statusBadgeEdited: {
    backgroundColor: '#EFF6FF',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusBadgeTextSent: {
    color: '#059669',
  },
  statusBadgeTextEdited: {
    color: '#2563EB',
  },
  flatSectionNoDivider: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  datesRow: {
    gap: 4,
  },
  dateText: {
    fontSize: 13,
    color: '#64748B',
  },
  dateTextEdited: {
    fontSize: 12,
    color: '#2563EB',
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    fontStyle: 'italic',
  },
  fieldsGrid: {
    gap: 14,
  },
  fieldItem: {
    paddingVertical: 4,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  attList: {
    gap: 8,
  },
  attRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 14,
  },
  attImg: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  pdfIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  attName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  attMeta: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 12,
  },
  editBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(30, 64, 175, 0.85)',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  editBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cancelBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
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
