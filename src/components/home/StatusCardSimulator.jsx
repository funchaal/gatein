import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { STATUS } from '../../constants/status';

const statusOptions = [
    { label: 'Sem Ações', value: STATUS.NO_ACTION },
    { label: 'Check-in Disponível', value: STATUS.CHECKIN_AVAILABLE },
    { label: 'Check-in Realizado', value: STATUS.CHECKIN_DONE },
];

export default function StatusCardSimulator({ currentStatus, setStatus }) {
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