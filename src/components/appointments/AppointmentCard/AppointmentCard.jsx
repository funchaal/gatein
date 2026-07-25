import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { useDispatch } from 'react-redux';
import { selectAppointment } from '../../../store/slices/activitySlice';
import { formatDate, resolveStatusColor, getValue, translateStatus } from './utils';
import { styles } from './styles';
import { Row, Header, SubHeader } from './CardComponents';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useLogActivityEventsMutation } from '../../../services/api';
import { trackClicked } from '../../../utils/activityTracker';
import { useCountdown } from '../../../hooks/useCountdown';

export default function AppointmentCard({ item, config, company, hideRows }) {
    const dispatch = useDispatch();
    const [logEvents] = useLogActivityEventsMutation();

    const handlePress = () => {
        dispatch(selectAppointment({ appointment: item, config }));
        
        if (trackClicked(item.id)) {
            logEvents({
                events: [
                    {
                        activity_type: item.type,
                        activity_id: item.id,
                        event: 'clicked',
                        message: `${item.type === 'trip' ? 'Viagem' : 'Agendamento'} clicado no app móvel.`
                    }
                ]
            }).unwrap().catch(err => {
                console.error("Erro ao enviar log de clique:", err);
            });
        }
    };

    const rawStatus = item?.status || 'Desconhecido';
    const translatedStatus = translateStatus(rawStatus);
    const statusBaseColor = resolveStatusColor(rawStatus, config?.card_layout?.status_tags);
    const displayTime = formatDate(item?.schedule?.start_time || item?.window_start);
    const displayId = item?.ref;

    const { header, sub_header, body_rows } = config?.card_layout || {};

    const isTrip = item?.type === 'trip';
    const origin = isTrip ? (item?.from || getValue(item, 'origin_city') || item?.custom_data?.origin_city || 'Origem') : '';
    const destination = isTrip ? (item?.to || getValue(item, 'destination_city') || item?.custom_data?.destination_city || 'Destino') : '';

    const startTime = item?.schedule?.start_time || item?.window_start;
    const endTime = item?.schedule?.end_time || item?.window_end;
    const startTol = item?.schedule?.start_tolerance || item?.start_tolerance || 0;
    const endTol = item?.schedule?.end_tolerance || item?.end_tolerance || 0;

    const countdown = useCountdown(startTime, endTime, {
        startToleranceMinutes: startTol,
        endToleranceMinutes: endTol
    });

    const isCountdownActive = countdown.phase === 'soon' || countdown.phase === 'window';

    return (
        <Pressable 
            style={({ pressed }) => [ 
                styles.card, 
                pressed && styles.cardPressed,
                isTrip && styles.tripCardAccent
            ]} 
            onPress={handlePress}
            key={item.ref}
        >
            <View style={styles.headerRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {isTrip && (
                        <Icon name="truck-delivery" size={16} color="#9778ff" style={{ marginRight: 6 }} />
                    )}
                    {isCountdownActive && !isTrip ? (
                        <View style={[styles.countdownBadge, countdown.phase === 'window' && styles.countdownBadgeWindow]}>
                            <Icon name="clock-outline" size={14} color={countdown.phase === 'window' ? "#15803d" : "#c2410c"} style={{ marginRight: 4 }} />
                            <Text style={[styles.countdownText, countdown.phase === 'window' && styles.countdownTextWindow]}>
                                {countdown.label}
                            </Text>
                        </View>
                    ) : (
                        <Text style={styles.dateText}>{countdown.phase !== 'far' && countdown.label ? countdown.label : displayTime}</Text>
                    )}
                </View>
                <Text style={styles.idText}>#{displayId}</Text>
            </View>

            {config?.card_layout && (
                <>
                    {/* Row 2: Company Info + Status Tag */}
                    <View style={styles.companyRow}>
                        <View style={styles.companyInfo}>
                            {company?.logo_url ? (
                                <Image source={{ uri: company.logo_url }} style={styles.companyLogo} />
                            ) : (
                                <View style={styles.companyPlaceholderLogo}>
                                    <Text style={styles.companyPlaceholderText}>
                                        {(company?.name || 'TR').substring(0, 2).toUpperCase()}
                                    </Text>
                                </View>
                            )}
                            <Text style={styles.companyNameText} numberOfLines={1}>
                                {company?.name || 'Transportadora'}
                            </Text>
                        </View>
                        <View style={{ flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                            <View style={[styles.badge, { backgroundColor: statusBaseColor + '20' }]}>
                                <Text style={[styles.badgeText, { color: statusBaseColor }]}>{translatedStatus}</Text>
                            </View>
                            {rawStatus === 'ACTIVE' && countdown.phase === 'window' && (
                                <View style={[styles.badge, { backgroundColor: '#dcfce7' }]}>
                                    <Text style={[styles.badgeText, { color: '#15803d' }]}>JANELA ABERTA</Text>
                                </View>
                            )}
                            {rawStatus === 'ACTIVE' && countdown.phase === 'ended' && (
                                <View style={[styles.badge, { backgroundColor: '#fee2e2' }]}>
                                    <Text style={[styles.badgeText, { color: '#b91c1c' }]}>ATRASADO</Text>
                                </View>
                            )}
                            {(rawStatus === 'DEACTIVATED' || rawStatus === 'DESATIVADO') && (
                                <View style={[styles.badge, { backgroundColor: '#fee2e2' }]}>
                                    <Text style={[styles.badgeText, { color: '#b91c1c' }]}>DESATIVADO</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Row 3: Route (if Trip) and Header and Subheader */}
                    <View style={styles.titlesRow}>
                        {isTrip && (
                            <View style={styles.cardRouteRow}>
                                <Text style={styles.cardRouteCity} numberOfLines={1}>{origin}</Text>
                                <View style={styles.cardRoutePathContainer}>
                                    <View style={styles.cardRouteLine} />
                                    <Icon name="truck-fast" size={16} color="#9778ff" style={styles.cardRouteIcon} />
                                    <View style={styles.cardRouteLine} />
                                </View>
                                <Text style={[styles.cardRouteCity, { textAlign: 'right' }]} numberOfLines={1}>{destination}</Text>
                            </View>
                        )}
                        <Header data={item} props={header} />
                        <SubHeader data={item} props={sub_header} />
                    </View>

                    {/* Body rows */}
                    {!hideRows && body_rows && body_rows.length > 0 && (
                        <View style={styles.footerContainer}>
                            {body_rows.map((row, index) => {
                                if (isTrip && (row.field === 'origin_city' || row.field === 'destination_city')) {
                                    return null;
                                }
                                return (
                                    <Row data={item} props={row} key={index} />
                                );
                            })}
                        </View>
                    )}
                </>
            )}
        </Pressable>
    );
}
