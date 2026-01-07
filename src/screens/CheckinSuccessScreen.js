import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import RulesModal from '../components/common/RulesModal';

export default function CheckinSuccessScreen() {
    const navigation = useNavigation();
    const [isModalVisible, setModalVisible] = useState(false);

    const handleAgree = () => {
        setModalVisible(false);
        navigation.navigate('Main');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <Text style={styles.successText}>
                    Checkin realizado com sucesso no terminal BTP.
                </Text>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => setModalVisible(true)}
                >
                    <Text style={styles.buttonText}>Prosseguir</Text>
                </TouchableOpacity>
                <RulesModal
                    visible={isModalVisible}
                    onClose={() => setModalVisible(false)}
                    onAgree={handleAgree}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    successText: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        color: COLORS.primary,
        marginBottom: 40,
    },
    button: {
        backgroundColor: COLORS.primary,
        paddingVertical: 15,
        borderRadius: 5,
        width: '100%',
        position: 'absolute',
        bottom: 20,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
