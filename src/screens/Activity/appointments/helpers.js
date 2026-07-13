export const getCardConfig = (appointment, terminals) => {
  if (!terminals || terminals.length === 0) return null;

  const terminal = terminals.find(t => t.id === appointment.terminal_id);
  if (!terminal) return null;

  const config = terminal.appointments_layouts.find(c => c.type === appointment.type)
    || terminal.appointments_layouts.find(c => c.type === 'DEFAULT')
    || terminal.appointments_layouts[0];

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
