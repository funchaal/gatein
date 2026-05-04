import React, { useState, useEffect } from "react";
import { Text, Pressable, StyleSheet } from "react-native";
import { COLORS } from "../../../../constants/colors";
import { useSendPhoneValidationCodeRequestMutation } from '../../../../services/api';

export const ResendCodeButton = ({ phone }) => {
    const [timeLeft, setTimeLeft] = useState(30);
    const isDisabled = timeLeft > 0;
    const [sendPhoneValidationCode] = useSendPhoneValidationCodeRequestMutation();

    const handlePress = () => {
        if (!isDisabled) {
            setTimeLeft(30);
            sendPhoneValidationCode({ phone: phone });
            // console.log("Reenviando código...");
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
            <Text style={[styles.resendText, { color: isDisabled ? COLORS.textLight : COLORS.primary }]}>
                {isDisabled ? `Reenviar código em: 00:${timeLeft.toString().padStart(2, '0')}` : 'Reenviar código'}
            </Text>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    resendContainer: {
        marginBottom: 30,
        alignItems: 'center',
    },
    resendText: {
        fontSize: 14,
        fontWeight: '500',
    }, 
});
