import React from 'react';
import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { styles } from './AttentionElement.styles';
import { getFieldValue } from '../helpers';

export default function AttentionElement({ data, props }) {
    const value = props.message || (props.field && getFieldValue(data, props.field));
    if (!value) return null;
    const COLORS = {
        orange: { bg: '#FFEDD5', border: '#FB923C', text: '#9A3412', icon: '#EA580C' },
        red:    { bg: '#FEE2E2', border: '#F87171', text: '#991B1B', icon: '#DC2626' },
        yellow: { bg: '#FEF3C7', border: '#FACC15', text: '#854D0E', icon: '#CA8A04' },
        blue:   { bg: '#DBEAFE', border: '#60A5FA', text: '#1D4ED8', icon: '#2563EB' },
        gray:   { bg: '#F3F4F6', border: '#D1D5DB', text: '#374151', icon: '#6B7280' },
    };
    const c = COLORS[props.color] || COLORS.orange;
    const iconName = props.icon || 'alert-circle-outline';
    return (
        <View style={[styles.attentionBox, { backgroundColor: c.bg, borderColor: c.bg }]}>
            <Icon name={iconName} size={20} color={c.icon} style={{ marginTop: 1 }} />
            <View style={{ flex: 1, marginLeft: 10 }}>
                {props.title && <Text style={[styles.attentionTitle, { color: c.text }]}>{props.title}</Text>}
                <Text style={[styles.attentionText, { color: c.text }]}>{value}</Text>
            </View>
        </View>
    );
}
