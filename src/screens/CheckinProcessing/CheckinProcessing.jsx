import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useCheckinRequestMutation } from '../../services/api';
import { styles } from './CheckinProcessing.styles';

const MESSAGES = [
  "Conectando ao terminal...",
  "Consolidando informações...",
  "Gerando tickets...",
  "Aguarde só mais um pouco...",
  "Só mais um momento..."
];

export default function CheckinProcessing() {
  const navigation = useNavigation();
  const route = useRoute();
  const activeTerminalId = route.params?.terminal_id;

  const [checkinRequest] = useCheckinRequestMutation();
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(-1);
  const [displayedMessage, setDisplayedMessage] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(15)).current;

  // Start sliding up the first text after a small delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingMessageIndex(0);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  // Cycle messages
  useEffect(() => {
    if (loadingMessageIndex === -1) return;

    const interval = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev < MESSAGES.length - 1 ? prev + 1 : prev));
    }, 3000);

    return () => clearInterval(interval);
  }, [loadingMessageIndex]);

  // Text transition: slide up and fade out, then slide up from below and fade in
  useEffect(() => {
    if (loadingMessageIndex === -1) return;

    if (loadingMessageIndex === 0) {
      setDisplayedMessage(MESSAGES[0]);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -15,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setDisplayedMessage(MESSAGES[loadingMessageIndex]);
      slideAnim.setValue(15);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [loadingMessageIndex, fadeAnim, slideAnim]);

  useEffect(() => {
    const doCheckin = async () => {
      if (!activeTerminalId) {
        navigation.goBack();
        return;
      }
      try {
        const response = await checkinRequest(activeTerminalId).unwrap();
        // Replace current screen so we don't go back to 'Processing' from 'Success'
        navigation.replace('CheckinSuccess', { data: response });
      } catch (err) {
        console.error(err);
        navigation.replace('CheckinFail');
      }
    };

    const timeout = setTimeout(() => {
      doCheckin();
    }, 1500); // Give enough time for the user to see the processing screen

    return () => clearTimeout(timeout);
  }, [activeTerminalId, checkinRequest, navigation]);

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Processando{'\n'}Check-in</Text>
          <View style={styles.messageContainer}>
            <Animated.Text style={[styles.subtitle, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
              {displayedMessage}
            </Animated.Text>
          </View>
        </View>
      </View>
    </ScreenWrapper>
  );
}
