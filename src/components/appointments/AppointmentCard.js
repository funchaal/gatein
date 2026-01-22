import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useDispatch } from 'react-redux';
import { selectAppointment } from '../../store/slices/appointmentsSlice';

// Cores do Tema "Gate In" (Slate & Orange)
const THEME = {
    slate900: '#0F172A', // Texto Principal / Placa
    slate600: '#475569', // Texto Secundário / Data
    slate400: '#94A3B8', // Labels / Ícones / ID
    slate100: '#F1F5F9', // Fundo de detalhes / Hover
    border:   '#E2E8F0', // Borda sutil
    white:    '#FFFFFF',
};

// Cores dos Status
const getStatusColor = (status) => {
    switch (status) {
        case 'Agendado':
        case 'SCHEDULED':
            return '#3B82F6'; // Blue
        case 'Em Andamento':
        case 'IN_PROGRESS':
        case 'No Pátio':
        case 'CHECKED_IN':
            return '#EAB308'; // Yellow/Orange
        case 'Concluído':
        case 'COMPLETED':
        case 'Finalizado':
            return '#10B981'; // Emerald
        case 'Expirado':
        case 'EXPIRED':
        case 'Atrasado':
            return '#EF4444'; // Red
        default:
            return '#64748B'; // Slate
    }
};

// Helper para formatar data (ex: "2024-10-21 14:00" -> "21/10 às 14:00")
const formatDate = (dateString) => {
    if (!dateString) return '--/--';
    try {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('pt-BR', { 
            day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' 
        }).format(date);
    } catch (e) {
        return dateString; // Retorna original se falhar
    }
};

export default function AppointmentCard({ item, config }) {
    const dispatch = useDispatch();

    const handlePress = () => {
        dispatch(selectAppointment({ appointment: item, config }));
    };

    // Helper para buscar valor em item.custom_data ou diretamente em item
    const getValue = (key) => {
        if (!item || typeof item !== 'object') return null;
        
        // Primeiro tenta em custom_data
        if (item.custom_data && item.custom_data[key] !== undefined && item.custom_data[key] !== null && item.custom_data[key] !== '') {
            return item.custom_data[key];
        }
        
        // Depois tenta diretamente no item
        if (item[key] !== undefined && item[key] !== null && item[key] !== '') {
            return item[key];
        }
        
        return null;
    };

    // Helper para buscar valor com fallback em múltiplas chaves (compatibilidade com estrutura antiga)
    const get = (key) => {
        if (!item || typeof item !== 'object') return null;
        if (Array.isArray(key)) {
            for (const k of key) {
                const value = getValue(k);
                if (value !== null) return value;
            }
            return null;
        }
        return getValue(key);
    };

    const status = get(['status', 'Status']) || 'Desconhecido';
    const statusBaseColor = getStatusColor(status);
    const displayTime = formatDate(get(['schedule_start_time', 'Start_Time', 'start_time', 'scheduled_time']));
    const displayId = get(['booking_number', 'Appt', 'id', 'booking']);

    // Verifica se usa nova estrutura (card_layout) ou antiga (main)
    const useNewLayout = config?.card_layout !== undefined;

    // Renderiza campos da NOVA estrutura (card_layout)
    const renderNewLayout = () => {
        const { header, sub_header, body_rows } = config.card_layout;

        // Header (título principal)
        const headerValue = header?.key ? getValue(header.key) : null;
        
        // Sub-header
        const subHeaderValue = sub_header?.key ? getValue(sub_header.key) : null;

        return (
            <>
                <View style={styles.mainRow}>
                    <View style={styles.mainContent}>
                        {/* Header */}
                        {headerValue && (
                            <View>
                                {header.label && <Text style={styles.fieldLabel}>{header.label}</Text>}
                                <Text style={styles.h1Default}>{headerValue}</Text>
                            </View>
                        )}

                        {/* Sub-header */}
                        {subHeaderValue && (
                            <View style={{ marginTop: 4 }}>
                                {sub_header.label && <Text style={styles.fieldLabel}>{sub_header.label}</Text>}
                                <Text style={styles.h2Default}>{subHeaderValue}</Text>
                            </View>
                        )}
                    </View>
                    
                    <View style={[styles.badge, { backgroundColor: statusBaseColor + '20' }]}>
                        <Text style={[styles.badgeText, { color: statusBaseColor }]}>{status}</Text>
                    </View>
                </View>

                {/* Body rows */}
                {body_rows && body_rows.length > 0 && (
                    <View style={styles.footerContainer}>
                        {body_rows.map((row, index) => {
                            const value = row.key ? getValue(row.key) : null;
                            if (!value) return null;

                            return (
                                <View key={`${row.key}-${index}`} style={styles.infoRow}>
                                    {row.label && <Text style={styles.infoLabel}>{row.label}</Text>}
                                    <Text style={styles.infoValue}>{value}</Text>
                                </View>
                            );
                        })}
                    </View>
                )}
            </>
        );
    };

    // Renderiza campos da estrutura ANTIGA (main.h1, main.h2, main.details)
    const renderField = (fieldConfig, defaultStyle) => {
        if (!fieldConfig || !fieldConfig.key) return null;

        const value = get(fieldConfig.key);
        if (value === null || value === undefined) return null;

        const textStyle = {
            ...defaultStyle,
            fontSize: parseInt(fieldConfig.style?.fontSize || defaultStyle.fontSize || 16, 10),
            fontWeight: fieldConfig.style?.fontWeight || defaultStyle.fontWeight || 'normal',
            color: fieldConfig.style?.color || defaultStyle.color || THEME.slate900,
        };

        return (
            <View 
                key={fieldConfig.key} 
                style={{ 
                    alignItems: fieldConfig.position === 'above' ? 'flex-start' : 'baseline', 
                    flexDirection: fieldConfig.position === 'inline' ? 'row' : 'column', 
                    gap: fieldConfig.position === 'inline' ? 4 : 0 
                }}
            >
                {fieldConfig.showLabel && <Text style={[styles.infoLabel, { width: 'auto' }]}>{fieldConfig.label}</Text>}
                <Text style={textStyle}>{value}</Text>
            </View>
        );
    };

    const renderOldLayout = () => {
        return (
            <>
                <View style={styles.mainRow}>
                    <View style={styles.mainContent}>
                        {/* Renderiza H1 e H2 a partir da estrutura antiga */}
                        {config?.main?.h1 && renderField(config.main.h1, styles.h1Default)}
                        {config?.main?.h2 && renderField(config.main.h2, styles.h2Default)}
                    </View>
                    
                    <View style={[styles.badge, { backgroundColor: statusBaseColor + '20' }]}>
                        <Text style={[styles.badgeText, { color: statusBaseColor }]}>{status}</Text>
                    </View>
                </View>

                {/* Renderiza os detalhes do card a partir de `main.details` */}
                {config?.main?.details && config.main.details.length > 0 && (
                    <View style={styles.footerContainer}>
                        {config.main.details.map(detailConfig => renderField(detailConfig, styles.infoValue))}
                    </View>
                )}
            </>
        );
    };

    return (
        <Pressable 
            style={({ pressed }) => [ styles.card, pressed && styles.cardPressed ]} 
            onPress={handlePress}
        >
            <View style={styles.headerRow}>
                <Text style={styles.dateText}>{displayTime}</Text>
                <Text style={styles.idText}>#{displayId}</Text>
            </View>

            {/* Renderiza layout novo ou antigo baseado na estrutura do config */}
            {useNewLayout ? renderNewLayout() : renderOldLayout()}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: THEME.white,
        borderRadius: 20,
        padding: 16,
        marginBottom: 12,
        marginHorizontal: 16, 
        borderWidth: 1,
        borderColor: THEME.border,
    },
    cardPressed: {
        backgroundColor: '#F8FAFC',
        borderColor: '#CBD5E1',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    dateText: {
        fontSize: 14,
        fontWeight: '700',
        color: THEME.slate600,
        letterSpacing: 0.2,
    },
    idText: {
        fontSize: 14,
        fontWeight: '500',
        color: THEME.slate400,
    },
    mainRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    mainContent: {
        marginTop: 12, 
        flex: 1,
        gap: 2,
    },
    h1Default: {
        fontSize: 26,
        fontWeight: '800',
        color: THEME.slate900,
    },
    h2Default: {
        fontSize: 20,
        fontWeight: '500',
        color: THEME.slate600,
    },
    fieldLabel: {
        fontSize: 14,
        color: THEME.slate400,
        fontWeight: '500',
        marginBottom: 2,
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        marginLeft: 12,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    footerContainer: {
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        paddingTop: 12,
        gap: 4,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 2,
    },
    infoLabel: {
        fontSize: 14,
        color: THEME.slate400,
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 14,
        color: THEME.slate900,
        fontWeight: '600'
    }
});