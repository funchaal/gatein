export const getStatusColor = (status) => {
    const safeStatus = (status || '').toString().toUpperCase();
    switch (safeStatus) {
        case 'AGENDADO':
        case 'SCHEDULED':
            return '#3B82F6'; // Blue
        case 'EM ANDAMENTO':
        case 'IN_PROGRESS':
        case 'NO PÁTIO':
        case 'CHECKED_IN':
            return '#EAB308'; // Yellow/Orange
        case 'CONCLUÍDO':
        case 'COMPLETED':
        case 'FINALIZADO':
            return '#10B981'; // Emerald
        case 'EXPIRADO':
        case 'EXPIRED':
        case 'ATRASADO':
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
