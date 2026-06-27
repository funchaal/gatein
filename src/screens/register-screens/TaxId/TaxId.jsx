import React, { useEffect, useState } from "react";
import { View, Text, Keyboard } from "react-native";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ScreenWrapper from "../../../components/common/ScreenWrapper";

import { maskCPF } from '../../../utils/masks';
import { isValidCPF } from '../../../utils/validators';

import Input from "../../../components/ui/Input";
import MainAsyncButton from "../../../components/ui/MainAsyncButton";

import { useRegisterTaxIdRequestMutation } from "../../../services/api";

import { COLORS } from "../../../constants/colors";
import { styles } from "./TaxId.styles";

export default function TaxId({ navigation }) {
    const [taxId, setTaxId] = useState('');
    const [validTaxId, setValidTaxId] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const [registerTaxId] = useRegisterTaxIdRequestMutation();

    useEffect(() => {
        setError(''); 

        if (taxId.length < 2) {
            setValidTaxId(false);
            setError('');
            return;
        }

        const is_valid = isValidCPF(taxId)
        
        setValidTaxId(is_valid);

        if (is_valid) Keyboard.dismiss();

        const timeoutId = setTimeout(() => {
            if (!is_valid) setError('CPF inválido')
        }, 1000);

        return () => clearTimeout(timeoutId);

    }, [taxId]);

    const handlePress = async () => {
        setLoading(true);
        try {
            const cleanTaxId = taxId.replace(/\D/g, ''); 
            const result = await registerTaxId({ tax_id: cleanTaxId }).unwrap();

            if (result.data?.user?.register_step === 'registered') {
                // User already has an account, redirect to login screen's password step
                navigation.navigate('Login', { 
                    tax_id: cleanTaxId, 
                    message: 'Você já tem uma conta!' 
                });
            } else if (result.data?.user?.register_step !== 'new') {
                // In-progress registration found
                navigation.navigate('InProgressConfirmation', {
                    tax_id: cleanTaxId,
                    masked_name: result?.data?.user?.masked_name, // Assuming name is returned
                    register_step: result?.data?.user?.register_step
                });
            } else if (result.data?.user?.register_step === 'new') {
                // New registration
                navigation.navigate('Name');

            } else {
                // Fallback for unexpected response
                setError('Ocorreu um erro inesperado. Tente novamente.');
            }

        } catch (err) { 
            console.log(err)
            setError(typeof err === 'string' ? err : 'Ocorreu um erro');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenWrapper>
            <View style={styles.container}>
                <View style={styles.content}>
                    <View style={styles.iconBadge}>
                        <MaterialCommunityIcons name="card-account-details-outline" size={34} color={COLORS.primary} />
                    </View>
                    <Text style={styles.title}>Vamos criar uma{'\n'}conta para você</Text>
                    <Text style={styles.subtitle}>Informe o CPF de quem vai usar a conta</Text>
                    <Input 
                        label='CPF' 
                        placeholder='000.000.000-00' 
                        width='100%' 
                        onChangeText={(text) => setTaxId(maskCPF(text))} 
                        value={taxId} 
                        keyboardType="number-pad" 
                        maxLength={14}
                        error={error}
                    />
                </View>

                <View style={styles.buttonWrapper}>
                    <MainAsyncButton onPress={handlePress} disabled={!validTaxId} loading={loading}/>
                </View>
            </View>
        </ScreenWrapper>
    );
}

