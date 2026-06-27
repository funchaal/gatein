import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';

export default function HomeTopBar() {
  const navigation = useNavigation();

  return (
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
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: 'white',
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
});
