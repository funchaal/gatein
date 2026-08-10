// components/home/ActionButtons.jsx
import React from 'react';
import { View, Text, TouchableOpacity, ImageBackground, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const ACTIONS = [
  {
    id: 'tickets',
    title: 'Tickets',
    icon: 'ticket-confirmation-outline',
    action: (nav) => nav.navigate('TicketsList'),
  },
  {
    id: 'submissions',
    title: 'Envios',
    icon: 'send',
    action: (nav) => nav.navigate('SubmissionsList'),
  },
  {
    id: 'services',
    title: 'Serviços',
    icon: 'grid',
    action: (nav) => nav.navigate('Services'),
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
    <TouchableOpacity style={styles.mapBtn} onPress={() => item.action(navigation)}>
      <ImageBackground
        source={require('../../../../assets/images/mapa.png')}
        style={StyleSheet.absoluteFill}
        imageStyle={{ borderRadius: 16 }}
      >
        <LinearGradient
          colors={['rgba(26,26,46,0.65)', 'rgba(26,26,46,0.35)']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={[StyleSheet.absoluteFill, { borderRadius: 16 }]}
        />
      </ImageBackground>
      <View style={styles.mapLeftContent}>
        <View style={styles.mapIconWrap}>
          <Icon name={item.icon} size={20} color="#FFFFFF" />
        </View>
        <Text style={styles.mapLabel}>{item.title}</Text>
      </View>
      <Icon name="chevron-right" size={20} color="rgba(255,255,255,0.8)" />
    </TouchableOpacity>
  );
}

function NormalButton({ item }) {
  const navigation = useNavigation();
  return (
    <TouchableOpacity style={styles.normalBtn} onPress={() => item.action(navigation)}>
      <View style={styles.iconWrap}>
        {item.id === 'tickets' ? (
          <IconMC name={item.icon} size={22} color="#F97316" />
        ) : (
          <Icon name={item.icon} size={22} color="#F97316" />
        )}
      </View>
      <Text style={styles.normalLabel}>{item.title}</Text>
    </TouchableOpacity>
  );
}

export default function ActionButtons() {
  const topRowActions = ACTIONS.filter((item) => !item.isMap);
  const mapAction = ACTIONS.find((item) => item.isMap);

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        {topRowActions.map((item) => (
          <NormalButton key={item.id} item={item} />
        ))}
      </View>
      {mapAction && <MapButton item={mapAction} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    paddingBottom: 8,
    gap: 10,
    backgroundColor: 'white',
  },
  topRow: {
    flexDirection: 'row',
    gap: 8,
  },
  normalBtn: {
    flex: 1,
    height: 86,
    borderRadius: 16,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 14,
    backgroundColor: '#f5f5f5',
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapLeftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mapBtn: {
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    overflow: 'hidden',
    backgroundColor: '#1a1a2e',
  },
  mapIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  normalLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#313131',
  },
  mapLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: 'white',
  },
});
