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
import { getStatusColor, get } from './AppointmentCard/utils';
import { THEME } from './AppointmentCard/constants';

const { height } = Dimensions.get('window');
const MODAL_HEIGHT = height * 0.75;

const ALERT_COLORS = {
    purple: { bg: '#F3E8FF', border: '#A855F7', text: '#7C3AED' },
    blue: { bg: '#DBEAFE', border: '#3B82F6', text: '#2563EB' },
    green: { bg: '#D1FAE5', border: '#10B981', text: '#059669' },
    yellow: { bg: '#FEF3C7', border: '#F59E0B', text: '#D97706' },
    red: { bg: '#FEE2E2', border: '#EF4444', text: '#DC2626' },
    gray: { bg: '#F3F4F6', border: '#9CA3AF', text: '#6B7280' },
};

const ICON_MAP = {
    'alert-circle': 'alert-circle',
    'check-bold': 'check-bold',
    'check-circle': 'check-circle',
    'information': 'information',
    'information-circle': 'information',
    'hand-right': 'hand-front-right',
    'warning': 'alert',
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

// ==========================================
// COMPONENTES DA ESTRUTURA
// ==========================================

function Section({ props }) {
    const s = {
        container: { marginTop: 30 },
        title: { fontSize: 14, fontWeight: '700', color: THEME.slate900, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
    };
    return (
        <View style={s.container}>
            <Text style={s.title}>{props.title}</Text>
        </View>
    );
}

function Field({ data, props }) {
    const value = get(data, props.field);
    if (!value) return null;

    const s = {
        container: { paddingVertical: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
        label: { fontSize: 16, color: THEME.slate400, fontWeight: '500', marginBottom: 2 },
        value: { fontSize: 16, color: '#334155', fontWeight: '600' },
    };

    return (
        <View style={s.container}>
            <Text style={s.label}>{props.label}</Text>
            <Text style={s.value}>{value}</Text>
        </View>
    );
}

export function AlertComponent({ data, props }) {
    const value = get(data, props.field);
    if (!value) return null;

    const colorScheme = ALERT_COLORS[props.color] || ALERT_COLORS.gray;
    const iconName = ICON_MAP[props.icon] || 'information';

    const s = {
        container: { borderRadius: 12, borderWidth: 1, padding: 16, marginTop: 30 },
        content: { flexDirection: 'row', alignItems: 'flex-start' },
        icon: { marginRight: 12, marginTop: 2 },
        textContainer: { flex: 1 },
        title: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
        message: { fontSize: 13, fontWeight: '500', lineHeight: 18 },
        messageLarge: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
    };

    return (
        <View style={[s.container, { backgroundColor: colorScheme.bg, borderColor: colorScheme.border }]}>
            <View style={s.content}>
                {props.icon && (
                    <Icon name={iconName} size={24} color={colorScheme.text} style={s.icon} />
                )}
                <View style={s.textContainer}>
                    {props.title && (
                        <Text style={[s.title, { color: colorScheme.text }]}>
                            {props.title}
                        </Text>
                    )}
                    
                    <Text style={[props.title ? s.message : s.messageLarge, { color: colorScheme.text }]}>
                        {value}
                    </Text>
                    
                </View>
            </View>
        </View>
    );
}

function QRCodeComponent({ data, props }) {
    const value = get(data, props.field);
    if (!value) return null;

    const s = {
        container: { alignItems: 'center', marginTop: 30, paddingVertical: 12 },
        title: { fontSize: 15, fontWeight: '700', color: THEME.slate900, marginTop: 16 },
        wrapper: { padding: 20, backgroundColor: THEME.white, borderRadius: 16 },
        caption: { fontSize: 13, color: THEME.slate600, marginTop: 12, textAlign: 'center', fontWeight: '500' },
    };

    return (
        <View style={s.container}>
            {props.title && <Text style={s.title}>{props.title}</Text>}
            <View style={s.wrapper}>
                <QRCode
                    value={value}
                    size={200}
                    backgroundColor="white"
                    color={THEME.slate900}
                />
            </View>
            {props.caption && <Text style={s.caption}>{props.caption}</Text>}
        </View>
    );
}

const COMPONENT_MAP = {
    section: Section,
    field: Field,
    alert: AlertComponent,
    qrcode: QRCodeComponent,
};

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

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

    useEffect(() => {
        if (visible) {
            panY.setValue(height);
            opacity.setValue(0);
            Animated.parallel([
                Animated.spring(panY, { toValue: 0, useNativeDriver: true, damping: 20, stiffness: 150 }),
                Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
            ]).start();
        }
    }, [visible]);

    const handleClose = () => {
        Animated.parallel([
            Animated.timing(panY, { toValue: height, duration: 250, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]).start(() => dispatch(selectAppointment(null)));
    };

    const onGestureEvent = Animated.event(
        [{ nativeEvent: { translationY: panY } }],
        { 
            useNativeDriver: true,
            listener: (event) => {
                if (event.nativeEvent.translationY < 0) panY.setValue(0);
            }
        }
    );

    const onHandlerStateChange = (event) => {
        const { state, translationY, velocityY } = event.nativeEvent;
        if (state === State.BEGAN) setScrollEnabled(false);
        if (state === State.END || state === State.CANCELLED) {
            setScrollEnabled(true);
            if (translationY > MODAL_HEIGHT * 0.25 || (translationY > 50 && velocityY > 800)) {
                handleClose();
            } else {
                Animated.spring(panY, { toValue: 0, useNativeDriver: true, damping: 20, stiffness: 150 }).start();
            }
        }
    };

    const statusText = appointment ? (get(appointment, ['status', 'Status']) || 'Desconhecido') : '';
    const statusColor = appointment ? getStatusColor(statusText) : '#000';
    const displayTime = appointment ? formatDate(get(appointment, ['schedule_start_time', 'Start_Time', 'start_time', 'scheduled_time'])) : '';
    const displayId = appointment ? get(appointment, ['booking_number', 'Appt', 'id', 'booking']) : '';
    const modalLayout = config?.modal_layout || [];

    const renderCardHeader = () => {
        if (!config?.card_layout) return null;
        const { header, sub_header } = config.card_layout;
        const headerValue = header?.field ? get(appointment, header.field) : null;
        const subHeaderValue = sub_header?.field ? get(appointment, sub_header.field) : null;

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

    return (
        <Modal transparent visible={visible} animationType="none" onRequestClose={handleClose}>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <View style={styles.overlay}>
                    <Pressable style={StyleSheet.absoluteFill} onPress={handleClose}>
                        <Animated.View style={[styles.backdrop, { opacity }]} />
                    </Pressable>

                    <Animated.View style={[
                        styles.modalContainer,
                        { transform: [{ translateY: panY.interpolate({ inputRange: [0, height], outputRange: [0, height], extrapolate: 'clamp' }) }] }
                    ]}>
                        <PanGestureHandler onGestureEvent={onGestureEvent} onHandlerStateChange={onHandlerStateChange}>
                            <Animated.View style={styles.handleArea}>
                                <View style={styles.handleContainer}>
                                    <View style={styles.handle} />
                                </View>
                                <Text style={styles.displayTime}>{displayTime}</Text>
                            </Animated.View>
                        </PanGestureHandler>

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

                            {renderCardHeader()}
                            {config?.card_layout && <View style={styles.dividerContainer} />}
                            
                            <View style={styles.detailsSection}>
                                {modalLayout.map((componentProps, index) => {
                                    const Component = COMPONENT_MAP[componentProps.element];
                                    if (!Component) return null;
                                    return <Component key={`${componentProps.element}-${index}`} data={appointment} props={componentProps} />;
                                })}
                            </View>
                        </ScrollView>
                    </Animated.View>
                </View>
            </GestureHandlerRootView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'flex-end' },
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
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
    handleArea: { backgroundColor: 'white', paddingHorizontal: 24, zIndex: 10 },
    handleContainer: { alignItems: 'center', paddingVertical: 12, backgroundColor: 'white' },
    handle: { width: 40, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2 },
    scrollView: { flex: 1, paddingHorizontal: 24 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 5, backgroundColor: 'white' },
    idText: { fontSize: 14, fontWeight: '500', color: THEME.slate400 }, 
    statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    statusText: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
    content: { paddingBottom: 20 },
    displayTime: { textAlign: 'center', fontSize: 15, fontWeight: '700', marginBottom: 25, marginTop: 5, color: THEME.slate600 },
    
    heroSection: { alignItems: 'flex-start', paddingVertical: 24, paddingTop: 16, backgroundColor: 'white', gap: 2 },
    heroLabel: { fontSize: 16, color: THEME.slate400, width: 110, fontWeight: '500' }, 
    h1Default: { fontSize: 26, fontWeight: '800', color: THEME.slate900 },
    h2Default: { fontSize: 20, fontWeight: '500', color: THEME.slate600 }, 
    dividerContainer: { flex: 1, height: 1, borderTopWidth: 2, borderTopColor: '#d6d6d6ff', borderStyle: 'dashed' },
    detailsSection: { backgroundColor: 'white', paddingBottom: 24, marginBottom: 20 },
});