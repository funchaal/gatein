import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { DRIVER_STATUS } from '../../constants/driver_status';

const statusOptions = [
    { label: 'Em Trânsito', value: DRIVER_STATUS.EM_TRANSITO },
    { label: 'Aproximando', value: DRIVER_STATUS.APROXIMANDO },
    { label: 'Check-in', value: DRIVER_STATUS.PRONTO_CHECKIN },
    { label: 'Dentro do Terminal', value: DRIVER_STATUS.DENTRO_TERMINAL },
];

export default function StatusSimulator({ currentStatus, setStatus }) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Simulador de Status</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                {statusOptions.map(option => (
                    <Pressable
                        key={option.value}
                        onPress={() => setStatus(option.value)}
                        style={[
                            styles.button,
                            currentStatus === option.value && styles.selectedButton,
                        ]}
                    >
                        <Text style={[styles.text, currentStatus === option.value && styles.selectedText]}>
                            {option.label}
                        </Text>
                    </Pressable>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        backgroundColor: '#343a40',
        paddingVertical: 10,
        paddingHorizontal: 5,
    },
    title: {
        color: 'white',
        textAlign: 'center',
        fontSize: 12,
        marginBottom: 5,
    },
    scroll: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    button: {
        backgroundColor: '#6c757d',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        marginHorizontal: 5,
    },
    selectedButton: {
        backgroundColor: '#007bff',
    },
    text: {
        color: 'white',
        fontSize: 14,
    },
    selectedText: {
        fontWeight: 'bold',
    },
});
