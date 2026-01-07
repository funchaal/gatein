import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, Pressable, SafeAreaView } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { COLORS } from "../../constants/colors";
import CodeInput from "../../components/register/CodeInput";

const ResendCodeButton = () => {
    const [timeLeft, setTimeLeft] = useState(0);
    const isDisabled = timeLeft > 0;

    const handlePress = () => {
        if (!isDisabled) {
            setTimeLeft(30);
        }
    };

    useEffect(() => {
        if (!timeLeft) return;
        const intervalId = setInterval(() => {
            setTimeLeft(timeLeft - 1);
        }, 1000);
        return () => clearInterval(intervalId);
    }, [timeLeft]);

    return (
        <Pressable onPress={handlePress} disabled={isDisabled} style={styles.resendContainer}>
            <Text style={[styles.resendText, { color: isDisabled ? 'gray' : COLORS.accent }]}>
                {isDisabled ? `Reenviar código em: ${timeLeft}s` : 'Reenviar código'}
            </Text>
        </Pressable>
    );
};

export default function ConfirmScreen() {
    const navigation = useNavigation();

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.content}>
                    <Text style={styles.title}>Agora precisamos validar seu celular</Text>
                    <Text style={styles.subtitle}>Enviamos um código de 4 números para o seu SMS</Text>
                    <CodeInput onComplete={() => navigation.navigate('Password')} />
                    <ResendCodeButton />
                </View>
                <View/>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
        justifyContent: 'space-between',
        padding: 30,
        alignItems: 'center',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    title: {
        fontSize: 28,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 15,
        color: '#333',
    },
    subtitle: {
        fontSize: 18,
        color: '#666',
        textAlign: 'center',
        marginBottom: 40,
    },
    resendContainer: {
        marginTop: 50,
    },
    resendText: {
        fontSize: 16,
    }
});
