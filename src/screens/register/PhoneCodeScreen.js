import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch } from "react-redux";

import { COLORS } from "../../constants/colors";
import CodeInput from "../../components/register/CodeInput";
import { globalStyles } from "../../constants/styles";
import { checkPhoneValidationCodeRequest, sendPhoneValidationCodeRequest } from '../../store/slices/registerSlice';
import LoadingModal from "../../components/common/LoadingModal";

// --- Componente do Modal de Loading (Baseado na sua referência) ---
const ResendCodeButton = ({ phone }) => {
    const [timeLeft, setTimeLeft] = useState(30);
    const isDisabled = timeLeft > 0;
    const dispatch = useDispatch();

    const handlePress = () => {
        if (!isDisabled) {
            setTimeLeft(30);
            dispatch(sendPhoneValidationCodeRequest({ phone: phone }));
            console.log("Reenviando código...");
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

export default function PhoneCodeScreen() {
    const navigation = useNavigation();
    const route = useRoute();

    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [isInvalidCode, setIsInvalidCode] = useState(false);
    
    const dispatch = useDispatch();
    const phone = route.params?.phone || "seu celular";

    const handleNext = async (code) => {
        setLoading(true); // <--- ISSO VAI DISPARAR O MODAL SUBINDO
        setErrorMsg('');
        setIsInvalidCode(false);

        try {
            const result = await dispatch(checkPhoneValidationCodeRequest({ code })).unwrap(); 
            console.log("Código válido:", code, result);
            
            // On success, the thunk will update the state. Let's navigate.
            navigation.reset({
            index: 0,
            routes: [{ name: 'DriverLicenseNumber' }],
        });
            
        } catch (error) {
            console.log(error);
            setIsInvalidCode(true); // Visually mark the input as invalid
            if (error.code === 'PHONE_VALIDATION_CODE_INVALID') {
                setErrorMsg('Código inválido.');
            } else if (error.code === 'TAX_ID_AND_PHONE_MISMATCH') {
                setErrorMsg('Código incorreto.');
            } else {
                setErrorMsg(error.message || "Ocorreu um erro inesperado.");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.content}>
                    <Text style={globalStyles.title}>Agora precisamos validar seu celular</Text>
                    
                    <Text style={globalStyles.subtitle}>
                        Enviamos um código de 4 números para {'\n'}
                        <Text style={{fontWeight: 'bold', color: COLORS.textDark}}>{phone}</Text> via SMS.
                    </Text>

                    <View style={styles.inputWrapper}>
                        <CodeInput 
                            onComplete={handleNext}
                            error={isInvalidCode}
                            onErrorDismiss={() => {
                                setIsInvalidCode(false);
                                setErrorMsg('');
                            }}
                        />
                        <Text style={styles.errorText}>
                            {errorMsg || ''} 
                        </Text>
                    </View>
                </View>
                    <ResendCodeButton phone={phone} />
                
                <View/> 
            </View>

            {/* O MODAL FICA AQUI */}
            <LoadingModal visible={loading} text="Validando código..." />

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
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    content: {
        flex: 1,
    },
    inputWrapper: {
        marginTop: 60,
        paddingVertical: 15, 
        width: '100%',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    resendContainer: {
        marginBottom: 30,
        alignItems: 'center',
    },
    resendText: {
        fontSize: 14,
        fontWeight: '500',
    }, 
    errorText: {
        color: COLORS.error,
        fontSize: 16,
        marginTop: 30,
        marginLeft: 4,
        minHeight: 20,
    }
});
