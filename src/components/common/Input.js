import React, { useState } from "react";
import { View, TextInput, Text, StyleSheet } from "react-native";

// Defina sua cor primária aqui ou importe de constants
const PRIMARY_COLOR = '#F97316'; // Laranja

export default function Input({ label, error, ...props }) {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={[styles.container, props.containerStyle]}>
            {label && <Text style={styles.label}>{label}</Text>}
            
            <TextInput
                placeholderTextColor="#999"
                style={[
                    styles.input,
                    isFocused && styles.inputFocused, // Borda laranja ao focar
                    error && styles.inputError,       // Borda vermelha se houver erro
                    props.style
                ]}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                {...props} // Repassa todas as outras props (secureTextEntry, value, etc)
            />
            
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginVertical: 10,
    },
    label: {
        marginBottom: 6,
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginLeft: 4, // Alinhamento visual suave
    },
    input: {
        height: 56, // Altura um pouco maior para toque fácil
        width: '100%',
        backgroundColor: '#F5F5F5', // Cinza bem suave
        borderRadius: 12, // Pedido do usuário
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#333',
        borderWidth: 1.5,
        borderColor: 'transparent', // Borda invisível por padrão
    },
    inputFocused: {
        borderColor: PRIMARY_COLOR, // Fica laranja ao clicar
        backgroundColor: '#FFF',    // Fundo branco para destaque
    },
    inputError: {
        borderColor: '#DC2626', // Vermelho erro
    },
    errorText: {
        color: '#DC2626',
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    }
});