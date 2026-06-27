import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../constants/colors';

export default function AlertsScreen() {
    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <View style={styles.emptyContainer}>
                <View style={styles.iconWrapper}>
                    <Icon name="bell-off-outline" size={40} color={COLORS.primary} />
                </View>
                <Text style={styles.title}>Nenhum alerta</Text>
                <Text style={styles.subtitle}>Você não possui novos alertas ou notificações no momento.</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    iconWrapper: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.primary + "14",
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textSecondary,
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.textSubtitle,
        textAlign: 'center',
        lineHeight: 20,
    },
});
