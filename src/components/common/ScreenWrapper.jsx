import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';

export default function ScreenWrapper({
  children,
  style,
  edges = ['top', 'left', 'right'],
  noPadding = false,
}) {
  return (
    <SafeAreaView style={[styles.safe, style]} edges={edges}>
      <View style={[styles.container, noPadding && styles.noPadding]}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background || '#fff',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  noPadding: {
    paddingHorizontal: 0,
  },
});
