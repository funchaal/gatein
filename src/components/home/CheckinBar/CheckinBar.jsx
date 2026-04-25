import React from 'react';
import { View, Text, Pressable, Animated, Modal, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { styles } from './CheckinBar.styles';
import { useCheckinBar } from './useCheckinBar';

export default function CheckinBar() {
  const {
    activeTerminal,
    isCheckingIn,
    loadingMessageIndex,
    messages,
    fadeAnim,
    handleCheckin,
  } = useCheckinBar();

  if (!activeTerminal) return null;

  return (
    <>
      <View style={styles.container}>
        <Icon name="finger-print-outline" size={35} color="#555" />
        <View style={styles.textContainer}>
          <Text style={styles.bigText}>{activeTerminal.name}</Text>
          <Text style={styles.smallText}>Reconheça sua biometria</Text>
        </View>
        <Pressable 
          style={styles.button} 
          onPress={handleCheckin}
          disabled={isCheckingIn}
        >
          <Text style={styles.buttonText}>Check-In</Text>
          <Icon name="chevron-forward-outline" size={16} color="white" />
        </Pressable>
      </View>

      {isCheckingIn && (
        <Modal transparent visible={isCheckingIn} animationType="fade" statusBarTranslucent>
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#F97316" />
            <Animated.Text style={[styles.loadingText, { opacity: fadeAnim }]}>
              {messages[loadingMessageIndex]}
            </Animated.Text>
          </View>
        </Modal>
      )}
    </>
  );
}
