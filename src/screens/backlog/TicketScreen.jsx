import React, { useRef, useEffect } from 'react';
import {
    View, Text, StyleSheet, Animated, ScrollView,
    Dimensions, StatusBar, Share
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import MainAsyncButton from '../../components/ui/MainAsyncButton';
import { selectSelectedAppointment, selectAppointment } from '../../store/slices/activitySlice';
import { selectAllTerminals, selectAllLayouts } from '../../store/slices/companiesSlice';
import { THEME } from '../../components/appointments/AppointmentCard/constants';
import { get } from '../../components/appointments/AppointmentCard/utils';
import { COLORS } from '../../constants/colors';

const { width } = Dimensions.get('window');

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

// ============================================================================
// HELPER DE EXTRAÇÃO DE DADOS — NÃO ALTERADO
// ============================================================================
const getFieldValue = (data, field) => {
    if (!field) return null;
    if (data[field]) return data[field];
    return get(data, Array.isArray(field) ? field : [field]);
};

// ============================================================================
// TICKET STATUS COLORS — NÃO ALTERADO
// ============================================================================
const TICKET_STATUS_COLORS = {
    'Acesso Liberado':  { bg: '#D1FAE5', border: '#10B981', text: '#065F46', icon: 'check-circle' },
    'Aguardando':       { bg: '#FEF3C7', border: '#F59E0B', text: '#92400E', icon: 'clock-outline' },
    'Negado':           { bg: '#FEE2E2', border: '#EF4444', text: '#991B1B', icon: 'close-circle' },
    'Em Processo':      { bg: '#DBEAFE', border: '#3B82F6', text: '#1E40AF', icon: 'progress-clock' },
    default:            { bg: '#F3F4F6', border: '#9CA3AF', text: '#374151', icon: 'information' },
};

// ============================================================================
// COMPONENTES DE ELEMENTOS — APENAS ESTILOS ALTERADOS
// ============================================================================

function DividerElement({ props }) {
    return (
        <View style={elStyles.dividerWrapper}>
            {props.label ? (
                <View style={elStyles.dividerLabeled}>
                    <View style={elStyles.dividerLine} />
                    <Text style={elStyles.dividerLabel}>{props.label}</Text>
                    <View style={elStyles.dividerLine} />
                </View>
            ) : (
                <View style={[elStyles.dividerLine, { flex: 1 }]} />
            )}
        </View>
    );
}

function FieldElement({ data, props }) {
    const value = getFieldValue(data, props.field);
    if (!value) return null;
    return (
        <View style={elStyles.fieldRow}>
            <Text style={elStyles.fieldLabel}>{props.label}</Text>
            <Text style={elStyles.fieldValue}>{value}</Text>
        </View>
    );
}

function SectionElement({ props }) {
    return (
        <View style={elStyles.sectionWrapper}>
            <Text style={elStyles.sectionTitle}>{props.title}</Text>
        </View>
    );
}

function TagContainerElement({ data, props }) {
    const tags = props.tags || [];
    if (!tags.length) return null;
    const colorMap = {
        purple: { bg: '#7C3AED20', text: '#7C3AED' },
        blue:   { bg: '#3B82F620', text: '#3B82F6' },
        green:  { bg: '#10B98120', text: '#10B981' },
        yellow: { bg: '#EAB30820', text: '#EAB308' },
        red:    { bg: '#EF444420', text: '#EF4444' },
        gray:   { bg: '#64748B20', text: '#64748B' },
    };
    return (
        <View style={elStyles.tagContainer}>
            {props.label && <Text style={elStyles.tagContainerLabel}>{props.label}</Text>}
            <View style={elStyles.tagRow}>
                {tags.map((tag, i) => {
                    const c = colorMap[tag.color] || colorMap.gray;
                    return (
                        <View key={i} style={[elStyles.tag, { backgroundColor: c.bg }]}>
                            {tag.icon && <Icon name={tag.icon} size={15} color={c.text} style={{ marginRight: 4, flexShrink: 0 }} />}
                            <Text style={[elStyles.tagText, { color: c.text }]}>{tag.label ? tag.label.toUpperCase() : ''}</Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

function AttentionElement({ data, props }) {
    const value = props.message || (props.field && getFieldValue(data, props.field));
    if (!value) return null;
    const COLORS = {
        orange: { bg: '#FFEDD5', border: '#FB923C', text: '#9A3412', icon: '#EA580C' },
        red:    { bg: '#FEE2E2', border: '#F87171', text: '#991B1B', icon: '#DC2626' },
        yellow: { bg: '#FEF3C7', border: '#FACC15', text: '#854D0E', icon: '#CA8A04' },
        blue:   { bg: '#DBEAFE', border: '#60A5FA', text: '#1D4ED8', icon: '#2563EB' },
        gray:   { bg: '#F3F4F6', border: '#D1D5DB', text: '#374151', icon: '#6B7280' },
    };
    const c = COLORS[props.color] || COLORS.orange;
    const iconName = props.icon || 'alert-circle-outline';
    return (
        <View style={[elStyles.attentionBox, { backgroundColor: c.bg, borderColor: c.bg }]}>
            <Icon name={iconName} size={20} color={c.icon} style={{ marginTop: 1 }} />
            <View style={{ flex: 1, marginLeft: 10 }}>
                {props.title && <Text style={[elStyles.attentionTitle, { color: c.text }]}>{props.title}</Text>}
                <Text style={[elStyles.attentionText, { color: c.text }]}>{value}</Text>
            </View>
        </View>
    );
}

function InstructionElement({ props }) {
    const steps = props.steps || [];
    if (!steps.length) return null;
    return (
        <View style={elStyles.instructionWrapper}>
            {props.title && <Text style={elStyles.instructionTitle}>{props.title}</Text>}
            {steps.map((step, i) => (
                <View key={i} style={elStyles.instructionStep}>
                    <View style={elStyles.instructionBullet}>
                        <Text style={elStyles.instructionBulletText}>{i + 1}</Text>
                    </View>
                    <Text style={elStyles.instructionStepText}>{step}</Text>
                </View>
            ))}
        </View>
    );
}

function TextElement({ data, props }) {
    const value = props.text || (props.field && getFieldValue(data, props.field));
    if (!value) return null;
    const sizeMap = { sm: 13, md: 15, lg: 18 };
    const weightMap = { normal: '400', medium: '500', bold: '700' };
    return (
        <Text style={[
            elStyles.freeText,
            { fontSize: sizeMap[props.size] || 14 },
            { fontWeight: weightMap[props.weight] || '400' },
            props.align && { textAlign: props.align },
            props.color && { color: props.color },
        ]}>
            {value}
        </Text>
    );
}

function HighlightElement({ data, props }) {
    const value = props.value || (props.field && getFieldValue(data, props.field));
    if (!value) return null;
    const colorScheme = {
        blue:   { bg: '#DBEAFE', border: '#BFDBFE', text: '#1D4ED8' },
        green:  { bg: '#D1FAE5', border: '#BBF7D0', text: '#15803D' },
        amber:  { bg: '#FEF3C7', border: '#FDE68A', text: '#B45309' },
        slate:  { bg: '#F1F5F9', border: '#E2E8F0', text: '#334155' },
    };
    const c = colorScheme[props.color] || colorScheme.slate;
    return (
        <View style={[elStyles.highlightBox, { backgroundColor: c.bg, borderColor: c.bg }]}>
            {props.label && <Text style={[elStyles.highlightLabel, { color: c.text }]}>{props.label}</Text>}
            <Text style={[elStyles.highlightValue, { color: c.text }]}>{value}</Text>
            {props.caption && <Text style={[elStyles.highlightCaption, { color: c.text }]}>{props.caption}</Text>}
        </View>
    );
}

function HighlightGridElement({ data, props }) {
    const items = props.items || [];
    if (!items.length) return null;
    return (
        <View style={elStyles.gridWrapper}>
            {props.label && <Text style={elStyles.sectionTitle}>{props.label}</Text>}
            <View style={elStyles.grid}>
                {items.map((item, i) => (
                    <HighlightElement key={i} data={data} props={item} />
                ))}
            </View>
        </View>
    );
}

const ELEMENT_MAP = {
    divider:        DividerElement,
    field:          FieldElement,
    section:        SectionElement,
    tag_container:  TagContainerElement,
    attention:      AttentionElement,
    instruction:    InstructionElement,
    text:           TextElement,
    highlight:      HighlightElement,
    highlight_grid: HighlightGridElement,
};

// ============================================================================
// STATUS HERO BANNER
// ============================================================================

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

// ============================================================================
// TICKET SCREEN
// ============================================================================

export default function TicketScreen({ route }) {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

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
    const displayTime = appointment ? formatDate(get(appointment, ['schedule_start_time', 'Start_Time', 'start_time', 'scheduled_time'])) : '';

    const renderCardHeader = () => {
        if (!config?.card_layout) return null;
        const { header, sub_header } = config.card_layout;
        const headerValue = header?.field ? getFieldValue(appointment, header.field) : null;
        const subHeaderValue = sub_header?.field ? getFieldValue(appointment, sub_header.field) : null;

        return (
            <View style={screenStyles.heroSection}>
                {headerValue && (
                    <>
                        {header.label && <Text style={screenStyles.heroLabel}>{header.label}</Text>}
                        <Text style={screenStyles.h1Default}>{headerValue}</Text>
                    </>
                )}
                {subHeaderValue && (
                    <>
                        {sub_header.label && <Text style={screenStyles.heroLabel}>{sub_header.label}</Text>}
                        <Text style={screenStyles.h2Default}>{subHeaderValue}</Text>
                    </>
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
    }, [ticket]);

    // Configurar o header nativo com a seta de voltar
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

    const content = ticket.content || {};
    const resolvedData = { ...appointment, ...appointment?.custom_data, ...content };
    const statusText = content.status || 'Aguardando';

    return (
        <Animated.View style={[screenStyles.root, { opacity: fadeAnim }]}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            <ScrollView
                style={screenStyles.scroll}
                contentContainerStyle={screenStyles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
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

                {/* Status Hero */}
                {/* <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
                    <StatusHero statusText={statusText} />
                </Animated.View> */}

                {/* Perfuração superior */}
                <TicketPerforation />

                {/* Corpo do ticket — agora fullscreen, sem card com sombra */}
                <View style={screenStyles.ticketBody}>
                    {ticket_layout.map((componentProps, index) => {
                        const Component = ELEMENT_MAP[componentProps.element];
                        if (!Component) return null;
                        return (
                            <Component
                                key={`${componentProps.element}-${index}`}
                                data={ticket}
                                props={componentProps}
                            />
                        );
                    })}
                </View>

                {/* Perfuração inferior */}
                <TicketPerforation />

                <View style={{ marginTop: 24 }}>
                    <MainAsyncButton 
                        title="Compartilhar" 
                        onPress={() => Share.share({ message: `Aqui está meu ticket de acesso: ${appointment?.ref || ''}` })} 
                    />
                </View>
            </ScrollView>
        </Animated.View>
    );
}

function TicketPerforation() {
    return (
        <View style={perfStyles.row}>
            <View style={perfStyles.dashedLine} />
        </View>
    );
}

// ============================================================================
// STYLES
// ============================================================================

const screenStyles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    pageHeader: {
        paddingBottom: 16,
        paddingTop: 8,
        alignItems: 'flex-start',
    },
    pageTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: THEME.slate600,
    },
    scroll: { 
        flex: 1,
        backgroundColor: '#ffffff',
    },
    scrollContent: {
        paddingBottom: 48,
        paddingHorizontal: 24,
    },
    topInfoContainer: {
        paddingTop: 16,
        paddingBottom: 8,
        backgroundColor: 'white',
    },
    bookingStrip: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    bookingLabel: {
        fontSize: 13,
        color: THEME.slate400,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    bookingId: {
        fontSize: 14,
        fontWeight: '700',
        color: THEME.slate500,
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        // justifyContent: 'center',
        // backgroundColor: '#F1F5F9',
        // paddingVertical: 10,
        marginBottom: 15, 
        borderRadius: 12,
    },
    displayTime: { 
        fontSize: 16, 
        fontWeight: '600', 
        color: THEME.slate600,
        marginLeft: 6,
    },
    heroSection: { 
        alignItems: 'flex-start', 
        paddingVertical: 20, 
        paddingTop: 8, 
        backgroundColor: 'white', 
        gap: 2, 
    },
    heroLabel: { 
        fontSize: 16, 
        color: THEME.slate400, 
        width: 110, 
        fontWeight: '500' 
    }, 
    h1Default: { 
        fontSize: 26, 
        fontWeight: '800', 
        color: THEME.slate900 
    },
    h2Default: { 
        fontSize: 20, 
        fontWeight: '500', 
        color: THEME.slate600 
    }, 
    ticketBody: {
        paddingVertical: 8,
        backgroundColor: '#ffffff',
    },
    layoutRef: {
        textAlign: 'center',
        marginTop: 24,
        fontSize: 11,
        color: THEME.slate400,
        fontWeight: '500',
        letterSpacing: 0.4,
    },
    empty: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        gap: 12,
        backgroundColor: '#ffffff',
    },
    emptyIconWrapper: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F8FAFC',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: THEME.slate900,
    },
    emptySubtitle: {
        fontSize: 14,
        color: THEME.slate400,
        textAlign: 'center',
        lineHeight: 20,
    },
});

const heroStyles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 24,
        gap: 12,
        borderRadius: 16,
        marginBottom: 8,
    },
    iconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.6)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusText: {
        fontSize: 20,
        fontWeight: '800',
        letterSpacing: 0.2,
    },
});

const perfStyles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 12,
    },
    dashedLine: {
        flex: 1,
        height: 1,
        borderTopWidth: 2,
        borderTopColor: '#d6d6d6ff',
        borderStyle: 'dashed',
    },
});

const elStyles = StyleSheet.create({
    dividerWrapper: { marginVertical: 18 },
    dividerLabeled: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    dividerLine: { height: 1, backgroundColor: '#E2E8F0', flex: 1 },
    dividerLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: THEME.slate400,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },

    fieldRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 6,
        marginVertical: 0,
    },
    fieldLabel: {
        fontSize: 16,
        color: THEME.slate400,
        fontWeight: '500',
        marginBottom: 2,
    },
    fieldValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#334155',
    },

    sectionWrapper: { marginTop: 18, marginBottom: 8 },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: THEME.slate900,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
    },

    tagContainer: { marginVertical: 12 },
    tagContainerLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: THEME.slate400,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 8,
    },
    tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        maxWidth: '100%',
    },
    tagText: { 
        fontSize: 12, 
        fontWeight: '700',
        flexShrink: 1,
    },

    attentionBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        borderRadius: 12,
        borderWidth: 1,
        padding: 14,
        marginVertical: 12,
    },
    attentionTitle: { fontSize: 14, fontWeight: '700', marginBottom: 3 },
    attentionText: { fontSize: 14, fontWeight: '500', lineHeight: 18 },

    instructionWrapper: { marginVertical: 12 },
    instructionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: THEME.slate400,
        marginBottom: 16,
        textAlign: 'center'
    },
    instructionStep: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    instructionBullet: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#475569',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    instructionBulletText: { fontSize: 12, fontWeight: '800', color: '#FFFFFF' },
    instructionStepText: {
        flex: 1,
        fontSize: 14,
        color: '#334155',
        lineHeight: 20,
        fontWeight: '500',
    },

    freeText: {
        color: THEME.slate600,
        lineHeight: 20,
        marginVertical: 12,
    },

highlightBox: {
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 16,
    alignItems: 'flex-start',
    flex: 1,
    minWidth: (width - 80) / 2,
    margin: 0,
},
highlightLabel: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
    opacity: 0.7,
},
highlightValue: {
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -0.5,
},
highlightCaption: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
    opacity: 0.7,
},
    gridWrapper: { marginVertical: 12 },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
});
