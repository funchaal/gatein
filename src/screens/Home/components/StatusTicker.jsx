// components/home/StatusTicker.jsx
import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Easing } from 'react-native';

const STATUS_ITEMS = [
  { id: '1', text: 'Terminal Macaé: operando normalmente', type: 'ok' },
  { id: '2', text: 'Terminal Rio das Ostras: manutenção prevista 14h–16h', type: 'warn' },
  { id: '3', text: 'Terminal Campos: aguardando liberação de carga', type: 'info' },
  { id: '4', text: 'Alerta: tráfego intenso na RJ-168 km 42', type: 'alert' },
];

export default function StatusTicker() {
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(translateX, {
        toValue: -600, // ajuste conforme o conteúdo total
        duration: 18000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [translateX]);

  const content = [...STATUS_ITEMS, ...STATUS_ITEMS]; // duplica para loop seamless

  return (
    <View style={styles.container}>
      <View style={styles.dot} />
      <View style={styles.overflow}>
        <Animated.View style={[styles.track, { transform: [{ translateX }] }]}>
          {content.map((item, i) => (
            <React.Fragment key={`${item.id}-${i}`}>
              <Text style={styles.text}>{item.text}</Text>
              <Text style={styles.sep}>  ●  </Text>
            </React.Fragment>
          ))}
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 40,
    backgroundColor: '#1a1a2e',
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    borderRadius: 25,           // bordas arredondadas
    marginTop: 12,              // respiro acima
    marginBottom: 4,            // respiro abaixo
  },
  dot: {
    width: 6, height: 6,
    borderRadius: 3,
    backgroundColor: '#22c55e',
    marginLeft: 12,
    flexShrink: 0,
  },
  overflow: {
    flex: 1,
    overflow: 'hidden',
    marginLeft: 8,
  },
  track: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontSize: 11,
    color: '#cbd5e1',
    fontWeight: '500',
    whiteSpace: 'nowrap',
  },
  sep: {
    fontSize: 11,
    color: '#F97316',
  },
});
