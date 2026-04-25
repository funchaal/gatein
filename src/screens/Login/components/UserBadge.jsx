import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { maskCPF } from '../../../utils/masks';
import { styles } from '../Login.styles';

export default function UserBadge({ cpf, onSwitchAccount }) {
    return (
        <View style={styles.cpfBadgeContainer}>
            <View style={styles.cpfBadge}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.badgeLabel}>Acessando como</Text>
                    <Text style={styles.badgeValue}>
                        {maskCPF(cpf)}
                    </Text>
                </View>
                <TouchableOpacity onPress={onSwitchAccount} style={styles.changeUserIcon}>
                    <Text style={styles.changeUserText}>ALTERAR</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}