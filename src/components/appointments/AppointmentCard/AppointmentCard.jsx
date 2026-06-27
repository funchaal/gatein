import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { useDispatch } from 'react-redux';
import { selectAppointment } from '../../../store/slices/activitySlice';
import { formatDate, resolveStatusColor, getValue } from './utils';
import { styles } from './styles';
import { Row, Header, SubHeader } from './CardComponents';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function AppointmentCard({ item, config, company, hideRows }) {
    const dispatch = useDispatch();

    const handlePress = () => {
        dispatch(selectAppointment({ appointment: item, config }));
    };

    const status = item?.status || 'Desconhecido';
    const statusBaseColor = resolveStatusColor(status, config?.card_layout?.status_tags);
    const displayTime = formatDate(item?.schedule?.start_time || item?.schedule_start_time);
    const displayId = item?.ref;

    const { header, sub_header, body_rows } = config?.card_layout || {};

    const isTrip = item?.type === 'trip';
    const origin = isTrip ? (getValue(item, 'origin_city') || item?.custom_data?.origin_city || 'Origem') : '';
    const destination = isTrip ? (getValue(item, 'destination_city') || item?.custom_data?.destination_city || 'Destino') : '';

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
                    <Text style={styles.dateText}>{displayTime}</Text>
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
                        
                        <View style={[styles.badge, { backgroundColor: statusBaseColor + '20' }]}>
                            <Text style={[styles.badgeText, { color: statusBaseColor }]}>{status}</Text>
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
