import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { getFieldValue } from '../helpers';

export default function HighlightElement({ data, props }) {
    const value = props.value || (props.field && getFieldValue(data, props.field));
    if (!value) return null;
    const colorScheme = {
        blue:   { bg: '#DBEAFE', border: '#BFDBFE', text: '#1D4ED8' },
        green:  { bg: '#D1FAE5', border: '#BBF7D0', text: '#15803D' },
        amber:  { bg: '#FEF3C7', border: '#FDE68A', text: '#B45309' },
        slate:  { bg: '#F1F5F9', border: '#E2E8F0', text: '#334155' },
    };
    const c = colorScheme[props.color] || colorScheme.slate;
    return (
        <View style={[styles.highlightBox, { backgroundColor: c.bg, borderColor: c.bg }]}>
            {props.label && <Text style={[styles.highlightLabel, { color: c.text }]}>{props.label}</Text>}
            <Text style={[styles.highlightValue, { color: c.text }]}>{value}</Text>
            {props.caption && <Text style={[styles.highlightCaption, { color: c.text }]}>{props.caption}</Text>}
        </View>
    );
}

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
    highlightBox: {
        borderRadius: 14,
        borderWidth: 1.5,
        padding: 16,
        alignItems: 'flex-start',
        flex: 1,
        minWidth: (width - 80) / 2,
        margin: 0,
    },
    highlightLabel: {
        fontSize: 13,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 6,
        opacity: 0.7,
    },
    highlightValue: {
        fontSize: 36,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    highlightCaption: {
        fontSize: 13,
        fontWeight: '500',
        marginTop: 4,
        opacity: 0.7,
    },
});
