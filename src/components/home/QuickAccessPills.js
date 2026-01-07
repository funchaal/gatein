import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const QuickActionPill = ({ text, icon, onPress }) => (
    <Pressable onPress={onPress} style={styles.pill}>
        <Icon name={icon} size={20} color="#333" style={styles.icon} />
        <Text style={styles.text}>{text}</Text>
    </Pressable>
);

export default function QuickAccessPills() {
    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
            <QuickActionPill text="Meus Documentos" icon="document-text-outline" onPress={() => alert('Meus Documentos')} />
            <QuickActionPill text="Suporte / Chat" icon="chatbubble-ellipses-outline" onPress={() => alert('Suporte / Chat')} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 10,
        paddingLeft: 15,
    },
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 8,
        marginRight: 10,
    },
    icon: {
        marginRight: 8,
    },
    text: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
});