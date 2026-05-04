import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

const SecondaryButton = ({ onPress, title, style }) => {
  return (
    <Pressable onPress={onPress} style={[styles.button, style]}>
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 56, 
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary || '#DDD',
  },
  text: {
    color: COLORS.primary || '#333',
    fontWeight: 'bold',
    fontSize: 16,
  }
});

export default SecondaryButton;
