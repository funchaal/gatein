import React, { useEffect } from "react";
import { StyleSheet, View, Text, SectionList, SafeAreaView, Platform, StatusBar } from "react-native";
import { useSelector, useDispatch } from 'react-redux';
import { fetchAppointmentsData, selectAllAppointments } from '../store/slices/appointmentsSlice';
import { selectAllTerminals } from '../store/slices/terminalsSlice'; // Importar seletor de terminais
import AppointmentCard from "../components/appointments/AppointmentCard"; // Reutilizando

export default function AppointmentsScreen() {
  const dispatch = useDispatch();
  const appointments = useSelector(selectAllAppointments);
  const terminals = useSelector(selectAllTerminals); // Pegar dados dos terminais

  useEffect(() => {
    // Se temos agendamentos, mas não temos terminais (inconsistência de estado)
    if (appointments.length > 0 && terminals.length === 0) {
      // Dispara a busca de dados para garantir que tudo seja carregado
      dispatch(fetchAppointmentsData());
    }
  }, [appointments, terminals, dispatch]);

  // Lógica para encontrar a configuração correta (reutilizada de AppointmentsList)
  const getCardConfig = (appointment) => {
    if (!terminals || terminals.length === 0) return null;

    const terminal = terminals.find(t => t.id === appointment.terminalId);
    if (!terminal) return null;

    const config = terminal.appointmentsConfig.find(c => c.type === appointment.type) 
                   || terminal.appointmentsConfig.find(c => c.type === 'DEFAULT')
                   || terminal.appointmentsConfig[0];
    
    return config;
  };

  // Separa os agendamentos em ativos e inativos
  const ativos = appointments.filter(item => ['Agendado', 'Em Andamento', 'No Pátio'].includes(item.status));
  const historico = appointments.filter(item => !['Agendado', 'Em Andamento', 'No Pátio'].includes(item.status));

  const sections = [
    { title: 'Ativos', data: ativos },
    { title: 'Histórico', data: historico }
  ];

  return (
    <SafeAreaView style={styles.container}>
        <SectionList
            sections={sections}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => {
                const config = getCardConfig(item); // Calcula a config para o item
                return <AppointmentCard item={item} config={config} />; // Passa a config para o card
            }}
            renderSectionHeader={({ section: { title } }) => (
                <Text style={styles.sectionTitle}>{title}</Text>
            )}
            contentContainerStyle={styles.listContent}
        />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffffff', // Cor de fundo mais suave
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  listContent: {
    paddingBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    paddingHorizontal: 15,
    marginTop: 20,
    marginBottom: 10,
  }
});
