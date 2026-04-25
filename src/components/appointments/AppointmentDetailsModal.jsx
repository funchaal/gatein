import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Dimensions, Animated, ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { PanGestureHandler, State, GestureHandlerRootView } from 'react-native-gesture-handler';
import QRCode from 'react-native-qrcode-svg';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { 
    selectSelectedAppointment, 
    selectAppointment 
} from '../../store/slices/appointmentsSlice';

const { height } = Dimensions.get('window');
const MODAL_HEIGHT = height * 0.75;
const HANDLE_AREA_HEIGHT = 60; // Área maior para facilitar o arrasto

// Cores do Tema
const COLORS = {
    slate900: '#0F172A',
    slate600: '#475569',
    slate500: '#64748B',
    slate400: '#94A3B8',
    slate100: '#F1F5F9',
    white: '#FFFFFF',
    border: '#E2E8F0',
};

const THEME = {
    slate900: '#0F172A', // Texto Principal / Placa
    slate600: '#475569', // Texto Secundário / Data
    slate400: '#94A3B8', // Labels / Ícones / ID
    slate100: '#F1F5F9', // Fundo de detalhes / Hover
    border:   '#E2E8F0', // Borda sutil
    white:    '#FFFFFF',
};

// Cores para os alertas
const ALERT_COLORS = {
    purple: { bg: '#F3E8FF', border: '#A855F7', text: '#7C3AED' },
    blue: { bg: '#DBEAFE', border: '#3B82F6', text: '#2563EB' },
    green: { bg: '#D1FAE5', border: '#10B981', text: '#059669' },
    yellow: { bg: '#FEF3C7', border: '#F59E0B', text: '#D97706' },
    red: { bg: '#FEE2E2', border: '#EF4444', text: '#DC2626' },
    gray: { bg: '#F3F4F6', border: '#9CA3AF', text: '#6B7280' },
};

// Mapeamento de ícones
const ICON_MAP = {
    'alert-circle': 'alert-circle',
    'check-bold': 'check-bold',
    'check-circle': 'check-circle',
    'information': 'information',
    'information-circle': 'information',
    'hand-right': 'hand-front-right',
    'warning': 'alert',
};

// Helper de Cores
const getStatusColor = (status) => {
    const safeStatus = (status || '').toString().toUpperCase();
    
    switch (safeStatus) {
        case 'AGENDADO': 
        case 'SCHEDULED': return '#3B82F6';
        case 'EM ANDAMENTO': 
        case 'IN_PROGRESS': return '#EAB308';
        case 'NO PÁTIO': 
        case 'CHECKED_IN': return '#EAB308';
        case 'CONCLUÍDO': 
        case 'COMPLETED': return '#10B981';
        case 'EXPIRADO': 
        case 'EXPIRED': return '#EF4444';
        default: return '#64748B';
    }
};

const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: 'long',
            weekday: 'long',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    } catch (e) {
        return dateString;
    }
};

// Componente para estrutura ANTIGA (DetailRow)
const DetailRow = ({ label, value, isLast }) => (
    <View style={[styles.detailRow, isLast && styles.noBorder]}>
        <View style={styles.detailContent}>
            <Text style={styles.heroLabel}>{label}</Text>
            <Text style={styles.detailValue}>{value || '-'}</Text>
        </View>
    </View>
);

export default function AppointmentDetailsModal() {
    const dispatch = useDispatch();
    const selectionData = useSelector(selectSelectedAppointment); 
    
    const appointment = selectionData?.appointment;
    const config = selectionData?.config;
    
    const visible = !!appointment;

    const panY = useRef(new Animated.Value(height)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const scrollViewRef = useRef(null);
    const [scrollEnabled, setScrollEnabled] = useState(true);

    const onGestureEvent = Animated.event(
        [{ nativeEvent: { translationY: panY } }],
        { 
            useNativeDriver: true,
            listener: (event) => {
                // Limita o movimento apenas para baixo (valores positivos)
                const translationY = event.nativeEvent.translationY;
                if (translationY < 0) {
                    panY.setValue(0);
                }
            }
        }
    );

    const onHandlerStateChange = (event) => {
        const { state, translationY, velocityY } = event.nativeEvent;

        if (state === State.BEGAN) {
            // Desabilita scroll enquanto arrasta
            setScrollEnabled(false);
        }

        if (state === State.END || state === State.CANCELLED) {
            // Reabilita scroll
            setScrollEnabled(true);

            // Só fecha se arrastar para baixo o suficiente
            // translationY > 0 significa arrastar para baixo
            if (translationY > MODAL_HEIGHT * 0.25 || (translationY > 50 && velocityY > 800)) {
                handleClose();
            } else {
                // Volta para posição original
                Animated.spring(panY, {
                    toValue: 0,
                    useNativeDriver: true,
                    damping: 20,
                    stiffness: 150
                }).start();
            }
        }
    };

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(panY, { toValue: 0, useNativeDriver: true, damping: 20, stiffness: 150 }),
                Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
            ]).start();
        } else {
            panY.setValue(height);
            opacity.setValue(0);
        }
    }, [visible]);

    const handleClose = () => {
        Animated.parallel([
            Animated.timing(panY, { toValue: height, duration: 250, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]).start(() => {
            dispatch(selectAppointment(null));
        });
    };

    if (!appointment) return null;

    // Helper para buscar valor em custom_data ou diretamente no appointment
    const getValue = (key) => {
        if (!key) return null;
        
        // Primeiro tenta em custom_data
        if (appointment.custom_data && 
            appointment.custom_data[key] !== undefined && 
            appointment.custom_data[key] !== null && 
            appointment.custom_data[key] !== '') {
            return appointment.custom_data[key];
        }
        
        // Depois tenta diretamente no appointment
        if (appointment[key] !== undefined && 
            appointment[key] !== null && 
            appointment[key] !== '') {
            return appointment[key];
        }
        
        return null;
    };

    // Helper antigo para compatibilidade
    const get = (key) => {
        if (!appointment || typeof appointment !== 'object') return null;
        if (Array.isArray(key)) {
            for (const k of key) {
                const value = getValue(k);
                if (value !== null) return value;
            }
            return null;
        }
        return getValue(key);
    };
    
    const statusText = get(['status', 'Status']) || 'Desconhecido';
    const statusColor = getStatusColor(statusText);
    const displayTime = formatDate(get(['schedule_start_time', 'Start_Time', 'start_time', 'scheduled_time']));
    const displayId = get(['booking_number', 'Appt', 'id', 'booking']);

    // Verifica se usa nova estrutura (modal_layout) ou antiga (popup)
    const useNewLayout = config?.modal_layout !== undefined;

    // ========== RENDERIZAÇÃO NOVA ESTRUTURA (modal_layout) ==========

    // Renderiza header do card (mesmos dados do card)
    const renderCardHeader = () => {
        if (!config?.card_layout) return null;

        const { header, sub_header } = config.card_layout;
        const headerValue = header?.key ? getValue(header.key) : null;
        const subHeaderValue = sub_header?.key ? getValue(sub_header.key) : null;

        return (
            <View style={styles.heroSection}>
                {headerValue && (
                    <>
                        {header.label && <Text style={styles.heroLabel}>{header.label}</Text>}
                        <Text style={styles.h1Default}>{headerValue}</Text>
                    </>
                )}

                {subHeaderValue && (
                    <>
                        {sub_header.label && <Text style={styles.heroLabel}>{sub_header.label}</Text>}
                        <Text style={styles.h2Default}>{subHeaderValue}</Text>
                    </>
                )}
            </View>
        );
    };

    // Renderiza componente SECTION
    const renderSection = (component, index) => {
        return (
            <View key={`section-${index}`} style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>{component.title}</Text>
            </View>
        );
    };

    // Renderiza componente FIELD
    const renderField = (component, index, isLastField) => {
        const value = getValue(component.key);
        if (!value) return null;

        return (
            <View key={`field-${index}`} style={[styles.fieldContainer, isLastField && styles.noBorder]}>
                <Text style={styles.fieldLabel}>{component.label}</Text>
                <Text style={styles.fieldValue}>{value}</Text>
            </View>
        );
    };

    // Renderiza componente ALERT
    const renderAlert = (component, index) => {
        const value = getValue(component.key);
        if (!value) return null;

        const colorScheme = ALERT_COLORS[component.color] || ALERT_COLORS.gray;
        const iconName = ICON_MAP[component.icon] || 'information';

        return (
            <View 
                key={`alert-${index}`} 
                style={[
                    styles.alertContainer,
                    { 
                        backgroundColor: colorScheme.bg,
                        borderColor: colorScheme.border 
                    }
                ]}
            >
                <View style={styles.alertContent}>
                    {component.icon && (
                        <Icon 
                            name={iconName} 
                            size={24} 
                            color={colorScheme.text} 
                            style={styles.alertIcon}
                        />
                    )}
                    <View style={styles.alertTextContainer}>
                        {component.title && (
                            <Text style={[styles.alertTitle, { color: colorScheme.text }]}>
                                {component.title}
                            </Text>
                        )}
                        <Text 
                            style={[
                                component.title ? styles.alertMessage : styles.alertMessageLarge,
                                { color: colorScheme.text }
                            ]}
                        >
                            {value}
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    // Renderiza componente QRCODE
    const renderQRCode = (component, index) => {
        const value = getValue(component.key);
        if (!value) return null;

        return (
            <View key={`qrcode-${index}`} style={styles.qrcodeContainer}>
                {component.title && (
                    <Text style={styles.qrcodeTitle}>{component.title}</Text>
                )}
                <View style={styles.qrcodeWrapper}>
                    <QRCode
                        value={value}
                        size={200}
                        backgroundColor="white"
                        color={THEME.slate900}
                    />
                </View>
                {component.caption && (
                    <Text style={styles.qrcodeCaption}>{component.caption}</Text>
                )}
            </View>
        );
    };

    // Renderiza componente baseado no tipo
    const renderComponent = (component, index, allComponents) => {
        // Verifica se é o último field (para não ter borda)
        const remainingComponents = allComponents.slice(index + 1);
        const hasAnotherFieldAfter = remainingComponents.some(c => c.type === 'field' && getValue(c.key));
        const isLastField = component.type === 'field' && !hasAnotherFieldAfter;

        switch (component.type) {
            case 'section':
                return renderSection(component, index);
            case 'field':
                return renderField(component, index, isLastField);
            case 'alert':
                return renderAlert(component, index);
            case 'qrcode':
                return renderQRCode(component, index);
            default:
                console.warn(`Tipo de componente desconhecido: ${component.type}`);
                return null;
        }
    };

    // Renderiza conteúdo com NOVA estrutura
    const renderNewLayout = () => {
        const modalLayout = config?.modal_layout || [];
        
        return (
            <>
                {/* Header do card (mesmos dados principais) */}
                {renderCardHeader()}
                
                {/* Divider */}
                {config?.card_layout && <View style={styles.dividerContainer} />}
                
                {/* Conteúdo do modal_layout */}
                <View style={styles.detailsSection}>
                    {modalLayout.map((component, index) => renderComponent(component, index, modalLayout))}
                </View>
            </>
        );
    };

    // ========== RENDERIZAÇÃO ANTIGA ESTRUTURA (popup) ==========

    const renderOldLayout = () => {
        const h1Value = get(config?.main?.h1?.key);
        const h1Label = config?.main?.h1?.label || '';
        const h2Value = get(config?.main?.h2?.key);
        const h2Label = config?.main?.h2?.label || '';

        return (
            <>
                <View style={styles.heroSection}>
                    <Text style={styles.heroLabel}>{h1Label}</Text>
                    <Text style={styles.h1Default}>{h1Value}</Text>

                    {h2Value != null && (
                        <>
                            <Text style={styles.heroLabel}>{h2Label}</Text>
                            <Text style={styles.h2Default}>{h2Value}</Text>
                        </>
                    )}
                </View>

                <View style={styles.dividerContainer} />

                <View style={styles.detailsSection}>
                    {config?.popup?.map((field, index) => (
                        <DetailRow
                            key={field.key}
                            label={field.label}
                            value={get(field.key)}
                            isLast={index === config.popup.length - 1}
                        />
                    ))}
                </View>
            </>
        );
    };

    return (
        <Modal transparent visible={visible} animationType="none" onRequestClose={handleClose}>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <View style={styles.overlay}>
                    <Pressable style={StyleSheet.absoluteFill} onPress={handleClose}>
                        <Animated.View style={[styles.backdrop, { opacity }]} />
                    </Pressable>

                    <Animated.View style={[
                        styles.modalContainer,
                        {
                            transform: [{
                                translateY: panY.interpolate({
                                    inputRange: [0, height],
                                    outputRange: [0, height],
                                    extrapolate: 'clamp'
                                })
                            }]
                        }
                    ]}>
                        {/* Handle Area - APENAS esta área permite arrastar */}
                        <PanGestureHandler
                            onGestureEvent={onGestureEvent}
                            onHandlerStateChange={onHandlerStateChange}
                        >
                            <Animated.View style={styles.handleArea}>
                                <View style={styles.handleContainer}>
                                    <View style={styles.handle} />
                                </View>

                                <Text style={styles.displayTime}>{displayTime}</Text>

                            </Animated.View>
                        </PanGestureHandler>

                        {/* ScrollView - Área de conteúdo rolável */}
                        <ScrollView 
                            ref={scrollViewRef}
                            style={styles.scrollView}
                            contentContainerStyle={styles.content}
                            showsVerticalScrollIndicator={true}
                            scrollEnabled={scrollEnabled}
                            bounces={true}
                            alwaysBounceVertical={false}
                            scrollEventThrottle={16}
                            nestedScrollEnabled={true}
                        >
                                <View style={styles.header}>
                                    <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                                        <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
                                    </View>
                                    <Text style={styles.idText}>#{displayId}</Text>
                                </View>
                            {/* Renderiza layout novo ou antigo baseado na estrutura do config */}
                            {useNewLayout ? renderNewLayout() : renderOldLayout()}

                            {/* Actions (se houver na nova estrutura) */}
                            {/* {config?.actions && config.actions.length > 0 && (
                                <View style={styles.actionsContainer}>
                                    {config.actions.map((action, index) => (
                                        <Pressable 
                                            key={`action-${index}`}
                                            style={[
                                                styles.actionButton,
                                                action.type === 'primary' && styles.actionButtonPrimary
                                            ]}
                                            onPress={() => console.log(`Action: ${action.id}`)}
                                        >
                                            <Text 
                                                style={[
                                                    styles.actionButtonText,
                                                    action.type === 'primary' && styles.actionButtonTextPrimary
                                                ]}
                                            >
                                                {action.label}
                                            </Text>
                                        </Pressable>
                                    ))}
                                </View>
                            )} */}
                        </ScrollView>
                    </Animated.View>
                </View>
            </GestureHandlerRootView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContainer: {
        height: MODAL_HEIGHT,
        backgroundColor: '#ffffffff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
    },
    handleArea: {
        backgroundColor: 'white',
        paddingHorizontal: 24,
        zIndex: 10,
        // borderBottomWidth: 1,
        // borderBottomColor: '#F1F5F9',
    },
    handleContainer: {
        alignItems: 'center',
        paddingVertical: 12,
        backgroundColor: 'white',
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: '#E2E8F0',
        borderRadius: 2,
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 24
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 5,
        backgroundColor: 'white',
    },
    idText: {
        fontSize: 14,
        fontWeight: '500',
        color: THEME.slate400,
    }, 
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    content: {
        paddingBottom: 20, // Espaço extra no final para facilitar scroll
    },
    displayTime: {
        textAlign: 'center',
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 25,
        marginTop: 5, 
        color: COLORS.slate600,
    },
    
    // ========== ESTILOS DA ESTRUTURA ANTIGA ==========
    heroSection: {
        alignItems: 'left',
        paddingVertical: 24,
        paddingTop: 16,
        backgroundColor: 'white',
        gap: 2,
    },
    heroLabel: {
        fontSize: 16,
        color: THEME.slate400,
        width: 110,
        fontWeight: '500',
    }, 
    h1Default: {
        fontSize: 26,
        fontWeight: '800',
        color: THEME.slate900,
    },
    h2Default: {
        fontSize: 20,
        fontWeight: '500',
        color: THEME.slate600,
    }, 
    dividerContainer: {
        flex: 1,
        height: 1,
        borderTopWidth: 2,
        borderTopColor: '#d6d6d6ff',
        borderStyle: 'dashed', 
        // marginVertical: 30
    },
    detailsSection: {
        backgroundColor: 'white',
        paddingBottom: 24,
        // borderBottomLeftRadius: 24,
        // borderBottomRightRadius: 24,
        marginBottom: 20,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    noBorder: {
        borderBottomWidth: 0,
    },
    detailContent: {
        flex: 1,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155',
    },
    
    // ========== ESTILOS DA NOVA ESTRUTURA ==========
    
    // Section styles
    sectionContainer: {
        // marginTop: 20,
        marginTop: 30,
        // paddingTop: 12,
        // borderTopWidth: 1,
        // borderTopColor: '#F1F5F9',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: THEME.slate900,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    
    // Field styles
    fieldContainer: {
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        // borderBottomWidth: 1,
        // borderBottomColor: '#F1F5F9',
    },
    fieldLabel: {
        fontSize: 16,
        color: THEME.slate400,
        fontWeight: '500',
        marginBottom: 2,
    },
    fieldValue: {
        fontSize: 16,
        color: '#334155',
        fontWeight: '600',
    },
    
    // Alert styles
    alertContainer: {
        borderRadius: 12,
        borderWidth: 1,
        padding: 16,
        marginTop: 30,
    },
    alertContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    alertIcon: {
        marginRight: 12,
        marginTop: 2,
    },
    alertTextContainer: {
        flex: 1,
    },
    alertTitle: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 4,
    },
    alertMessage: {
        fontSize: 13,
        fontWeight: '500',
        lineHeight: 18,
    },
    alertMessageLarge: {
        fontSize: 14,
        fontWeight: '600',
        lineHeight: 20,
    },
    
    // QRCode styles
    qrcodeContainer: {
        alignItems: 'center',
        marginTop: 30,
        paddingVertical: 12,
    },
    qrcodeTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: THEME.slate900,
        marginTop: 16,
    },
    qrcodeWrapper: {
        padding: 20,
        backgroundColor: THEME.white,
        borderRadius: 16,
        // borderWidth: 2,
        // borderColor: THEME.border,
    },
    qrcodeCaption: {
        fontSize: 13,
        color: THEME.slate600,
        marginTop: 12,
        textAlign: 'center',
        fontWeight: '500',
    },
    
    // Actions styles
    actionsContainer: {
        marginTop: 20,
        gap: 12,
    },
    actionButton: {
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: THEME.border,
        backgroundColor: THEME.white,
    },
    actionButtonPrimary: {
        backgroundColor: '#3B82F6',
        borderColor: '#3B82F6',
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: THEME.slate900,
    },
    actionButtonTextPrimary: {
        color: THEME.white,
    },
});