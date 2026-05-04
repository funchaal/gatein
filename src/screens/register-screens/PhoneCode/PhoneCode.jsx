import React, { useState } from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from '@react-navigation/native';

import { COLORS } from "../../../constants/colors";
import CodeInput from "./components/CodeInput";
import { globalStyles } from "../../../constants/styles";
import { useCheckPhoneValidationCodeRequestMutation } from '../../../services/api';
import LoadingModal from "../../../components/ui/LoadingModal";
import { ResendCodeButton } from "./components/ResendCodeButton";
import { styles } from "./PhoneCode.styles";

export default function PhoneCode() {
    const navigation = useNavigation();
    const route = useRoute();

    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [isInvalidCode, setIsInvalidCode] = useState(false);
    
    const [checkPhoneValidationCode] = useCheckPhoneValidationCodeRequestMutation();
    const phone = route.params?.phone || "seu celular";

    const handleNext = async (code) => {
        setLoading(true); // <--- ISSO VAI DISPARAR O MODAL SUBINDO
        setErrorMsg('');
        setIsInvalidCode(false);

        try {
            const result = await checkPhoneValidationCode({ code }).unwrap(); 
            
            navigation.reset({
                index: 0,
                routes: [{ name: 'DriverLicenseNumber' }],
            });
            
        } catch (error) {
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
