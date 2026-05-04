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
        return item.custom_data[key];
    }
    
    // Depois tenta diretamente no item
    if (item[key] !== undefined && item[key] !== null && item[key] !== '') {
        return item[key];
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
