import React from 'react';
import { FlatList, Text, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';

// Seletores de Agendamentos (Agora simplificados para o mock)
import { 
  selectActiveAppointments, 
  selectHistoryAppointments
} from '../../store/slices/appointmentsSlice';

// Importar seletor de Terminais para pegar as configurações
import { selectAllTerminals } from '../../store/slices/terminalsSlice';

import AppointmentCard from './AppointmentCard';

export default function AppointmentList({ type = 'active', ListHeaderComponent }) {
  // 1. Dados dos Agendamentos (Filtrados por tipo usando os seletores do slice mockado)
  const data = useSelector(state => 
    type === 'active' ? selectActiveAppointments(state) : selectHistoryAppointments(state)
  );
  
  // 2. Dados dos Terminais (Para buscar a config visual)
  const terminals = useSelector(selectAllTerminals);

  // Lógica Auxiliar: Encontra a configuração visual correta para um agendamento específico
  const getCardConfig = (appointment) => {
    if (!terminals || terminals.length === 0) return null;

    // Acha o terminal pelo ID
    const terminal = terminals.find(t => t.id === appointment.terminalId);
    if (!terminal) return null;

    // Dentro do terminal, acha a config pelo tipo de carga (ex: CONTAINER_LOAD)
    // Se não achar o tipo específico, usa o primeiro (fallback)
    const config = terminal.appointmentsConfig.find(c => c.type === appointment.type) 
                   || terminal.appointmentsConfig.find(c => c.type === 'DEFAULT')
                   || terminal.appointmentsConfig[0];
    
    return config;
  };

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => {
        // Para cada item, calculamos a configuração visual antes de renderizar
        const config = getCardConfig(item);
        
        return (
          <AppointmentCard 
            item={item} 
            config={config} // Passamos a config para o Card saber o que desenhar
          />
        );
      }}
      contentContainerStyle={{ paddingBottom: 20 }}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={
        <Text style={styles.emptyText}>
          {type === 'active' ? 'Nenhum agendamento ativo.' : 'Histórico vazio.'}
        </Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  emptyText: { textAlign: 'center', color: '#64748B', marginTop: 20 }
});