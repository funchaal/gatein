import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { COLORS } from '../../constants/colors';

export default function ChatFAB({ onPress }) {
    return (
        <Pressable style={styles.fab} onPress={onPress}>
            {/* Em um app real, aqui iria um ícone */}
            <Text style={styles.text}>💬</Text> 
        </Pressable>
    );
}

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        bottom: 100, // Posição acima do simulador
        right: 30,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 4,
        shadowOffset: { width: 1, height: 3 },
    },
    text: {
        fontSize: 24,
    },
});
