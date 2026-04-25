import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { styles } from '../Map.styles';

export default function MapLoading({ text = "Obtendo localização..." }) {
    return (
        <View style={styles.centered}>
            <ActivityIndicator size="large" color="#1E40AF" />
            <Text style={styles.loadingText}>{text}</Text>
        </View>
    );
}