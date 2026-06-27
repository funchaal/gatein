import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Dimensions, Animated, ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { PanGestureHandler, State, GestureHandlerRootView } from 'react-native-gesture-handler';
import { 
    selectSelectedAppointment, 
    selectAppointment 
} from '../../../store/slices/activitySlice';
import { resolveStatusColor, get } from '../AppointmentCard/utils';
import { THEME } from '../AppointmentCard/constants';
import { COMPONENT_MAP } from './ModalComponents';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { height } = Dimensions.get('window');
const MODAL_HEIGHT = height * 0.75;

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

    const [showModal, setShowModal] = useState(false);
    const [localAppointment, setLocalAppointment] = useState(null);
    const [localConfig, setLocalConfig] = useState(null);

    const panY = useRef(new Animated.Value(height)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const scrollViewRef = useRef(null);
    const [scrollEnabled, setScrollEnabled] = useState(true);

    useEffect(() => {
        if (visible) {
            setLocalAppointment(appointment);
            setLocalConfig(config);
            setShowModal(true);
            panY.setValue(height);
            opacity.setValue(0);
            Animated.parallel([
                Animated.spring(panY, { toValue: 0, useNativeDriver: true, damping: 20, stiffness: 150 }),
                Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(panY, { toValue: height, duration: 250, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
            ]).start(() => {
                setShowModal(false);
                setLocalAppointment(null);
                setLocalConfig(null);
            });
        }
    }, [visible, appointment, config, opacity, panY]);

    const handleClose = () => {
        dispatch(selectAppointment(null));
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

    const statusText = localAppointment?.status || 'Desconhecido';
    const statusColor = localAppointment ? resolveStatusColor(statusText, localConfig?.card_layout?.status_tags) : '#000';
    const displayTime = localAppointment ? formatDate(localAppointment?.schedule?.start_time || localAppointment?.schedule_start_time) : '';
    const displayId = localAppointment?.ref || '';
    const modalLayout = localConfig?.modal_layout || [];

    const renderCardHeader = () => {
        if (!localConfig?.card_layout) return null;

        const { header, sub_header } = localConfig.card_layout;
        const headerValue = header?.field ? get(localAppointment, header.field) : null;
        const subHeaderValue = sub_header?.field ? get(localAppointment, sub_header.field) : null;

        const isTrip = localAppointment?.type === 'trip';
        const origin = isTrip ? (localAppointment?.custom_data?.origin_city || 'Origem') : '';
        const destination = isTrip ? (localAppointment?.custom_data?.destination_city || 'Destino') : '';

        return (
            <View>
                {isTrip && (
                    <View style={styles.routeSection}>
                        <View style={styles.routeHeader}>
                            <Text style={styles.routeTitle}>Rota de Viagem</Text>
                        </View>
                        <View style={styles.routeRow}>
                            <View style={styles.routePoint}>
                                <Text style={styles.routeLabel}>De</Text>
                                <Text style={styles.routeCity} numberOfLines={1}>{origin}</Text>
                            </View>
                            
                            <View style={styles.routePathContainer}>
                                <View style={styles.routeLine} />
                                <Icon name="truck-fast" size={20} color="#9778ff" style={styles.routeTruckIcon} />
                                <View style={styles.routeLine} />
                            </View>

                            <View style={[styles.routePoint, { alignItems: 'flex-end' }]}>
                                <Text style={styles.routeLabel}>Para</Text>
                                <Text style={styles.routeCity} numberOfLines={1}>{destination}</Text>
                            </View>
                        </View>
                    </View>
                )}

                {(headerValue || subHeaderValue) && (
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
                )}
            </View>
        );
    };

    if (!showModal) return null;

    return (
        <Modal transparent visible={showModal} animationType="none" statusBarTranslucent onRequestClose={handleClose}>
            <GestureHandlerRootView style={styles.gestureRoot}>
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
                            {localConfig?.card_layout && <View style={styles.dividerContainer} />}
                            
                            <View style={styles.detailsSection}>
                                {modalLayout.map((componentProps, index) => {
                                    const Component = COMPONENT_MAP[componentProps.element];
                                    if (!Component) return null;
                                    return <Component key={`${componentProps.element}-${index}`} data={localAppointment} props={componentProps} />;
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
    gestureRoot: { flex: 1 },
    // Overlay e Background
    overlay: { flex: 1, justifyContent: 'flex-end' }, // display: flex; justify-content: flex-end;
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }, // flex: 1; background-color: rgba(0,0,0,0.5);

    // Modal Principal
    modalContainer: {
        height: MODAL_HEIGHT, // height: calculado via JS (aprox 75vh)
        backgroundColor: '#ffffffff', // background-color: #ffffff
        borderTopLeftRadius: 24, // border-top-left-radius: 24px
        borderTopRightRadius: 24, // border-top-right-radius: 24px
        overflow: 'hidden', // overflow: hidden
        shadowColor: "#000", // box-shadow-color: #000
        shadowOffset: { width: 0, height: -2 }, // box-shadow-offset
        shadowOpacity: 0.1, // box-shadow-opacity
        shadowRadius: 10, // box-shadow-radius
        elevation: 10, // para android
    },

    // Área do Drag Handle (Puxador)
    handleArea: { 
        backgroundColor: 'white', // background-color: white
        paddingHorizontal: 24, // padding-left: 24px; padding-right: 24px
        zIndex: 10 // z-index: 10
    },
    handleContainer: { 
        alignItems: 'center', // align-items: center
        paddingVertical: 12, // padding-top: 12px; padding-bottom: 12px
        backgroundColor: 'white' // background-color: white
    },
    handle: { 
        width: 40, // width: 40px
        height: 4, // height: 4px
        backgroundColor: '#E2E8F0', // background-color: #E2E8F0
        borderRadius: 2 // border-radius: 2px
    },

    // Área de Conteúdo Scrollável
    scrollView: { 
        flex: 1, // flex: 1
        paddingHorizontal: 24 // padding-left: 24px; padding-right: 24px
    },
    content: { 
        paddingBottom: 20 // padding-bottom: 20px
    },

    // Header do Modal (Status e ID)
    header: { 
        flexDirection: 'row', // display: flex; flex-direction: row
        justifyContent: 'space-between', // justify-content: space-between
        alignItems: 'center', // align-items: center
        paddingBottom: 5, // padding-bottom: 5px
        backgroundColor: 'white' // background-color: white
    },
    idText: { 
        fontSize: 14, // font-size: 14px
        fontWeight: '500', // font-weight: 500
        color: THEME.slate400 // color
    }, 
    statusBadge: { 
        paddingHorizontal: 12, // padding-left: 12px; padding-right: 12px
        paddingVertical: 6, // padding-top: 6px; padding-bottom: 6px
        borderRadius: 8 // border-radius: 8px
    },
    statusText: { 
        fontSize: 12, // font-size: 12px
        fontWeight: '700', // font-weight: 700
        textTransform: 'uppercase' // text-transform: uppercase
    },
    displayTime: { 
        textAlign: 'center', // text-align: center
        fontSize: 15, // font-size: 15px
        fontWeight: '700', // font-weight: 700
        marginBottom: 25, // margin-bottom: 25px
        marginTop: 5, // margin-top: 5px
        color: THEME.slate600 // color
    },
    
    // Seção Hero (Header e SubHeader Dinâmicos)
    heroSection: { 
        alignItems: 'flex-start', // align-items: flex-start
        paddingVertical: 24, // padding-top: 24px; padding-bottom: 24px
        paddingTop: 16, // padding-top: 16px (sobrescreve o acima)
        backgroundColor: 'white', // background-color: white
        gap: 2 // gap: 2px
    },
    heroLabel: { 
        fontSize: 16, // font-size: 16px
        color: THEME.slate400, // color
        width: 110, // width: 110px
        fontWeight: '500' // font-weight: 500
    }, 
    h1Default: { 
        fontSize: 26, // font-size: 26px
        fontWeight: '800', // font-weight: 800
        color: THEME.slate900 // color
    },
    h2Default: { 
        fontSize: 20, // font-size: 20px
        fontWeight: '500', // font-weight: 500
        color: THEME.slate600 // color
    }, 

    // Divisor e Área de Detalhes
    dividerContainer: { 
        height: 1, // height: 1px
        borderTopWidth: 2, // border-top-width: 2px
        borderTopColor: '#d6d6d6ff', // border-top-color
        borderStyle: 'dashed', // border-style: dashed
        marginVertical: 12,
        marginBottom: 16,
    },
    detailsSection: { 
        backgroundColor: 'white', // background-color: white
        paddingBottom: 24, // padding-bottom: 24px
        marginBottom: 20 // margin-bottom: 20px
    },
    routeSection: {
        width: '100%',
        marginVertical: 16,
    },
    routeHeader: {
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    routeTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#9778ff',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    routeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    routePoint: {
        flex: 3,
    },
    routeLabel: {
        fontSize: 12,
        color: '#94a3b8',
        fontWeight: '600',
        marginBottom: 2,
        textTransform: 'uppercase',
    },
    routeCity: {
        fontSize: 15,
        fontWeight: '700',
        color: '#0f172a',
    },
    routePathContainer: {
        flex: 4,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 8,
        position: 'relative',
    },
    routeLine: {
        flex: 1,
        height: 2,
        backgroundColor: '#e2e8f0',
        borderStyle: 'dashed',
        borderWidth: 0,
        borderTopWidth: 1,
    },
    routeTruckIcon: {
        marginHorizontal: 6,
    },
});
