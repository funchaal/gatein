import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAppointmentsData, selectAllAppointments } from '../../store/slices/appointmentsSlice';
import { selectAllTerminals } from '../../store/slices/terminalsSlice';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

const StateGate = ({ children }) => {
  const dispatch = useDispatch();
  const appointments = useSelector(selectAllAppointments);
  const terminals = useSelector(selectAllTerminals);
  
  const [isSyncing, setIsSyncing] = useState(true);

  useEffect(() => {
    const checkDataConsistency = async () => {
      // Condição de inconsistência: agendamentos persistidos, mas terminais não.
      if (appointments.length > 0 && terminals.length === 0) {
        setIsSyncing(true);
        try {
          await dispatch(fetchAppointmentsData()).unwrap();
        } catch (error) {
          console.error("Failed to sync data on startup:", error);
          // Opcional: Tratar o erro, talvez limpando o estado.
        } finally {
          setIsSyncing(false);
        }
      } else {
        setIsSyncing(false);
      }
    };

    checkDataConsistency();
  }, [dispatch]); // Executa apenas uma vez na montagem

  if (isSyncing) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return children;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default StateGate;
