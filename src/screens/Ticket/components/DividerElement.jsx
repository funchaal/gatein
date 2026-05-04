import React from 'react';
import { View, Text } from 'react-native';
import { styles } from './DividerElement.styles';

export default function DividerElement({ props }) {
    return (
        <View style={styles.dividerWrapper}>
            {props.label ? (
                <View style={styles.dividerLabeled}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerLabel}>{props.label}</Text>
                    <View style={styles.dividerLine} />
                </View>
            ) : (
                <View style={[styles.dividerLine, { flex: 1 }]} />
            )}
        </View>
    );
}
