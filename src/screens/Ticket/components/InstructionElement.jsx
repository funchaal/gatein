import React from 'react';
import { View, Text } from 'react-native';
import { styles } from './InstructionElement.styles';

export default function InstructionElement({ props }) {
    const steps = props.steps || [];
    if (!steps.length) return null;
    return (
        <View style={styles.instructionWrapper}>
            {props.title && <Text style={styles.instructionTitle}>{props.title}</Text>}
            {steps.map((step, i) => (
                <View key={i} style={styles.instructionStep}>
                    <View style={styles.instructionBullet}>
                        <Text style={styles.instructionBulletText}>{i + 1}</Text>
                    </View>
                    <Text style={styles.instructionStepText}>{step}</Text>
                </View>
            ))}
        </View>
    );
}
