// components/home/ActionButtons.jsx
import React from 'react';
import { View, Text, TouchableOpacity, ImageBackground, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const ACTIONS = [
  {
    id: 'appointments',
    title: 'Agendamentos',
    icon: 'calendar',
    action: (nav) => nav.navigate('Appointments'),
  },
  {
    id: 'trips',
    title: 'Viagens',
    icon: 'clock',
    action: (nav) => nav.navigate('Trips'),
  },
  {
    id: 'map',
    title: 'Mapa',
    icon: 'map-pin',
    isMap: true,
    action: (nav) => nav.navigate('Map'),
  },
];

function MapButton({ item }) {
  const navigation = useNavigation();
  return (
    <TouchableOpacity style={styles.actionBtn} onPress={() => item.action(navigation)}>
      <ImageBackground
        source={require('../../../../assets/images/mapa.png')}
        style={StyleSheet.absoluteFill}
        imageStyle={{ borderRadius: 16 }}
      >
        <LinearGradient
          colors={['rgba(26,26,46,0.55)', 'rgba(255,255,255,0.35)']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: 16 }]}
        />
      </ImageBackground>
      <View style={styles.mapIconWrap}>
        <Icon name={item.icon} size={22} color="#FFFFFF" />
      </View>
      <Text style={styles.mapLabel}>{item.title}</Text>
    </TouchableOpacity>
  );
}

function NormalButton({ item }) {
  const navigation = useNavigation();
  return (
    <TouchableOpacity style={[styles.actionBtn, styles.normalBtn]} onPress={() => item.action(navigation)}>
      <View style={styles.iconWrap}>
        <Icon name={item.icon} size={22} color="#F97316" />
      </View>
      <Text style={styles.normalLabel}>{item.title}</Text>
    </TouchableOpacity>
  );
}

export default function ActionButtons() {
  return (
    <View style={styles.grid}>
      {ACTIONS.map((item) =>
        item.isMap
          ? <MapButton key={item.id} item={item} />
          : <NormalButton key={item.id} item={item} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    gap: 7,
    paddingBottom: 18,
    backgroundColor: 'white',
  },
  actionBtn: {
    flex: 1,
    borderRadius: 16,
    flexDirection: 'column', 
    justifyContent: 'space-between',
    alignItems: 'flex-start', 
    paddingVertical: 14,
    padding: 15, 
    // alignItems: 'center',
    gap: 12,
    overflow: 'hidden',
    backgroundColor: '#1a1a2e', // fallback para o mapa
  },
  normalBtn: {
    backgroundColor: '#f5f5f5',
    // borderWidth: 1,
    // borderColor: '#eef0f5',
  },
  iconWrap: {
    // width: 40, height: 40,
    borderRadius: 12,
    // backgroundColor: '#fff3ec',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapIconWrap: {
    // width: 40, height: 40,
    borderRadius: 12,
    // backgroundColor: 'rgba(255,255,255,0.25)',
    // borderWidth: 1,
    // borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  normalLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#313131',
  },
  mapLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: 'white',
  },
});