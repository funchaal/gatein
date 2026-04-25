import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';

import { startChatWithTerminal } from '../../store/slices/chatSlice';
import { selectActiveAppointments } from '../../store/slices/appointmentsSlice';
import { selectAllTerminals } from '../../store/slices/terminalsSlice';

export default function ChatEmptyState() {
  const dispatch = useDispatch();
  const appointments = useSelector(selectActiveAppointments);
  const terminals = useSelector(selectAllTerminals);

  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (!appointments?.length || !terminals?.length) return;

    const terminalIds = new Set(
      appointments.map(app => app.terminalId)
    );

    const relatedTerminals = terminals.filter(t =>
      terminalIds.has(t.id)
    );

    setSuggestions(relatedTerminals);
  }, [appointments, terminals]);

  const handleStart = (terminal) => {
    dispatch(startChatWithTerminal({
      terminalId: terminal.id,
      terminalName: terminal.name
    }));
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Icon name="chatbubbles-outline" size={64} color="#CBD5E1" />
      </View>

      <Text style={styles.title}>Nenhuma conversa ainda</Text>
      <Text style={styles.subtitle}>
        Precisa de ajuda com algum terminal? Inicie uma conversa abaixo:
      </Text>

      <View style={styles.list}>
        {suggestions.map(item => (
          <Pressable
            key={item.id}
            style={styles.card}
            onPress={() => handleStart(item)}
          >
            <View style={styles.avatar}>
              <Text style={styles.initials}>
                {(item.name || '').substring(0, 1)}
              </Text>
            </View>

            <Text style={styles.name}>{item.name}</Text>
            <Icon name="chevron-forward" size={20} color="#CBD5E1" />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: 'white' },
    iconContainer: { marginBottom: 16 },
    title: { fontSize: 20, fontWeight: 'bold', color: '#0F172A', marginBottom: 8 },
    subtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 32 },
    list: { width: '100%' },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0'
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#DBEAFE',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12
    },
    initials: { color: '#1D4ED8', fontWeight: 'bold', fontSize: 16 },
    name: { flex: 1, fontWeight: '600', color: '#334155' }
});