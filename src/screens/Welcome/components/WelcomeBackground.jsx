import React from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../../constants/colors';
import { styles } from '../Welcome.styles';

export default function WelcomeBackground() {
    return (
        <MaterialCommunityIcons 
            name="boom-gate" 
            size={300} 
            color={COLORS.primary} 
            style={styles.backgroundIcon} 
        />
    );
}