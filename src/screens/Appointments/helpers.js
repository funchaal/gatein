export const getCardConfig = (appointment, terminals) => {
  if (!terminals || terminals.length === 0) return null;

  const terminal = terminals.find(t => t.id === appointment.terminalId);
  if (!terminal) return null;

  const config = terminal.appointmentsConfig.find(c => c.type === appointment.type) 
                 || terminal.appointmentsConfig.find(c => c.type === 'DEFAULT')
                 || terminal.appointmentsConfig[0];
  
  return config;
};

export const getSections = (appointments) => {
  const ativos = appointments.filter(item => ['Agendado', 'Em Andamento', 'No Pátio'].includes(item.status));
  const historico = appointments.filter(item => !['Agendado', 'Em Andamento', 'No Pátio'].includes(item.status));

  return [
    { title: 'Ativos', data: ativos },
    { title: 'Histórico', data: historico }
  ];
};