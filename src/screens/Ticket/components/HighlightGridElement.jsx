import React from 'react';
import { View, Text } from 'react-native';
import { styles } from './HighlightGridElement.styles';
import HighlightElement from './HighlightElement';

export default function HighlightGridElement({ data, props }) {
    const items = props.items || [];
    if (!items.length) return null;
    return (
        <View style={styles.gridWrapper}>
            {props.label && <Text style={styles.sectionTitle}>{props.label}</Text>}
            <View style={styles.grid}>
                {items.map((item, i) => (
                    <HighlightElement key={i} data={data} props={item} />
                ))}
            </View>
        </View>
    );
}
