import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { styles } from '../Map.styles';

export default function MapLoading({ text = "Obtendo localização...", isError = false }) {
    return (
        <View style={styles.centered}>
            <ActivityIndicator size="large" color={isError ? "#EF4444" : "#1E40AF"} />
            <Text style={isError ? styles.errorText : styles.loadingText}>{text}</Text>
        </View>
    );
}
