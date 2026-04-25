import { useState, useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCheckinRequestMutation } from '../../../services/api';
import { useActiveTerminal } from './useActiveTerminal';

const MESSAGES = [
  "conectando ao terminal...",
  "consolidando informações...",
  "gerando tickets...",
  "aguarde só mais um pouco....",
  "só mais um momento..."
];

export const useCheckinBar = () => {
  const navigation = useNavigation();
  const activeTerminal = useActiveTerminal();

  // 👇 Pegamos o isLoading nativo do RTK Query e renomeamos para isCheckingIn
  const [checkinRequest, { isLoading: isCheckingIn }] = useCheckinRequestMutation();
  
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let interval;
    if (isCheckingIn) {
      interval = setInterval(() => {
        Animated.sequence([
          Animated.timing(fadeAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
          Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true })
        ]).start();

        setTimeout(() => {
          setLoadingMessageIndex((prev) => (prev < MESSAGES.length - 1 ? prev + 1 : prev));
        }, 500);
      }, 4000);
    } else {
      setLoadingMessageIndex(0);
      fadeAnim.setValue(1);
    }
    return () => clearInterval(interval);
  }, [isCheckingIn, fadeAnim]);

  const handleCheckin = async () => {
    if (!activeTerminal) return;
    
    try {
      // O unwrap() joga pro catch se der erro, senão devolve a resposta
      const response = await checkinRequest(activeTerminal.id).unwrap();
      
      // O dispatch sumiu daqui! O Redux vai ouvir o sucesso da API lá no extraReducers.
      
      navigation.navigate('CheckinSuccess', { data: response });
    } catch (err) {
      console.error(err);
    }
  };

  return {
    activeTerminal,
    isCheckingIn,
    loadingMessageIndex,
    messages: MESSAGES,
    fadeAnim,
    handleCheckin,
  };
};