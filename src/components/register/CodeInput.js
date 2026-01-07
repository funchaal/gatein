import React, { useState, useRef } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

const CODE_LENGTH = 4;

export default function CodeInput({ onComplete }) {
    const [code, setCode] = useState(Array(CODE_LENGTH).fill(''));
    const inputs = useRef([]);

    const handleInput = (text, index) => {
        const newCode = [...code];
        newCode[index] = text;
        setCode(newCode);

        // Foca no próximo input
        if (text && index < CODE_LENGTH - 1) {
            inputs.current[index + 1].focus();
        }

        // Se o código estiver completo, chama a função
        if (newCode.join('').length === CODE_LENGTH) {
            onComplete(newCode.join(''));
        }
    };

    const handleKeyPress = (e, index) => {
        // Volta para o input anterior ao apagar
        if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
            inputs.current[index - 1].focus();
        }
    };

    return (
        <View style={styles.container}>
            {Array(CODE_LENGTH).fill(0).map((_, index) => (
                <TextInput
                    key={index}
                    ref={el => (inputs.current[index] = el)}
                    style={styles.input}
                    keyboardType="number-pad"
                    maxLength={1}
                    onChangeText={text => handleInput(text, index)}
                    onKeyPress={e => handleKeyPress(e, index)}
                    value={code[index]}
                />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
    },
    input: {
        width: 50,
        height: 50,
        borderBottomWidth: 2,
        borderColor: 'lightgray',
        textAlign: 'center',
        fontSize: 30,
        color: COLORS.primary,
    },
});
