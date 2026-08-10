import { get } from '../../components/appointments/AppointmentCard/utils';

export const formatDate = (dateString, showYear = false) => {
  if (!dateString) return '';
  
  try {
    const isoString = typeof dateString === 'string' ? dateString.replace(' ', 'T') : dateString;
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return String(dateString);
    
    const options = {
      day: '2-digit',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    };

    if (showYear) {
      options.year = 'numeric';
    } else {
      options.weekday = 'long';
    }

    return new Intl.DateTimeFormat('pt-BR', options).format(date);
  } catch (e) {
    return String(dateString);
  }
};


export const getFieldValue = (data, field) => {
    if (!field) return null;
    let val = data[field];
    if (val === undefined) {
        val = get(data, Array.isArray(field) ? field : [field]);
    }
    return (val && typeof val === 'object') ? null : val;
};

export const capitalizeFirst = (str) => {
    if (!str || typeof str !== 'string') return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
};

export const capitalizeWords = (str) => {
    if (!str || typeof str !== 'string') return str;
    return str.replace(/\b\w/g, l => l.toUpperCase());
};
