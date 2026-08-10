import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { COLORS } from '../../constants/colors';

export default function RequestsScreen() {
    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <View style={styles.emptyContainer}>
                <View style={styles.iconWrapper}>
                    <FeatherIcon name="inbox" size={40} color={COLORS.primary} />
                </View>
                <Text style={styles.emptyTitle}>Nenhuma solicitação</Text>
                <Text style={styles.emptySubtitle}>
                    Suas solicitações aparecerão aqui.
                </Text>
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
        paddingHorizontal: 32,
        paddingBottom: 60,
    },
    iconWrapper: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: (COLORS.primary || '#F97316') + '14',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textSecondary || '#424242',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 13,
        color: COLORS.textSubtitle || '#666',
        textAlign: 'center',
        lineHeight: 18,
    },
});
