export const STATUS_LABELS_PT_BR = {
    'ACTIVE': 'Agendado',
    'AGENDADO': 'Agendado',
    'CHECKED-IN': 'No Pátio',
    'CHECKED_IN': 'No Pátio',
    'NO PÁTIO': 'No Pátio',
    'ON_GOING': 'Em Andamento',
    'EM ANDAMENTO': 'Em Andamento',
    'PAUSED': 'Pausado',
    'PAUSADO': 'Pausado',
    'COMPLETED': 'Concluído',
    'CONCLUÍDO': 'Concluído',
    'FINALIZADO': 'Finalizado',
    'CANCELLED': 'Cancelado',
    'CANCELADO': 'Cancelado',
    'DEACTIVATED': 'Desativado',
    'DESATIVADO': 'Desativado',
    'OVERDUE': 'Atrasado',
    'EXPIRED': 'Atrasado',
    'ATRASADO': 'Atrasado',
    'PLANNED': 'Planejado',
};

export const translateStatus = (status) => {
    if (!status) return 'Desconhecido';
    const safeStatus = status.toString().toUpperCase();
    return STATUS_LABELS_PT_BR[safeStatus] || status;
};

export const getStatusColor = (status) => {
    const safeStatus = (status || '').toString().toUpperCase();
    switch (safeStatus) {
        case 'AGENDADO':
        case 'ACTIVE':
        case 'PLANNED':
            return '#3B82F6'; // Blue
        case 'EM ANDAMENTO':
        case 'ON_GOING':
        case 'NO PÁTIO':
        case 'CHECKED-IN':
        case 'CHECKED_IN':
        case 'PAUSED':
        case 'PAUSADO':
            return '#EAB308'; // Yellow/Orange
        case 'CONCLUÍDO':
        case 'COMPLETED':
        case 'FINALIZADO':
            return '#10B981'; // Emerald
        case 'EXPIRADO':
        case 'EXPIRED':
        case 'ATRASADO':
        case 'OVERDUE':
        case 'DEACTIVATED':
        case 'DESATIVADO':
        case 'CANCELLED':
        case 'CANCELADO':
            return '#EF4444'; // Red
        default:
            return '#64748B'; // Slate
    }
};

export const formatDate = (dateString) => {
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

export const getValue = (item, key) => {
    if (!item || typeof item !== 'object') return null;
    
    // Primeiro tenta em custom_data
    if (item.custom_data && item.custom_data[key] !== undefined && item.custom_data[key] !== null && item.custom_data[key] !== '') {
        const val = item.custom_data[key];
        return (val && typeof val === 'object') ? null : val;
    }
    
    // Depois tenta diretamente no item
    if (item[key] !== undefined && item[key] !== null && item[key] !== '') {
        const val = item[key];
        return (val && typeof val === 'object') ? null : val;
    }
    
    return null;
};

export const get = (item, key) => {
    if (!item || typeof item !== 'object') return null;
    if (Array.isArray(key)) {
        for (const k of key) {
            const value = getValue(item, k);
            if (value !== null) return value;
        }
        return null;
    }
    return getValue(item, key);
};

export const ALERT_COLORS = {
    purple: { bg: '#F3E8FF', border: '#A855F7', text: '#7C3AED' },
    blue: { bg: '#DBEAFE', border: '#3B82F6', text: '#2563EB' },
    green: { bg: '#D1FAE5', border: '#10B981', text: '#059669' },
    yellow: { bg: '#FEF3C7', border: '#F59E0B', text: '#D97706' },
    red: { bg: '#FEE2E2', border: '#EF4444', text: '#DC2626' },
    gray: { bg: '#F3F4F6', border: '#9CA3AF', text: '#6B7280' },
};

export const resolveStatusColor = (status, statusTags) => {
    if (statusTags && statusTags.length > 0) {
        const matchedTag = statusTags.find(t => t.value && t.value.toString().toLowerCase() === (status || '').toString().toLowerCase());
        if (matchedTag && ALERT_COLORS[matchedTag.color]) {
            return ALERT_COLORS[matchedTag.color].text;
        }
    }
    return getStatusColor(status);
};
