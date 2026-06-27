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
        alignItems: 'center',
        marginBottom: 2, // margin-bottom: 2px
        paddingVertical: 2, // padding-top: 2px; padding-bottom: 2px;
    }, 
    rowLabel: {
        fontSize: 14, // font-size: 14px
        color: THEME.slate400, // color
        fontWeight: '500', // font-weight: 500
        textTransform: 'capitalize',
    }, 
    rowValue: {
        fontSize: 14, // font-size: 14px
        color: THEME.slate900, // color
        fontWeight: '600' // font-weight: 600
    },

    // Estilos para o componente Header
    headerContainer: {
        marginBottom: 4, // margin-bottom: 4px
    },
    headerLabel: {
        fontSize: 14, // font-size: 14px
        color: THEME.slate400, // color
        fontWeight: '500', // font-weight: 500
        marginBottom: 2, // margin-bottom: 2px
        textTransform: 'capitalize',
    },
    headerValue: {
        fontSize: 22, // font-size: 22px
        fontWeight: '800', // font-weight: 800
        color: THEME.slate900, // color
    },

    // Estilos para o componente SubHeader
    subHeaderContainer: {
        marginTop: 4, // margin-top: 4px
    },
    subHeaderLabel: {
        fontSize: 14, // font-size: 14px
        color: THEME.slate400, // color
        fontWeight: '500', // font-weight: 500
        marginBottom: 2, // margin-bottom: 2px
        textTransform: 'capitalize',
    },
    subHeaderValue: {
        fontSize: 17, // font-size: 17px
        fontWeight: '500', // font-weight: 500
        color: THEME.slate600, // color
    }
});
