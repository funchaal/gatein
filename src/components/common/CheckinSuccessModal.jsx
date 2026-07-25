import React from 'react';
import {
    View, Text, Pressable, StyleSheet,
    Modal, Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../constants/colors';

const { height } = Dimensions.get('window');

export default function CheckinSuccessModal({ visible, onClose }) {
    return (
        <Modal
            transparent
            visible={visible}
            animationType="slide"
            onRequestClose={onClose}
        >
            <Pressable style={styles.overlay} onPress={onClose}>
                <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
                    <View style={styles.handle} />
                    
                    <View style={styles.content}>
                        <View style={styles.iconContainer}>
                            <Icon name="check-circle" size={54} color={COLORS.success} />
                        </View>
                        
                        <Text style={styles.title}>Check-in Confirmado!</Text>
                        <Text style={styles.message}>
                            Seu check-in foi confirmado com sucesso. Verifique o seu ticket para instruções de acesso.
                        </Text>
                        
                        <Pressable
                            style={({ pressed }) => [
                                styles.button,
                                pressed && styles.buttonPressed
                            ]}
                            onPress={onClose}
                        >
                            <Text style={styles.buttonText}>Ok</Text>
                        </Pressable>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 24,
        paddingBottom: 40,
        paddingTop: 12,
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#E2E8F0',
        alignSelf: 'center',
        marginBottom: 24,
    },
    content: {
        alignItems: 'center',
        gap: 16,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#E8F5E9',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1E293B',
        textAlign: 'center',
    },
    message: {
        fontSize: 15,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 12,
    },
    button: {
        backgroundColor: COLORS.primary,
        alignSelf: 'stretch',
        height: 50,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonPressed: {
        opacity: 0.9,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
