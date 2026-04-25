import React, { useEffect } from "react";
import { View, SectionList, SafeAreaView } from "react-native";
import { useSelector, useDispatch } from 'react-redux';
import { selectAllAppointments } from '../../store/slices/appointmentsSlice';
import { selectAllTerminals } from '../../store/slices/terminalsSlice';
import AppointmentCard from "../../components/appointments/AppointmentCard";
import { api } from '../../services/api';

import { styles } from './Appointments.styles';
import { getCardConfig, getSections } from './helpers';
import SectionHeader from './components/SectionHeader';

export default function AppointmentsScreen() {
  const dispatch = useDispatch();
  const appointments = useSelector(selectAllAppointments);
  const terminals = useSelector(selectAllTerminals);

  useEffect(() => {
    // Se temos agendamentos, mas não temos terminais (inconsistência de estado)
    if (appointments.length > 0 && terminals.length === 0) {
      // Dispara a busca de dados para garantir que tudo seja carregado
      dispatch(api.endpoints.fetchAppointmentsData.initiate());
    }
  }, [appointments, terminals, dispatch]);

  const sections = getSections(appointments);

  return (
    <SafeAreaView style={styles.container}>
        <SectionList
            sections={sections}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => {
                const config = getCardConfig(item, terminals);
                return <AppointmentCard item={item} config={config} />;
            }}
            renderSectionHeader={({ section: { title } }) => (
                <SectionHeader title={title} />
            )}
            contentContainerStyle={styles.listContent}
        />
    </SafeAreaView>
  );
}