import React, { useState, useEffect } from "react";
import { Text, Pressable, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import { COLORS } from "../../../../constants/colors";
import { useSendPhoneValidationCodeRequestMutation } from '../../../../services/api';

export const ResendCodeButton = ({ phone }) => {
    const tax_id = useSelector((state) => state.register?.user?.tax_id);
    const [timeLeft, setTimeLeft] = useState(30);
    const isDisabled = timeLeft > 0;
    const [sendPhoneValidationCode] = useSendPhoneValidationCodeRequestMutation();

    const handlePress = () => {
        if (!isDisabled) {
            setTimeLeft(30);
            sendPhoneValidationCode({ tax_id: tax_id, phone: phone });
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
            <Text style={[styles.resendText, { color: isDisabled ? COLORS.muted : COLORS.primary }]}>
                {isDisabled ? `Reenviar código em 00:${timeLeft.toString().padStart(2, '0')}` : 'Reenviar código'}
            </Text>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    resendContainer: {
        marginBottom: 32,
        alignItems: 'flex-start',
    },
    resendText: {
        fontSize: 15,
        fontWeight: '600',
    }, 
});

