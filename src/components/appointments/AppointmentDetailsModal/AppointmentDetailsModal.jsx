import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Dimensions, Animated, ScrollView, Platform, Linking, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { PanGestureHandler, State, GestureHandlerRootView } from 'react-native-gesture-handler';
import {
    selectSelectedAppointment,
    selectAppointment
} from '../../../store/slices/activitySlice';
import { selectAllTerminals } from '../../../store/slices/companiesSlice';
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
        const origin = isTrip ? (localAppointment?.from || localAppointment?.custom_data?.origin_city || 'Origem') : '';
        const destination = isTrip ? (localAppointment?.to || localAppointment?.custom_data?.destination_city || 'Destino') : '';

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
                                <View style={styles.dottedLineContainer}>
                                    <View style={styles.dot} />
                                    <View style={styles.dot} />
                                    <View style={styles.dot} />
                                    <View style={styles.dot} />
                                </View>
                                <Icon name="truck-fast" size={20} color="#9778ff" style={styles.routeTruckIcon} />
                                <View style={styles.dottedLineContainer}>
                                    <View style={styles.dot} />
                                    <View style={styles.dot} />
                                    <View style={styles.dot} />
                                    <View style={styles.dot} />
                                </View>
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
                            <View style={styles.headerGroup}>
                                {header.label && <Text style={styles.heroLabel}>{header.label}</Text>}
                                <Text style={styles.h1Default}>{headerValue}</Text>
                            </View>
                        )}
                        {subHeaderValue && (
                            <View style={styles.subHeaderGroup}>
                                {sub_header.label && <Text style={styles.heroLabel}>{sub_header.label}</Text>}
                                <Text style={styles.h2Default}>{subHeaderValue}</Text>
                            </View>
                        )}
                    </View>
                )}
            </View>
        );
    };

    const terminals = useSelector(selectAllTerminals);

    const handleOpenMap = (address, latitude, longitude) => {
        let url;
        if (latitude && longitude) {
            url = Platform.select({
                ios: `maps:0,0?q=${latitude},${longitude}`,
                android: `geo:0,0?q=${latitude},${longitude}`
            });
        } else {
            url = Platform.select({
                ios: `maps:0,0?q=${encodeURIComponent(address)}`,
                android: `geo:0,0?q=${encodeURIComponent(address)}`
            });
        }

        Linking.openURL(url).catch(() => {
            const webUrl = `https://www.google.com/maps/search/?api=1&query=${latitude && longitude ? `${latitude},${longitude}` : encodeURIComponent(address)
                }`;
            Linking.openURL(webUrl).catch(() => Alert.alert("Erro", "Não foi possível abrir o mapa."));
        });
    };

    const formatAddress = (address) => {
        if (!address) return '';
        if (typeof address === 'object') {
            const street = address.street || '';
            const number = address.number || '';
            const city = address.city || '';
            const state = address.state || '';
            const zip = address.zip || address.cep || '';

            let streetPart = street;
            if (street && number) {
                streetPart = `${street}, ${number}`;
            } else if (number) {
                streetPart = number;
            }

            let cityPart = city;
            if (city && state) {
                cityPart = `${city} - ${state}`;
            } else if (state) {
                cityPart = state;
            }

            const parts = [];
            if (streetPart) parts.push(streetPart);
            if (cityPart) parts.push(cityPart);
            if (zip) parts.push(zip);

            if (parts.length === 0) {
                return Object.values(address).filter(v => typeof v === 'string' || typeof v === 'number').join(', ');
            }
            return parts.join(' · ');
        }
        return String(address);
    };

    const renderLocationSection = () => {
        if (!localAppointment) return null;

        const isTrip = localAppointment.type === 'trip' || localAppointment.is_trip;

        if (isTrip) {
            // It's a trip
            const originObj = localAppointment.origin || localAppointment.custom_data?.origin || null;
            const originFull = originObj ? formatAddress(originObj) : formatAddress(localAppointment.custom_data?.origin_city || localAppointment.origin_city || 'Origem');

            const terminal = terminals[localAppointment.terminal_id];
            const destinyObj = localAppointment.destiny || terminal?.address || null;
            const destFull = destinyObj ? formatAddress(destinyObj) : formatAddress(localAppointment.custom_data?.destination_city || localAppointment.custom_data?.destination || terminal?.name || localAppointment.destination_city || 'Destino');

            const originLat = localAppointment.origin?.lat || localAppointment.custom_data?.origin_lat || localAppointment.origin_lat || (originObj && typeof originObj === 'object' ? originObj?.lat : undefined);
            const originLng = localAppointment.origin?.lng || localAppointment.custom_data?.origin_lng || localAppointment.origin_lng || (originObj && typeof originObj === 'object' ? originObj?.lng : undefined);
            const destLat = localAppointment.destiny?.lat || localAppointment.custom_data?.destination_lat || localAppointment.destination_lat || terminal?.latitude || terminal?.lat || (destinyObj && typeof destinyObj === 'object' ? destinyObj?.lat : undefined);
            const destLng = localAppointment.destiny?.lng || localAppointment.custom_data?.destination_lng || localAppointment.destination_lng || terminal?.longitude || terminal?.lng || (destinyObj && typeof destinyObj === 'object' ? destinyObj?.lng : undefined);

            return (
                <View style={styles.locationContainer}>
                    <Text style={styles.locationSectionTitle}>Informações de Localização</Text>

                    <View style={styles.timelineContainer}>
                        {/* Connecting Line */}
                        <View style={styles.timelineConnector} />

                        {/* Origin Point */}
                        <Pressable
                            style={({ pressed }) => [styles.locationRow, pressed && styles.locationRowPressed]}
                            onPress={() => handleOpenMap(originFull, originLat, originLng)}
                        >
                            <View style={styles.timelineDotContainer}>
                                <Icon name="circle-double" size={18} color="#64748B" />
                            </View>
                            <View style={styles.locationInfo}>
                                <Text style={styles.locationRole}>Origem</Text>
                                <Text style={styles.locationText} numberOfLines={2}>{originFull}</Text>
                                <Text style={styles.viewOnMapText}>Toque para ver no mapa</Text>
                            </View>
                            <Icon name="chevron-right" size={20} color="#94A3B8" />
                        </Pressable>

                        {/* Spacer */}
                        <View style={{ height: 12 }} />

                        {/* Destination Point */}
                        <Pressable
                            style={({ pressed }) => [styles.locationRow, pressed && styles.locationRowPressed]}
                            onPress={() => handleOpenMap(destFull, destLat, destLng)}
                        >
                            <View style={styles.timelineDotContainer}>
                                <Icon name="map-marker-outline" size={20} color="#64748B" />
                            </View>
                            <View style={styles.locationInfo}>
                                <Text style={styles.locationRole}>Destino</Text>
                                <Text style={styles.locationText} numberOfLines={2}>{destFull}</Text>
                                <Text style={styles.viewOnMapText}>Toque para ver no mapa</Text>
                            </View>
                            <Icon name="chevron-right" size={20} color="#94A3B8" />
                        </Pressable>
                    </View>
                </View>
            );
        } else {
            // It's an appointment (only terminal detailed address)
            const terminal = terminals[localAppointment.terminal_id];
            const terminalName = terminal?.name || localAppointment.terminal_name || 'Terminal';
            const terminalAddress = terminal?.address || localAppointment.terminal_address || '';
            const formattedName = formatAddress(terminalName);
            const formattedAddress = formatAddress(terminalAddress);

            if (!formattedAddress) return null;

            const terminalLat = terminal?.latitude || terminal?.lat || (typeof terminalAddress === 'object' ? terminalAddress?.lat : undefined);
            const terminalLng = terminal?.longitude || terminal?.lng || (typeof terminalAddress === 'object' ? terminalAddress?.lng : undefined);

            return (
                <View style={styles.locationContainer}>
                    <Text style={styles.locationSectionTitle}>Local da Operação</Text>

                    <Pressable
                        style={({ pressed }) => [styles.locationCard, pressed && styles.locationCardPressed]}
                        onPress={() => handleOpenMap(`${formattedName}, ${formattedAddress}`, terminalLat, terminalLng)}
                    >
                        <View style={styles.locationCardLeft}>
                            <View style={styles.locationIconWrapper}>
                                <Icon name="office-building-marker-outline" size={22} color="#9778ff" />
                            </View>
                            <View style={styles.locationCardInfo}>
                                <Text style={styles.terminalName}>{formattedName}</Text>
                                <Text style={styles.terminalAddress} numberOfLines={2}>{formattedAddress}</Text>
                                <Text style={styles.viewOnMapText}>Toque para ver rota no mapa</Text>
                            </View>
                        </View>
                        <Icon name="map-search-outline" size={20} color="#9778ff" />
                    </Pressable>
                </View>
            );
        }
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
                            {renderLocationSection()}
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
        gap: 10 // gap: 10px
    },
    headerGroup: {
        alignSelf: 'stretch',
        gap: 0
    },
    subHeaderGroup: {
        alignSelf: 'stretch',
        gap: 0
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
        fontSize: 11,
        fontWeight: '700',
        color: '#64748B',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 1,
    },
    routeCity: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1E293B',
    },
    routePathContainer: {
        flex: 4,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 8,
        position: 'relative',
    },
    dottedLineContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        paddingHorizontal: 2,
    },
    dot: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: '#94a3b8',
    },
    routeTruckIcon: {
        marginHorizontal: 6,
    },
    locationContainer: {
        marginTop: 16,
        marginBottom: 8,
        paddingHorizontal: 0,
    },
    locationSectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: THEME.slate400,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 10,
    },
    locationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
    },
    locationCardPressed: {
        opacity: 0.7,
    },
    locationCardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 12,
    },
    locationIconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    locationCardInfo: {
        flex: 1,
    },
    terminalName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 2,
    },
    terminalAddress: {
        fontSize: 13,
        color: '#64748B',
        lineHeight: 18,
    },
    viewOnMapText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#9778ff',
        marginTop: 4,
    },
    timelineContainer: {
        position: 'relative',
        paddingVertical: 6,
    },
    timelineConnector: {
        position: 'absolute',
        left: 18,
        top: 24,
        bottom: 24,
        width: 1.5,
        backgroundColor: '#E2E8F0',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationRowPressed: {
        opacity: 0.7,
    },
    timelineDotContainer: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        zIndex: 1,
    },
    locationInfo: {
        flex: 1,
        marginRight: 8,
    },
    locationRole: {
        fontSize: 11,
        fontWeight: '700',
        color: '#64748B',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 1,
    },
    locationText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1E293B',
    },
});
