import React, { useRef, useEffect } from 'react';
import { View, Text, Animated, ScrollView, StatusBar, Alert } from 'react-native';
import ViewShot from 'react-native-view-shot';
import Share from 'react-native-share';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import MainAsyncButton from '../../components/ui/MainAsyncButton';
import { selectAllTerminals, selectAllLayouts } from '../../store/slices/companiesSlice';
import { THEME } from '../../components/appointments/AppointmentCard/constants';
import { get } from '../../components/appointments/AppointmentCard/utils';
import { COLORS } from '../../constants/colors';

import { formatDate, getFieldValue } from './helpers';
import { TICKET_STATUS_COLORS } from './constants';
import { screenStyles, heroStyles, perfStyles } from './TicketScreen.styles';

import DividerElement from './components/DividerElement';
import FieldElement from './components/FieldElement';
import SectionElement from './components/SectionElement';
import TagContainerElement from './components/TagContainerElement';
import AttentionElement from './components/AttentionElement';
import InstructionElement from './components/InstructionElement';
import TextElement from './components/TextElement';
import HighlightElement from './components/HighlightElement';
import HighlightGridElement from './components/HighlightGridElement';

const ELEMENT_MAP = {
    divider: DividerElement,
    field: FieldElement,
    section: SectionElement,
    tag_container: TagContainerElement,
    attention: AttentionElement,
    instruction: InstructionElement,
    text: TextElement,
    highlight: HighlightElement,
    highlight_grid: HighlightGridElement,
};

function StatusHero({ statusText }) {
    const scheme = TICKET_STATUS_COLORS[statusText] || TICKET_STATUS_COLORS.default;
    return (
        <View style={[heroStyles.container, { backgroundColor: scheme.bg }]}>
            <View style={heroStyles.iconWrapper}>
                <Icon name={scheme.icon} size={28} color={scheme.text} />
            </View>
            <Text style={[heroStyles.statusText, { color: scheme.text }]}>{statusText}</Text>
        </View>
    );
}

function TicketPerforation() {
    return (
        <View style={perfStyles.row}>
            <View style={perfStyles.dashedLine} />
        </View>
    );
}

export default function TicketScreen({ route }) {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const viewShotRef = useRef();

    const appointment = route?.params?.appointment;
    const ticket = route?.params?.ticket;
    const ticket_layout = route?.params?.layout;

    const terminals = useSelector(selectAllTerminals);
    const layouts = useSelector(selectAllLayouts);

    const getCardConfig = (appt) => {
        if (!appt) return null;

        // 1. Tenta buscar do estado global de layouts (dados reais da API)
        if (layouts?.appointment) {
            const layoutKey = `${appt.terminal_id}_${appt.layout_ref}`;
            const apiConfig = layouts.appointment[layoutKey]?.layout;
            if (apiConfig) return apiConfig;
        }

        // 2. Fallback para mock data no terminal (se disponível)
        if (!terminals) return null;
        const terminal = terminals[appt.terminal_id];
        if (!terminal || !terminal.appointments_layouts) return null;
        const config = terminal.appointments_layouts.find(c => c.type === appt.type)
            || terminal.appointments_layouts.find(c => c.type === 'DEFAULT')
            || terminal.appointments_layouts[0];
        return config;
    };

    const config = getCardConfig(appointment);
    const displayTime = appointment ? formatDate(get(appointment, ['schedule_start_time', 'Start_Time', 'start_time', 'scheduled_time']), true) : '';

    const renderCardHeader = () => {
        if (!config?.card_layout) return null;
        const { header, sub_header } = config.card_layout;
        const headerValue = header?.field ? getFieldValue(appointment, header.field) : null;
        const subHeaderValue = sub_header?.field ? getFieldValue(appointment, sub_header.field) : null;

        return (
            <View style={screenStyles.heroSection}>
                {headerValue && (
                    <View style={screenStyles.headerGroup}>
                        {header.label && <Text style={screenStyles.heroLabel}>{header.label}</Text>}
                        <Text style={screenStyles.h1Default}>{headerValue}</Text>
                    </View>
                )}
                {subHeaderValue && (
                    <View style={screenStyles.subHeaderGroup}>
                        {sub_header.label && <Text style={screenStyles.heroLabel}>{sub_header.label}</Text>}
                        <Text style={screenStyles.h2Default}>{subHeaderValue}</Text>
                    </View>
                )}
            </View>
        );
    };

    useEffect(() => {
        if (ticket) {
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
                Animated.spring(slideAnim, { toValue: 0, damping: 18, stiffness: 120, useNativeDriver: true }),
            ]).start();
        } else {
            fadeAnim.setValue(0);
            slideAnim.setValue(30);
        }
    }, [ticket, fadeAnim, slideAnim]);

    useEffect(() => {
        navigation.setOptions({
            title: '',
            headerShown: true,
            headerStyle: {
                backgroundColor: '#ffffff',
                elevation: 0,
                shadowOpacity: 0,
                borderBottomWidth: 0,
            },
            headerTitleStyle: {
                fontSize: 17,
                fontWeight: '700',
                color: THEME.slate900,
                letterSpacing: 0.2,
            },
            headerTintColor: COLORS.primary,
            headerBackTitleVisible: false,
        });
    }, [navigation]);

    if (!appointment || !ticket) {
        return (
            <View style={screenStyles.empty}>
                <View style={screenStyles.emptyIconWrapper}>
                    <Icon name="ticket-outline" size={40} color={THEME.slate400} />
                </View>
                <Text style={screenStyles.emptyTitle}>Nenhum ticket ativo</Text>
                <Text style={screenStyles.emptySubtitle}>Realize o check-in para gerar seu ticket de acesso.</Text>
            </View>
        );
    }

    let content = {};
    if (ticket) {
        let rawContent = ticket;
        if (typeof ticket === 'string') {
            try {
                rawContent = JSON.parse(ticket);
            } catch (e) {
                rawContent = ticket;
            }
        }
        
        const possibleContent = rawContent?.content !== undefined ? rawContent.content : rawContent;
        if (typeof possibleContent === 'string') {
            try {
                content = JSON.parse(possibleContent);
            } catch (e) {
                content = {};
            }
        } else if (typeof possibleContent === 'object' && possibleContent !== null) {
            content = possibleContent;
        }
    }


    const handleShare = async () => {
        if (!viewShotRef.current) return;
        try {
            const uri = await viewShotRef.current.capture();
            await Share.open({
                url: uri,
                title: 'Compartilhar Ticket',
                message: `Aqui está meu ticket de acesso: ${appointment?.ref || ''}`,
                type: 'image/png'
            });
        } catch (error) {
            console.log('Error sharing ticket:', error);
        }
    };

    return (
        <Animated.View style={[screenStyles.root, { opacity: fadeAnim }]}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            <ScrollView
                style={screenStyles.scroll}
                contentContainerStyle={screenStyles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <ViewShot ref={viewShotRef} options={{ format: "png", quality: 0.9 }} style={{ backgroundColor: '#ffffff' }}>
                    <View style={screenStyles.pageHeader}>
                        <Text style={screenStyles.pageTitle}>Ticket de Acesso</Text>
                    </View>

                    {/* Top Info Container */}
                    <View style={screenStyles.topInfoContainer}>

                        <View style={screenStyles.bookingStrip}>
                            <Text style={screenStyles.bookingLabel}>Agendamento</Text>
                            <Text style={screenStyles.bookingId}>#{appointment.ref || '—'}</Text>
                        </View>
                    </View>

                    {renderCardHeader()}
                    <View style={screenStyles.timeContainer}>
                        <Icon name="calendar-clock-outline" size={18} color={THEME.slate600} />
                        <Text style={screenStyles.displayTime}>{displayTime}</Text>
                    </View>

                    {/* Perfuração superior */}
                    <TicketPerforation />

                    {/* Corpo do ticket */}
                    <View style={screenStyles.ticketBody}>
                        {(ticket_layout || []).map((componentProps, index) => {
                            const Component = ELEMENT_MAP[componentProps.element];
                            if (!Component) return null;
                            return (
                                <Component
                                    key={`${componentProps.element}-${index}`}
                                    data={content}
                                    props={componentProps}
                                />
                            );
                        })}

                        {ticket.created_at && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', marginTop: 16, paddingBottom: 8 }}>
                                <Icon name="information-outline" size={12} color="#94A3B8" />
                                <Text style={{ fontSize: 11, color: '#94A3B8', fontWeight: '600', marginLeft: 4 }}>
                                    ticket gerado em {formatDate(ticket.created_at, true)}
                                </Text>
                            </View>
                        )}
                    </View>
                </ViewShot>
            </ScrollView>

            <View style={[screenStyles.footer, { paddingHorizontal: 24, paddingBottom: Math.max(insets.bottom, 20) }]}>
                <MainAsyncButton
                    title="Compartilhar"
                    onPress={handleShare}
                />
            </View>
        </Animated.View>
    );
}
