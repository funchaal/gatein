import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function GreetingSection() {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <View>
                <Text style={styles.greeting}>Olá Rafael</Text>
                <Pressable onPress={() => navigation.navigate('Profile')}>
                    <Text style={styles.profileLink}>Ver perfil</Text>
                </Pressable>
            </View>
            <Pressable style={styles.activityButton} onPress={() => navigation.navigate('Activity')}>
                <Text style={styles.activityButtonText}>Ver atividade</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingTop: 10,
        marginBottom: 10,
    },
    greeting: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    profileLink: {
        fontSize: 14,
        color: '#F97316',
        fontWeight: 'bold',
    },
    activityButton: {
        backgroundColor: '#f9741623',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 50,
    },
    activityButtonText: {
        color: '#F97316',
    },
});
