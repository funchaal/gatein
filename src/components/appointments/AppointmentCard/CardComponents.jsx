import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getValue } from './utils';
import { THEME } from './constants';

export function Row({ data, props: { label, field } }) {
    const value = field ? getValue(data, field) : null;
    if (!value) return null;

    return (
        <View style={styles.rowContainer}>
            {label && <Text style={styles.rowLabel}>{label}</Text>}
            <Text style={styles.rowValue}>{value}</Text>
        </View>
    );
}

export function Header({ data, props: { label, field } = {} }) {
    const value = field ? getValue(data, field) : null;
    if (!value) return null;

    return (
        <View style={styles.headerContainer}>
            {label && <Text style={styles.headerLabel}>{label}</Text>}
            <Text style={styles.headerValue}>{value}</Text>
        </View>
    );
}

export function SubHeader({ data, props: { label, field } = {} }) {
    const value = field ? getValue(data, field) : null;
    if (!value) return null;

    return (
        <View style={styles.subHeaderContainer}>
            {label && <Text style={styles.subHeaderLabel}>{label}</Text>}
            <Text style={styles.subHeaderValue}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    // Estilos para o componente Row
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 8,
        marginBottom: 2, // margin-bottom: 2px
        paddingVertical: 2, // padding-top: 2px; padding-bottom: 2px;
    }, 
    rowLabel: {
        fontSize: 14,
        color: THEME.slate400,
        fontWeight: '500',
        textTransform: 'capitalize',
        flex: 1,
        maxWidth: '50%',
    }, 
    rowValue: {
        fontSize: 14,
        color: THEME.slate900,
        fontWeight: '600',
        flex: 1,
        maxWidth: '50%',
        textAlign: 'right',
    },

    // Estilos para o componente Header
    headerContainer: {
        marginBottom: 5,
    },
    headerLabel: {
        fontSize: 14,
        color: THEME.slate400,
        fontWeight: '500',
        marginBottom: 0,
        textTransform: 'capitalize',
    },
    headerValue: {
        fontSize: 22,
        fontWeight: '800',
        color: THEME.slate900,
    },

    // Estilos para o componente SubHeader
    subHeaderContainer: {
        marginTop: 5,
    },
    subHeaderLabel: {
        fontSize: 14,
        color: THEME.slate400,
        fontWeight: '500',
        marginBottom: 0,
        textTransform: 'capitalize',
    },
    subHeaderValue: {
        fontSize: 16,
        fontWeight: '500',
        color: THEME.slate600,
    }
});
