import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function ListSeparator() {
    return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
    separator: {
        height: 1,
        backgroundColor: '#E5E5E5',
        marginHorizontal: 20,
    }
});