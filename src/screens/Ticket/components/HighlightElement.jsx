import React from 'react';
import { View, Text } from 'react-native';
import { styles } from './HighlightElement.styles';
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
