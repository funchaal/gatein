import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ScreenWrapper from "../../../components/common/ScreenWrapper";
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from "react-redux";

import Input from "../../../components/ui/Input";
import MainAsyncButton from "../../../components/ui/MainAsyncButton";
import LoadingModal from "../../../components/ui/LoadingModal";
import { useValidateDriverLicenseRequestMutation, useLoginMutation } from "../../../services/api";
import { COLORS } from "../../../constants/colors";
import { styles } from "./DriverLicenseNumber.styles";

export default function DriverLicenseNumber({ route }) {
    const navigation = useNavigation();
    const [driverLicense, setDriverLicense] = useState('');
    const [validDriverLicense, setValidDriverLicense] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const tax_id = route?.params?.login_payload?.tax_id || useSelector((state) => state.register?.user?.tax_id);
    const from_login = route?.params?.from_login || false;
    const login_payload = route?.params?.login_payload || null; 

    const [validateDriverLicense] = useValidateDriverLicenseRequestMutation();
    const [login] = useLoginMutation(); 

    const handleNext = async () => {
        setLoading(true);
        setError('');
        try {
            await validateDriverLicense({ 
                tax_id: tax_id, 
                driver_license: driverLicense,
                from_login: from_login 
            }).unwrap();

            if (from_login) {
                await login(login_payload).unwrap();
            } else {
                navigation.reset({
                    index: 0,
                    routes: [{ 
                        name: 'Password'
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
        <ScreenWrapper>
            <View style={styles.container}>
                <View style={styles.content}>
                    <View style={styles.iconBadge}>
                        <MaterialCommunityIcons name="card-account-details-outline" size={34} color={COLORS.primary} />
                    </View>
                    <Text style={styles.title}>Valide sua CNH</Text>
                    <Text style={styles.subtitle}>Informe o número da sua Carteira Nacional de Habilitação</Text>
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

                <View style={styles.buttonWrapper}>
                    <MainAsyncButton onPress={handleNext} disabled={!validDriverLicense}/>
                </View>
            </View>
            <LoadingModal visible={loading} text={from_login ? "Validando CNH e entrando..." : "Validando sua CNH..."} />
        </ScreenWrapper>
    );
}

