import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Dimensions, Animated, ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { PanGestureHandler, State, GestureHandlerRootView } from 'react-native-gesture-handler';
import { 
    selectSelectedAppointment, 
    selectAppointment 
} from '../../store/slices/appointmentsSlice';

const { height } = Dimensions.get('window');
const MODAL_HEIGHT = height * 0.75;

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

const DetailRow = ({ label, value, isLast }) => (
    <View style={[styles.detailRow, isLast && styles.noBorder]}>
        <View style={styles.detailContent}>
            <Text style={styles.heroLabel}>{label}</Text>
            <Text style={styles.detailValue}>{value || '-'}</Text>
        </View>
    </View>
);

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


export default function AppointmentDetailsModal() {
    const dispatch = useDispatch();
    const selectionData = useSelector(selectSelectedAppointment); 
    
    const appointment = selectionData?.appointment;
    const config = selectionData?.config;
    
    const visible = !!appointment;

    const panY = useRef(new Animated.Value(height)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    const onGestureEvent = Animated.event(
        [{ nativeEvent: { translationY: panY } }],
        { useNativeDriver: true }
    );

    const onHandlerStateChange = (event) => {
        if (event.nativeEvent.oldState === State.ACTIVE) {
            const { translationY, velocityY } = event.nativeEvent;
            
            if (translationY > MODAL_HEIGHT * 0.4 || velocityY > 800) {
                handleClose();
            } else {
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

    const get = (key) => {
        if (!appointment || typeof appointment !== 'object') return null;
        if (Array.isArray(key)) {
            for (const k of key) {
                if (appointment[k] !== undefined) return appointment[k];
            }
            return null;
        }
        return appointment[key] || null;
    };
    
    const statusText = get(['status', 'Status']) || 'Desconhecido';
    const statusColor = getStatusColor(statusText);
    const displayTime = formatDate(get(['window_start', 'Start_Time', 'start_time']));
    const displayId = get(['booking_number', 'Appt', 'id']);

    const h1Value = get(config?.main?.h1?.key);
    const h1Label = config?.main?.h1?.label || '';
    const h2Value = get(config?.main?.h2?.key);
    const h2Label = config?.main?.h2?.label || '';

    return (
        <Modal transparent visible={visible} animationType="none" onRequestClose={handleClose}>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <View style={styles.overlay}>
                    <Pressable style={StyleSheet.absoluteFill} onPress={handleClose}>
                        <Animated.View style={[styles.backdrop, { opacity }]} />
                    </Pressable>

                    <PanGestureHandler
                        onGestureEvent={onGestureEvent}
                        onHandlerStateChange={onHandlerStateChange}
                    >
                        <Animated.View style={[
                            styles.modalContainer,
                            {
                                transform: [{
                                    translateY: panY.interpolate({
                                        inputRange: [-200, 0, height],
                                        outputRange: [-50, 0, height],
                                        extrapolate: 'clamp'
                                    })
                                }]
                            }
                        ]}>
                            <View style={styles.handleContainer}>
                                <View style={styles.handle} />
                            </View>

                            <Text style={styles.displayTime}>{displayTime}</Text>

                            <ScrollView contentContainerStyle={styles.content}>
                                <View style={styles.header}>
                                    <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                                        <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
                                    </View>
                                    <Text style={styles.idText}>#{displayId}</Text>
                                </View>

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

                                <View style={styles.dividerContainer}>
                                </View>

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
                            </ScrollView>
                        </Animated.View>
                    </PanGestureHandler>
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
        paddingHorizontal: 24
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        // paddingHorizontal: 4,
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
        paddingBottom: 40,
    },
    displayTime: {
        textAlign: 'center',
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 25,
        marginTop: 5, 
        color: COLORS.slate600,
    }, 
    heroSection: {
        alignItems: 'left',
        paddingVertical: 24,

        paddingTop: 16,
        backgroundColor: 'white',
        gap: 2,
    },
    heroLabel: {
        fontSize: 14,
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
        fontSize: 16,
        fontWeight: '500',
        color: THEME.slate600,
    }, 
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        height: 20,
        overflow: 'hidden',
    },
    circleLeft: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#F8FAFC',
        marginLeft: -10,
    },
    circleRight: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#F8FAFC',
        marginRight: -10,
    },
    dividerContainer: {
        flex: 1,
        height: 1,
        borderTopWidth: 2,
        borderTopColor: '#d6d6d6ff',
        borderStyle: 'dashed'
    },
    detailsSection: {
        backgroundColor: 'white',
        paddingBottom: 24,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
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
    detailLabel: {
        fontSize: 13,
        color: '#94A3B8',
        marginBottom: 2,
        fontWeight: '500',
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 24,
        paddingVertical: 16,
        borderRadius: 16,
        gap: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
    },
    actionButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    }
});