

export const capitalize = (text) => {
  if (typeof text !== 'string') return '';
  return text
    .trim()
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const normalizeSearchText = (text) => {
  if (!text) return '';
  return text
    .normalize('NFD') // Separa os caracteres dos acentos
    .replace(/[\u0300-\u036f]/g, '') // Remove os acentos e troca ç por c
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove pontuações, traços, etc., mantendo letras, números e espaços
    .replace(/\s+/g, ' ') // Substitui múltiplos espaços por um só
    .trim();
};

export const isPlaceholderUrl = (url) => {
    if (!url) return true;
    const lower = url.toLowerCase();
    return (
        lower.includes('seusite.com') || 
        lower.includes('example.com') || 
        lower.includes('seuservidor.com') ||
        lower.includes('placeholder') ||
        lower.includes('placehold')
    );
};