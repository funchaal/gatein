import React from 'react';
import { View, Text } from 'react-native';
import { styles } from './SectionElement.styles';

export default function SectionElement({ props }) {
    return (
        <View style={styles.sectionWrapper}>
            <Text style={styles.sectionTitle}>{props.title}</Text>
        </View>
    );
}
