import React, { useEffect, useRef } from "react";
import { StyleSheet, View, Text, Pressable, ActivityIndicator, Animated } from "react-native";
import { globalStyles } from "../../constants/styles";

export default function MainAsyncButton({ onPress, disabled, loading, title = "Continuar" }) {
    
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: loading ? 1 : 0,
            duration: 250,
            useNativeDriver: true,
        }).start();
    }, [loading]);

    const textOpacity = fadeAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0]
    });

    const loadingOpacity = fadeAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1]
    });

    return (
        <Pressable 
            onPress={loading ? null : onPress}
            style={[
                globalStyles.mainButton, 
                disabled && !loading ? styles.buttonDisabled : styles.buttonEnabled
            ]} 
            disabled={disabled || loading}
        >
            <Animated.View style={{ opacity: textOpacity }}>
                <Text style={globalStyles.mainButtonText}>{title}</Text>
            </Animated.View>

            <Animated.View style={[styles.loadingContainer, { opacity: loadingOpacity }]}>
                <ActivityIndicator size="small" color="white" />
            </Animated.View>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    buttonEnabled: {
        opacity: 1,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    loadingContainer: {
        ...StyleSheet.absoluteFill, 
        justifyContent: 'center',
        alignItems: 'center',
    }
});