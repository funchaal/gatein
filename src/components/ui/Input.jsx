import React, { useState, useEffect, useRef } from "react";
import { View, TextInput, Text, StyleSheet, Animated } from "react-native";
import { COLORS } from "../../constants/colors";
import { globalStyles } from "../../constants/styles";

// Criamos um componente de Input animado para aceitar cores interpoladas
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

export default function Input({ label, description, error, multiline, numberOfLines, style, containerStyle, width, ...props }) {
    const [isFocused, setIsFocused] = useState(false);
    
    // Controlador da animação (0 = sem erro, 1 = com erro)
    const errorAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(errorAnim, {
            toValue: error ? 1 : 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
    }, [error]);

    const backgroundColor = errorAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [COLORS.lightGray, '#FEF2F2']
    });

    const errorOpacity = errorAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1]
    });

    return (
        <View style={[styles.container, width ? { width } : null, containerStyle]}>
            {label && <Text style={styles.label}>{label}</Text>}
            
            <AnimatedTextInput
                placeholderTextColor={COLORS.muted}
                multiline={multiline}
                numberOfLines={numberOfLines}
                style={[
                    globalStyles.input,
                    multiline && styles.multilineInput,
                    { 
                        backgroundColor: backgroundColor
                    },
                    style
                ]}
                onFocus={(e) => {
                    setIsFocused(true);
                    if (props.onFocus) props.onFocus(e);
                }}
                onBlur={(e) => {
                    setIsFocused(false);
                    if (props.onBlur) props.onBlur(e);
                }}
                {...props}
            />
            
            {error ? (
                <Animated.View style={{ opacity: errorOpacity, overflow: 'hidden' }}>
                    <Text style={styles.errorText}>
                        {error}
                    </Text>
                </Animated.View>
            ) : description ? (
                <Text style={styles.descriptionText}>
                    {description}
                </Text>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    label: {
        marginBottom: 7,
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
        marginLeft: 4,
    },
    multilineInput: {
        height: undefined,
        minHeight: 110,
        paddingTop: 14,
        paddingBottom: 14,
        textAlignVertical: 'top',
    },
    errorText: {
        color: COLORS.error,
        fontSize: 13,
        marginTop: 4,
        marginLeft: 4,
    },
    descriptionText: {
        color: '#64748B',
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    }
});
