import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useDispatch } from 'react-redux';
import { selectAppointment } from '../../../store/slices/activitySlice';
import { formatDate, getValue, getStatusDisplay } from './utils';
import { styles } from './styles';
import { Row, Header, SubHeader } from './CardComponents';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useLogActivityEventsMutation } from '../../../services/api';
import { trackClicked } from '../../../utils/activityTracker';
import { useCountdown } from '../../../hooks/useCountdown';
import { DEFAULT_TRIP_LAYOUT, DEFAULT_APPOINTMENT_LAYOUT } from './constants';
import CompanyLogo from '../../common/CompanyLogo';

export default function AppointmentCard({ item, config, company, hideRows }) {
    const dispatch = useDispatch();
    const [logEvents] = useLogActivityEventsMutation();

    const isTrip = item?.type === 'trip' || !!item?.is_trip;
    const effectiveConfig = config || (isTrip ? DEFAULT_TRIP_LAYOUT : DEFAULT_APPOINTMENT_LAYOUT);

    const handlePress = () => {
        dispatch(selectAppointment({ appointment: item, config: effectiveConfig }));
        
        const activityType = isTrip ? 'trip' : 'appointment';
        if (trackClicked(item.id)) {
            logEvents({
                events: [
                    {
                        activity_type: activityType,
                        activity_id: item.id,
                        event: 'clicked',
                        message: `${isTrip ? 'Viagem' : 'Agendamento'} clicado no app móvel.`
                    }
                ]
            }).unwrap().catch(err => {
                console.error("Erro ao enviar log de clique:", err);
            });
        }
    };

    const rawStatus = item?.status || 'Desconhecido';
    const displayTime = formatDate(item?.schedule?.start_time || item?.window_start);
    const displayId = item?.ref;

    const { header, sub_header, body_rows } = effectiveConfig?.card_layout || {};

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
    const hasTopTag = isCountdownActive || countdown.phase === 'ended' || (countdown.phase !== 'far' && countdown.label);

    const statusDisplay = getStatusDisplay(rawStatus, countdown.phase, effectiveConfig?.card_layout?.status_tags);

    const visibleBodyRows = (!hideRows && body_rows && body_rows.length > 0)
        ? body_rows.filter(row => {
            if (isTrip && (row.field === 'origin_city' || row.field === 'destination_city')) {
                return false;
            }
            const val = row.field ? getValue(item, row.field) : null;
            return !!val;
        })
        : [];

    return (
        <Pressable 
            style={({ pressed }) => [ 
                styles.card, 
                pressed && styles.cardPressed,
                isTrip && styles.tripCardAccent
            ]} 
            onPress={handlePress}
            key={item.ref || item.id}
        >
            {/* Topo do card: Tag no lado esquerdo ("Hoje", "Sábado", "Até 18:30 para entrar", etc.) e Data resumida no lado direito (ex: 27/06 18:00) */}
            <View style={styles.topTagRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    {isCountdownActive ? (
                        <View style={[styles.countdownBadge, countdown.phase === 'window' && styles.countdownBadgeWindow]}>
                            <Icon name="clock-outline" size={13} color={countdown.phase === 'window' ? "#15803d" : "#c2410c"} style={{ marginRight: 4 }} />
                            <Text style={[styles.countdownText, countdown.phase === 'window' && styles.countdownTextWindow]}>
                                {countdown.label}
                            </Text>
                        </View>
                    ) : countdown.phase === 'ended' ? (
                        <View style={styles.countdownBadge}>
                            <Icon name="clock-alert-outline" size={13} color="#b91c1c" style={{ marginRight: 4 }} />
                            <Text style={[styles.countdownText, { color: '#b91c1c' }]}>
                                Encerrado
                            </Text>
                        </View>
                    ) : countdown.label ? (
                        <Text style={styles.dayTagText}>{countdown.label}</Text>
                    ) : null}
                </View>

                {displayTime ? (
                    <Text style={styles.dateText}>{displayTime}</Text>
                ) : null}
            </View>

            {/* Linha 2: Nome da Empresa */}
            <View style={styles.companyRow}>
                <View style={styles.companyInfo}>
                    <CompanyLogo
                        logoUrl={company?.logo_url || item?.terminal_logo_url || item?.trucking_company_logo_url}
                        name={company?.name || item?.terminal_name || item?.trucking_company_name || item?.company_name || (isTrip ? 'TR' : 'TM')}
                        companyId={company?.id || (isTrip ? item?.trucking_company_id : item?.terminal_id)}
                        size={24}
                        style={{ marginRight: 6 }}
                    />
                    <Text style={styles.companyNameText} numberOfLines={1}>
                        {company?.name || item?.terminal_name || item?.trucking_company_name || item?.company_name || (isTrip ? 'Transportadora' : 'Terminal')}
                    </Text>
                </View>
            </View>

            {/* Linha 3: Lado esquerdo = Tag de Status (única), Lado direito = Ref */}
            <View style={styles.statusAndRefRow}>
                <View style={[styles.badge, { backgroundColor: statusDisplay.bg }]}>
                    <Text style={[styles.badgeText, { color: statusDisplay.color }]}>{statusDisplay.text}</Text>
                </View>
                {displayId ? <Text style={styles.idText}>#{displayId}</Text> : null}
            </View>

            {effectiveConfig?.card_layout && (
                <>

                    {/* Row 3: Destination (if Trip) and Header and Subheader */}
                    <View style={styles.titlesRow}>
                        {isTrip && (
                            <View style={styles.cardRouteRow}>
                                <Icon name="map-marker-outline" size={16} color="#9778ff" style={styles.cardDestinationIcon} />
                                <Text style={styles.cardDestinationLabel}>Destino: </Text>
                                <Text style={styles.cardRouteCity} numberOfLines={1}>{destination}</Text>
                            </View>
                        )}
                        <Header data={item} props={header} />
                        <SubHeader data={item} props={sub_header} />
                    </View>

                    {/* Body rows */}
                    {visibleBodyRows.length > 0 && (
                        <View style={styles.footerContainer}>
                            {visibleBodyRows.map((row, index) => (
                                <Row data={item} props={row} key={index} />
                            ))}
                        </View>
                    )}
                </>
            )}
        </Pressable>
    );
}
