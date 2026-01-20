import React, { useState, useEffect, useRef } from "react";
import { View, TextInput, Text, StyleSheet, Animated } from "react-native";
import { COLORS } from "../../constants/colors";
import { globalStyles } from "../../constants/styles";

// Criamos um componente de Input animado para aceitar cores interpoladas
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

export default function Input({ label, error, ...props }) {
    const [isFocused, setIsFocused] = useState(false);
    
    // Controlador da animação (0 = sem erro, 1 = com erro)
    const errorAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(errorAnim, {
            toValue: error ? 1 : 0,
            duration: 200, // Transição "bem rápida" e suave
            useNativeDriver: false, // Necessário false para animar cores e layout
        }).start();
    }, [error]);

    // 1. Interpolação da Cor de Fundo do Input
    const backgroundColor = errorAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [COLORS.lightGray, '#ffe9e9ff']
    });

    // 2. Estilos do Texto de Erro (Opacidade e Altura para não ocupar espaço quando vazio)
    const errorOpacity = errorAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1]
    });

    return (
        <View style={[styles.container, props.containerStyle]}>
            {label && <Text style={styles.label}>{label}</Text>}
            
            <AnimatedTextInput
                placeholderTextColor={COLORS.muted}
                style={[
                    globalStyles.input,
                    { 
                        backgroundColor: backgroundColor
                    },
                    props.style
                ]}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                {...props}
            />
            
            {/* O texto de erro sempre é renderizado na árvore, mas controlamos 
               sua visibilidade e altura pela animação para ser suave 
            */}
            <Animated.View style={{ opacity: errorOpacity, overflow: 'hidden' }}>
                <Text style={styles.errorText}>
                    {error || ''} 
                </Text>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        // marginVertical: 20,
    },
    label: {
        marginBottom: 7,
        fontSize: 16,
        fontWeight: '500',
        color: '#a5a5a5ff',
        marginLeft: 4,
    },
    input: {
        height: 56,
        width: '100%',
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        color: COLORS.textPrimary,
        // Background e BorderColor agora são controlados via style inline no componente
    },
    errorText: {
        color: COLORS.error,
        fontSize: 16,
        marginTop: 4,
        marginLeft: 4,
    }
});