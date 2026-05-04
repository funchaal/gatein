import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from "react-redux";

import Input from "../../../components/ui/Input";
import MainAsyncButton from "../../../components/ui/MainAsyncButton";
import LoadingModal from "../../../components/ui/LoadingModal";
import { globalStyles } from "../../../constants/styles";
import { useValidateDriverLicenseRequestMutation, useLoginMutation } from "../../../services/api";
import { styles } from "./DriverLicenseNumber.styles";

export default function DriverLicenseNumber({ route }) {
    const navigation = useNavigation();
    const [driverLicense, setDriverLicense] = useState('');
    const [validDriverLicense, setValidDriverLicense] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const taxId = route?.params?.login_payload?.tax_id || route?.params?.tax_id;
    const fromLogin = route?.params?.from_login || false;
    const loginPayload = route?.params?.login_payload; 

    const dispatch = useDispatch();
    const [validateDriverLicense] = useValidateDriverLicenseRequestMutation();
    const [login] = useLoginMutation(); 

    const handleNext = async () => {
        setLoading(true);
        setError('');
        try {
            await validateDriverLicense({ 
                tax_id: taxId, 
                driver_license: driverLicense,
                from_login: fromLogin 
            }).unwrap();

            if (fromLogin && loginPayload) {
                await login(loginPayload).unwrap();
            } else {
                navigation.reset({
                    index: 0,
                    routes: [{ 
                        name: 'Password',
                        params: { tax_id: taxId } 
                    }], 
                });
            }
            
        }
        catch (err) {
            const errorCode = err?.data?.detail?.code || err?.data?.error?.code || err?.code;

            if (errorCode === 'DRIVER_LICENSE_NUMBER_MISMATCH') {
                navigation.navigate('DriverLicenseInvalid');
                setError('O número da CNH não corresponde ao encontrado em nosso sistema.');
            } 
            else if (errorCode === 'DRIVER_LICENSE_PENDING_VALIDATION'){ 
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'DriverLicensePendingValidation' }],
                });
                setError('Ocorreu um erro ao validar sua CNH.');
            }
            else if (errorCode === 'PASSWORD_INVALID') {
                 setError('Erro ao realizar login automático. Volte e tente novamente.');
            }
            else {
                setError(err?.data?.detail?.message || err?.message || 'Ocorreu um erro inesperado. Tente novamente.');
            }
        }
        finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        setError('');
        if (driverLicense.length > 5) { 
            setValidDriverLicense(true);
        } else {
            setValidDriverLicense(false);
        }
    }, [driverLicense]);

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.content}>
                    <Text style={globalStyles.title}>Valide sua CNH</Text>
                    <Input 
                        label='Número da CNH' 
                        placeholder='01234567890' 
                        width='100%' 
                        onChangeText={(text) => setDriverLicense(text)} 
                        value={driverLicense} 
                        keyboardType="number-pad" 
                        maxLength={11}
                        error={error}
                    />
                </View>

                <MainAsyncButton onPress={handleNext} disabled={!validDriverLicense}/>
            </View>
            <LoadingModal visible={loading} text={fromLogin ? "Validando CNH e entrando..." : "Validando sua CNH..."} />
        </SafeAreaView>
    );
}