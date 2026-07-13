import React, { useState } from 'react';
import {
    View, Text, Pressable, StyleSheet,
    Modal, FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { COLORS } from '../../../constants/colors';
import { selectOnGoingAppointments } from '../../../store/slices/activitySlice';
import { selectTicketLayoutsForOngoingTerminal } from '../../../store/slices/companiesSlice';
import { get } from '../../appointments/AppointmentCard/utils';

// ─── helpers ──────────────────────────────────────────────────────────────────

const getHeader = (appt) =>
    get(appt, ['ref', 'booking_ref']) ||
    `#${get(appt, ['booking_number', 'Appt', 'id']) || appt.id}`;

const getSubHeader = (appt) =>
    get(appt, ['tipo_operacao', 'tipo']) ||
    get(appt, ['produto', 'product']) ||
    get(appt, 'driver_name') || // Atualizado para ler o custom_data
    '—';

const getDetail = (appt) =>
    get(appt, 'plate') || // Atualizado para ler o custom_data
    get(appt, ['placa', 'vehicle_plate', 'Plate']) || '';

const STATUS_COLORS = {
    CHECKED_IN: { bg: '#D1FAE5', text: '#065F46', label: 'Check-in' },
    IN_PROGRESS: { bg: '#DBEAFE', text: '#1E40AF', label: 'Em progresso' },
};

// ─── picker modal ─────────────────────────────────────────────────────────────

function AppointmentPickerModal({ visible, appointments, onSelect, onClose }) {
    return (
        <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
            <Pressable style={modal.overlay} onPress={onClose}>
                <Pressable style={modal.sheet} onPress={(e) => e.stopPropagation()}>
                    <View style={modal.handle} />
                    <Text style={modal.title}>Selecionar ticket</Text>
                    <Text style={modal.subtitle}>{appointments.length} operações ativas</Text>

                    <FlatList
                        data={appointments}
                        keyExtractor={(item) => String(item.id)}
                        ItemSeparatorComponent={() => <View style={modal.separator} />}
                        renderItem={({ item }) => {
                            const s = STATUS_COLORS[item.status] || STATUS_COLORS.CHECKED_IN;
                            const detail = getDetail(item);
                            return (
                                <Pressable
                                    style={({ pressed }) => [modal.item, pressed && modal.itemPressed]}
                                    onPress={() => onSelect(item)}
                                >
                                    <View style={modal.itemIcon}>
                                        <IconMC name="ticket-confirmation-outline" size={22} color={COLORS.primary} />
                                    </View>
                                    <View style={modal.itemBody}>
                                        <View style={modal.itemRow}>
                                            <Text style={modal.itemHeader} numberOfLines={1}>{getHeader(item)}</Text>
                                            <View style={[modal.pill, { backgroundColor: s.bg }]}>
                                                <Text style={[modal.pillText, { color: s.text }]}>{s.label}</Text>
                                            </View>
                                        </View>
                                        <Text style={modal.itemSub} numberOfLines={1}>
                                            {getSubHeader(item)}{detail ? `  ·  ${detail}` : ''}
                                        </Text>
                                    </View>
                                    <Icon name="chevron-forward" size={18} color="#CBD5E1" />
                                </Pressable>
                            );
                        }}
                    />
                </Pressable>
            </Pressable>
        </Modal>
    );
}

// ─── main ─────────────────────────────────────────────────────────────────────

export default function TicketBar({ terminalConfig }) {
    const navigation = useNavigation();
    const onGoing = useSelector(selectOnGoingAppointments);
    const [pickerVisible, setPickerVisible] = useState(false);
    const ticket_layouts = useSelector(selectTicketLayoutsForOngoingTerminal);


    const navigate = (appt) => {
        const ticket = appt?.ticket || (appt?.tickets && appt.tickets[0]);
        if (!ticket) return;

        let layout = null;
        if (ticket.layout_ref) {
            const layoutKey = `${appt.terminal_id}_${ticket.layout_ref}`;
            const layoutObj = ticket_layouts[layoutKey] || ticket_layouts[ticket.layout_ref];
            // Sometimes it's nested under .layout, sometimes it's direct
            layout = layoutObj?.layout || layoutObj?.elements ? layoutObj : null;
        }

        navigation.navigate('Ticket', {
            appointment: appt,
            ticket: ticket,
            layout: layout?.elements ? layout.elements : layout?.layout?.elements ? layout.layout.elements : layout
        });
    };

    const handlePress = () => {
        if (!onGoing.length) return;
        onGoing.length === 1 ? navigate(onGoing[0]) : setPickerVisible(true);
    };

    const handleSelect = (appt) => {
        setPickerVisible(false);
        navigate(appt);
    };

    return (
        <>
            <View style={styles.container}>
                <Icon name="ticket-outline" size={35} color={COLORS.primary} />
                <View style={styles.textContainer}>
                    <Text style={styles.bigText}>Você está no terminal</Text>
                    <Text style={styles.smallText}>Veja as instruções de operação</Text>
                </View>
                <Pressable
                    style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
                    onPress={handlePress}
                >
                    <Text style={styles.buttonText}>Ver Ticket</Text>
                    {onGoing.length > 1 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{onGoing.length}</Text>
                        </View>
                    )}
                    <Icon name="chevron-forward-outline" size={16} color="white" />
                </Pressable>
            </View>

            <AppointmentPickerModal
                visible={pickerVisible}
                appointments={onGoing}
                onSelect={handleSelect}
                onClose={() => setPickerVisible(false)}
            />
        </>
    );
}

// ─── styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        paddingHorizontal: 15,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    textContainer: { flex: 1 },
    smallText: { fontSize: 12, color: '#666' },
    bigText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    button: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    buttonPressed: { opacity: 0.85 },
    buttonText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
    badge: {
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 5,
    },
    badgeText: { color: 'white', fontSize: 11, fontWeight: '800' },
});

const modal = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
    sheet: {
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingBottom: 40,
        paddingTop: 12,
        maxHeight: '60%',
    },
    handle: {
        width: 40, height: 4, borderRadius: 2,
        backgroundColor: '#E2E8F0',
        alignSelf: 'center', marginBottom: 20,
    },
    title: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 2 },
    subtitle: { fontSize: 13, color: '#94A3B8', fontWeight: '500', marginBottom: 20 },
    separator: { height: 1, backgroundColor: '#F1F5F9' },
    item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12 },
    itemPressed: { opacity: 0.6 },
    itemIcon: {
        width: 44, height: 44, borderRadius: 12,
        backgroundColor: '#F0F9FF',
        alignItems: 'center', justifyContent: 'center',
    },
    itemBody: { flex: 1, gap: 3 },
    itemRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    itemHeader: { fontSize: 15, fontWeight: '700', color: '#1E293B', flex: 1 },
    itemSub: { fontSize: 13, color: '#94A3B8', fontWeight: '500' },
    pill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
    pillText: { fontSize: 11, fontWeight: '700' },
});
