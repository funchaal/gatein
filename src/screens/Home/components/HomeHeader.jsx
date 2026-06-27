// HomeHeader.jsx (atualizado)
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import StatusTicker from './StatusTicker';
import ActionButtons from './ActionButtons';

export default function HomeHeader() {
  const navigation = useNavigation();

  return (
    <View style={styles.wrapper}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.greeting}>Olá, </Text>
          <Text style={styles.driverName}>Rafael Funchal</Text>
        </View>
        <View style={styles.icons}>
          <Pressable style={styles.iconBtn} onPress={() => navigation.navigate('Alerts')}>
            <Icon name="bell" size={20} color="#F97316" />
          </Pressable>
        </View>
      </View>

      {/* Status ticker */}
      <StatusTicker />

      {/* Divider */}
      <View style={styles.dividerWrap}>
        <View style={styles.divider} />
      </View>

      {/* Action buttons */}
      <ActionButtons />

      {/* Section title */}
      <Text style={styles.sectionTitle}>Próximos agendamentos</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { backgroundColor: 'white' },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  greeting: { fontSize: 13, color: '#888', fontWeight: '400' },
  driverName: { fontSize: 17, fontWeight: '700', color: '#1a1a2e', letterSpacing: -0.3 },
  icons: { 
    flexDirection: 'row', 
    gap: 10,
    alignItems: 'center' 
  },
  iconBtn: { 
    width: 40, 
    height: 40, 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center', 
  },
  dividerWrap: {
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  divider: {
    width: 48, height: 3,
    backgroundColor: '#e8eaf0',
    borderRadius: 99,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a2e',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
  },
});
