import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useCheckinRequestMutation } from '../../services/api';
import { COLORS } from '../../constants/colors';
import { globalStyles } from '../../constants/styles';

const MESSAGES = [
  "conectando ao terminal",
  "consolidando informações",
  "gerando tickets",
  "aguarde só mais um pouco",
  "só mais um momento"
];

const Dot = ({ delay }) => {
    const opacity = useRef(new Animated.Value(0.2)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, { toValue: 1, duration: 500, delay, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 0.2, duration: 500, useNativeDriver: true }),
            ])
        ).start();
    }, [opacity, delay]);

    return (
        <Animated.Text style={[{ opacity }, globalStyles.subtitle, { marginBottom: 0 }]}>
            .
        </Animated.Text>
    );
};

export default function CheckinProcessing() {
  const navigation = useNavigation();
  const route = useRoute();
  const activeTerminalId = route.params?.terminal_id;

  const [checkinRequest] = useCheckinRequestMutation();
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  useEffect(() => {
    let interval = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev < MESSAGES.length - 1 ? prev + 1 : prev));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

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
    }, 1000); // Give a brief moment for the user to see the processing screen

    return () => clearTimeout(timeout);
  }, [activeTerminalId, checkinRequest, navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.content}>
            <Text style={globalStyles.title}>Processando{'\n'}Checkin</Text>
            <View style={styles.subtitleRow}>
                <Text style={[globalStyles.subtitle, { marginBottom: 0, maxWidth: 'auto' }]}>
                    {MESSAGES[loadingMessageIndex]}
                </Text>
                <Dot delay={0} />
                <Dot delay={200} />
                <Dot delay={400} />
            </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    container: {
        flex: 1,
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10
    },
    content: {
        flex: 1,
    },
    subtitleRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        flexWrap: 'wrap'
    }
});
