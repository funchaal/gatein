export const STATUS_LABELS_PT_BR = {
    'ACTIVE': 'Agendado',
    'AGENDADO': 'Agendado',
    'CHECKED-IN': 'Checkin feito',
    'CHECKED_IN': 'Checkin feito',
    'CHECKIN FEITO': 'Checkin feito',
    'NO PÁTIO': 'Checkin feito',
    'ON_GOING': 'Em Andamento',
    'ONGOING': 'Em Andamento',
    'EM ANDAMENTO': 'Em Andamento',
    'PAUSED': 'Pausado',
    'PAUSADO': 'Pausado',
    'COMPLETED': 'Concluído',
    'CONCLUÍDO': 'Concluído',
    'FINALIZADO': 'Concluído',
    'CANCELLED': 'Cancelado',
    'CANCELADO': 'Cancelado',
    'DEACTIVATED': 'Desativado',
    'DESATIVADO': 'Desativado',
    'OVERDUE': 'Atrasado',
    'EXPIRED': 'Atrasado',
    'ATRASADO': 'Atrasado',
    'PLANNED': 'Planejado',
};

export const translateStatus = (status, countdownPhase = null) => {
    if (!status) return 'Desconhecido';
    const safeStatus = status.toString().toUpperCase();
    if ((safeStatus === 'ACTIVE' || safeStatus === 'AGENDADO') && countdownPhase === 'window') {
        return 'Janela Aberta';
    }
    return STATUS_LABELS_PT_BR[safeStatus] || status;
};

export const getStatusDisplay = (status, countdownPhase = null, statusTagsConfig = null) => {
    if (!status) return { text: 'DESCONHECIDO', color: '#64748B', bg: '#F1F5F9' };
    const safeStatus = status.toString().toUpperCase();

    // Regra: se for ACTIVE/AGENDADO e estiver dentro da janela -> "JANELA ABERTA" (mantendo a cor original do status)
    const isWindowOpen = (safeStatus === 'ACTIVE' || safeStatus === 'AGENDADO') && countdownPhase === 'window';
    const text = isWindowOpen ? 'JANELA ABERTA' : (STATUS_LABELS_PT_BR[safeStatus] || status).toUpperCase();

    // Se houver configuração de tag customizada
    const customColor = resolveStatusColor(status, statusTagsConfig);
    if (customColor && customColor !== getStatusColor(safeStatus)) {
        return { text, color: customColor, bg: customColor + '20' };
    }

    // Cores padrão refinadas por categoria de status
    if (safeStatus === 'ACTIVE' || safeStatus === 'AGENDADO' || safeStatus === 'PLANNED') {
        return { text, color: '#2563eb', bg: '#dbeafe' };
    }
    if (safeStatus === 'COMPLETED' || safeStatus === 'CONCLUÍDO' || safeStatus === 'FINALIZADO') {
        return { text, color: '#059669', bg: '#d1fae5' };
    }
    if (safeStatus === 'DEACTIVATED' || safeStatus === 'DESATIVADO' || safeStatus === 'CANCELLED' || safeStatus === 'CANCELADO' || safeStatus === 'OVERDUE' || safeStatus === 'EXPIRED' || safeStatus === 'ATRASADO') {
        return { text, color: '#b91c1c', bg: '#fee2e2' };
    }
    if (safeStatus === 'CHECKED-IN' || safeStatus === 'CHECKED_IN' || safeStatus === 'NO PÁTIO' || safeStatus === 'ON_GOING' || safeStatus === 'EM ANDAMENTO' || safeStatus === 'PAUSED' || safeStatus === 'PAUSADO') {
        return { text, color: '#d97706', bg: '#fef3c7' };
    }

    const fallbackColor = getStatusColor(safeStatus);
    return { text, color: fallbackColor, bg: fallbackColor + '20' };
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
        const isoString = typeof dateString === 'string' ? dateString.replace(' ', 'T') : dateString;
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return String(dateString);
        return new Intl.DateTimeFormat('pt-BR', { 
            day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' 
        }).format(date);
    } catch (e) {
        return String(dateString);
    }
};

export const getValue = (item, key) => {
    if (!item || typeof item !== 'object') return null;
    
    // Primeiro tenta em custom_data
    if (item.custom_data && item.custom_data[key] !== undefined && item.custom_data[key] !== null && item.custom_data[key] !== '') {
        const val = item.custom_data[key];
        if (val && typeof val !== 'object') return val;
    }
    
    // Depois tenta diretamente no item
    if (item[key] !== undefined && item[key] !== null && item[key] !== '') {
        const val = item[key];
        if (val && typeof val !== 'object') return val;
    }

    // Suporte a campos de origem/destino de viagens
    if (key === 'origin_city') {
        const val = item.from || item.origin_city || (typeof item.origin === 'object' ? item.origin?.city : item.origin) || item.custom_data?.origin_city;
        if (val && typeof val === 'string') return val;
    }
    if (key === 'destination_city') {
        const val = item.to || item.destination_city || (typeof item.destiny === 'object' ? item.destiny?.city : item.destiny) || item.custom_data?.destination_city;
        if (val && typeof val === 'string') return val;
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
