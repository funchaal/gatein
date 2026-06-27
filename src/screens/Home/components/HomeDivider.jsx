import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function HomeDivider() {
  return (
    <View style={styles.dividerWrap}>
      <View style={styles.divider} />
    </View>
  );
}

const styles = StyleSheet.create({
  dividerWrap: {
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  divider: {
    width: 48,
    height: 3,
    backgroundColor: '#e8eaf0',
    borderRadius: 99,
  },
});
