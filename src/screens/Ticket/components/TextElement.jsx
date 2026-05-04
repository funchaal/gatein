import React from 'react';
import { Text } from 'react-native';
import { styles } from './TextElement.styles';
import { getFieldValue } from '../helpers';

export default function TextElement({ data, props }) {
    const value = props.text || (props.field && getFieldValue(data, props.field));
    if (!value) return null;
    const sizeMap = { sm: 13, md: 15, lg: 18 };
    const weightMap = { normal: '400', medium: '500', bold: '700' };
    return (
        <Text style={[
            styles.freeText,
            { fontSize: sizeMap[props.size] || 14 },
            { fontWeight: weightMap[props.weight] || '400' },
            props.align && { textAlign: props.align },
            props.color && { color: props.color },
        ]}>
            {value}
        </Text>
    );
}
