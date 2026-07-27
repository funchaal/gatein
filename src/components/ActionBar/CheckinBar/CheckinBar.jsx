import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { styles } from './CheckinBar.styles';
import { useCheckinBar } from './useCheckinBar';
import CompanyLogo from '../../common/CompanyLogo';

export default function CheckinBar() {
  const {
    activeTerminal,
    handleCheckin,
  } = useCheckinBar();

  if (!activeTerminal) return null;

  return (
    <View style={styles.container}>
      <CompanyLogo
        logoUrl={activeTerminal.logo_url}
        name={activeTerminal.name}
        size={36}
        style={{ marginRight: 10 }}
      />
      <View style={styles.textContainer}>
        <Text style={styles.bigText}>{activeTerminal.name}</Text>
        <Text style={styles.smallText}>Reconheça sua biometria</Text>
      </View>
      <Pressable 
        style={styles.button} 
        onPress={handleCheckin}
      >
        <Text style={styles.buttonText}>Check-In</Text>
        <Icon name="chevron-forward-outline" size={16} color="white" />
      </Pressable>
    </View>
  );
}
