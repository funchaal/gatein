import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const PULSE_MAX_SIZE = 50;

// O componente foi simplificado e não recebe mais a prop 'heading'.
// A rotação agora é controlada pelo componente Marker pai.
export default React.memo(function CurrentLocationMarker() {
    const pulseAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 0,
                    duration: 1500,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, [pulseAnim]);

    const pulseOpacity = pulseAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0.5, 1, 0.5],
    });

    return (
        <View style={styles.container}>
            <Animated.View
                style={[
                    styles.pulse,
                    {
                        transform: [{ scale: pulseAnim }],
                        opacity: pulseOpacity,
                    },
                ]}
            />
            <View style={styles.dot}>
                {/* A seta agora é estática, pois o Marker pai cuida da rotação. */}
                <Icon name="navigate" size={16} color="white" />
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        width: PULSE_MAX_SIZE,
        height: PULSE_MAX_SIZE,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pulse: {
        width: PULSE_MAX_SIZE,
        height: PULSE_MAX_SIZE,
        borderRadius: PULSE_MAX_SIZE / 2,
        backgroundColor: 'rgba(0, 122, 255, 0.3)',
        position: 'absolute',
    },
    dot: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 4,
    },
});