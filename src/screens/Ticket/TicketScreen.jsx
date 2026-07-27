import React, { useRef, useEffect, useState, useMemo } from 'react';
import { View, Text, Animated, ScrollView, StatusBar, TouchableOpacity, StyleSheet } from 'react-native';
import ViewShot from 'react-native-view-shot';
import Share from 'react-native-share';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import MainAsyncButton from '../../components/ui/MainAsyncButton';
import CompanyLogo from '../../components/common/CompanyLogo';
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
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const slideAnim = useRef(new Animated.Value(0)).current;
    const viewShotRef = useRef();

    const appointment = route?.params?.appointment;
    const ticket = route?.params?.ticket;
    const ticket_layout = route?.params?.layout;

    const terminals = useSelector(selectAllTerminals);
    const layouts = useSelector(selectAllLayouts);

    const sortedTickets = useMemo(() => {
        if (!appointment?.tickets) return [];
        return [...appointment.tickets].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }, [appointment?.tickets]);

    const [activeTicketIndex, setActiveTicketIndex] = useState(() => {
        if (ticket && sortedTickets.length > 0) {
            const idx = sortedTickets.findIndex(t => t.id === ticket.id);
            return idx !== -1 ? idx : 0;
        }
        return 0;
    });

    const activeTicket = sortedTickets.length > 0 ? sortedTickets[activeTicketIndex] : ticket;

    const resolvedLayout = useMemo(() => {
        if (!activeTicket) return null;
        if (activeTicket.layout_ref) {
            const layoutKey = `${appointment.terminal_id}_${activeTicket.layout_ref}`;
            const layoutObj = layouts?.ticket?.[layoutKey] || layouts?.ticket?.[activeTicket.layout_ref];
            if (layoutObj) {
                return layoutObj.layout?.elements || layoutObj.elements || layoutObj;
            }
        }
        return ticket_layout?.layout?.elements || ticket_layout?.elements || ticket_layout;
    }, [activeTicket, appointment?.terminal_id, layouts, ticket_layout]);

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
    const displayTime = appointment ? formatDate(get(appointment, ['window_start', 'Start_Time', 'start_time', 'scheduled_time']), true) : '';

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
        // Fade in suave na montagem inicial da tela
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    }, [fadeAnim]);

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

    if (!appointment || !activeTicket) {
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
    if (activeTicket) {
        let rawContent = activeTicket;
        if (typeof activeTicket === 'string') {
            try {
                rawContent = JSON.parse(activeTicket);
            } catch (e) {
                rawContent = activeTicket;
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
                {sortedTickets.length > 1 && (
                    <View style={customStyles.tagsOuterContainer}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={customStyles.tagsScroll}
                        >
                            {sortedTickets.map((t, idx) => (
                                <TouchableOpacity
                                    key={t.id}
                                    activeOpacity={0.8}
                                    style={[
                                        customStyles.tagButton,
                                        activeTicketIndex === idx && customStyles.tagButtonActive
                                    ]}
                                    onPress={() => setActiveTicketIndex(idx)}
                                >
                                    <Text style={[
                                        customStyles.tagButtonText,
                                        activeTicketIndex === idx && customStyles.tagButtonTextActive
                                    ]}>
                                        Ticket {idx + 1}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                <ViewShot ref={viewShotRef} options={{ format: "png", quality: 0.9 }} style={screenStyles.viewShotContainer}>
                    <View style={screenStyles.pageHeader}>
                        <Text style={screenStyles.pageTitle}>Ticket de Acesso</Text>
                    </View>
 
                    {/* Top Info Container */}
                    <View style={screenStyles.topInfoContainer}>
                        {(() => {
                            const terminal = terminals?.[appointment?.terminal_id];
                            const terminalName = terminal?.name || 'Agendamento';
                            return (
                                <View style={screenStyles.bookingStrip}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <CompanyLogo
                                            logoUrl={terminal?.logo_url || appointment?.terminal_logo_url}
                                            name={terminalName}
                                            companyId={appointment?.terminal_id}
                                            size={22}
                                            style={{ marginRight: 8 }}
                                        />
                                        <Text style={screenStyles.bookingLabel}>{terminalName}</Text>
                                    </View>
                                    <Text style={screenStyles.bookingId}>#{appointment.ref || '—'}</Text>
                                </View>
                            );
                        })()}
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
                        {(resolvedLayout || []).map((componentProps, index) => {
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
 
                        {activeTicket.created_at && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', marginTop: 16, paddingBottom: 8 }}>
                                <Icon name="information-outline" size={12} color="#94A3B8" />
                                <Text style={{ fontSize: 11, color: '#94A3B8', fontWeight: '600', marginLeft: 4 }}>
                                    ticket gerado em {formatDate(activeTicket.created_at, true)}
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

const customStyles = StyleSheet.create({
    tagsOuterContainer: {
        marginBottom: 16,
        paddingHorizontal: 24,
        marginTop: 10,
    },
    tagsScroll: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
        paddingVertical: 4,
    },
    tagButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    tagButtonActive: {
        backgroundColor: '#F97316',
        borderColor: '#F97316',
    },
    tagButtonText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#64748B',
    },
    tagButtonTextActive: {
        color: '#FFFFFF',
    },
});
