import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../../constants/colors';

const CODE_LENGTH = 4;

export default function CodeInput({ onComplete, error, onErrorDismiss }) {
    const [code, setCode] = useState(Array(CODE_LENGTH).fill(''));
    const inputs = useRef([]);
    
    // Valor animado para o efeito de shake
    const shakeAnimation = useRef(new Animated.Value(0)).current;

    // Monitora a prop de erro
    useEffect(() => {
        if (error) {
            // 1. Inicia a animação de shake
            startShake();
            // 2. Limpa o conteúdo
            setCode(Array(CODE_LENGTH).fill(''));
            // 3. Foca no primeiro input novamente
            if (inputs.current[0]) inputs.current[0].focus();
        }
    }, [error]);

    const startShake = () => {
        Animated.sequence([
            Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true })
        ]).start();
    };

    const handleInput = (text, index) => {
        // Se estava com erro (vermelho), avisa o pai para limpar o estado de erro
        if (error && onErrorDismiss) {
            onErrorDismiss();
        }

        const newCode = [...code];
        newCode[index] = text;
        setCode(newCode);

        // Foca no próximo input se digitou algo
        if (text && index < CODE_LENGTH - 1) {
            inputs.current[index + 1].focus();
        }

        // Se o código estiver completo, chama a função
        if (newCode.every(char => char !== '') && newCode.length === CODE_LENGTH) {
            onComplete(newCode.join(''));
        }
    };

    const handleKeyPress = (e, index) => {
        if (e.nativeEvent.key === 'Backspace') {
            if (!code[index] && index > 0) {
                inputs.current[index - 1].focus();
            }
        }
    };

    return (
        <Animated.View 
            style={[
                styles.container, 
                { transform: [{ translateX: shakeAnimation }] }
            ]}
        >
            {Array(CODE_LENGTH).fill(0).map((_, index) => (
                <TextInput
                    key={index}
                    ref={el => (inputs.current[index] = el)}
                    style={[
                        styles.input,
                        // Aplica cor vermelha na borda e texto se houver erro
                        error && styles.inputError
                    ]}
                    keyboardType="number-pad"
                    maxLength={1}
                    returnKeyType="done"
                    textContentType="oneTimeCode"
                    autoComplete="sms-otp"
                    selectTextOnFocus={true}
                    
                    onChangeText={text => handleInput(text, index)}
                    onKeyPress={e => handleKeyPress(e, index)}
                    value={code[index]}
                    
                    // Cores do cursor e seleção baseadas no estado de erro
                    selectionColor={error ? COLORS.error : COLORS.primary}
                    cursorColor={error ? COLORS.error : COLORS.primary}
                />
            ))}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: 300,
    },
    input: {
        width: 60,
        height: 65,
        borderBottomWidth: 2,
        borderColor: '#E0E0E0',
        textAlign: 'center',
        textAlignVertical: 'center',
        padding: 0,
        includeFontPadding: false,
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.primary,
        backgroundColor: 'transparent',
    },
    // Estilo específico para o estado de erro
    inputError: {
        borderColor: COLORS.error || 'red', // Fallback se COLORS.error não existir
        color: COLORS.error || 'red',
    }
});