export const cleanTaxIdString = (cpf) => {
    return cpf.replace(/\D/g, '');
};

export const getInitialCpf = (routeTaxId, savedTaxId) => {
    return routeTaxId || savedTaxId || '';
};

export const getInitialStep = (initialCpf) => {
    return initialCpf ? 'password' : 'cpf';
};
