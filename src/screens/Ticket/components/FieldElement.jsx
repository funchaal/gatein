import React from 'react';
import { View, Text } from 'react-native';
import { styles } from './FieldElement.styles';
import { getFieldValue } from '../helpers';

export default function FieldElement({ data, props }) {
    const value = getFieldValue(data, props.field);
    if (!value) return null;
    return (
        <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>{props.label}</Text>
            <Text style={styles.fieldValue}>{value}</Text>
        </View>
    );
}
