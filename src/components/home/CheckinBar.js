import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export default function CheckinBar() {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <Icon name="finger-print-outline" size={35} color="#555" />
            <View style={styles.textContainer}>
                <Text style={styles.bigText}>Terminal BTP</Text>
                <Text style={styles.smallText}>Reconheça sua biometria</Text>
            </View>
            <Pressable style={styles.button} onPress={() => navigation.navigate('FacialRecognition')}>
                <Text style={styles.buttonText}>Check-In</Text>
                <Icon name="chevron-forward-outline" size={16} color="white" />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        paddingHorizontal: 15,
        paddingVertical: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        gap: 15,
    },
    textContainer: {
        flex: 1, // Allow text to take available space
    },
    smallText: {
        fontSize: 12,
        color: '#666',
    },
    bigText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    button: {
        backgroundColor: '#F97316',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
});