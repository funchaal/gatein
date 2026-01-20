import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, Pressable, Keyboard } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { handleRegistrationStep } from "../../utils/tools";
import { maskCPF } from '../../utils/masks';
import Input from "../../components/common/Input";
import { COLORS } from "../../constants/colors";
import { useDispatch } from "react-redux";
import { registerTaxIdRequest } from "../../store/slices/registerSlice";
import { isValidCPF } from '../../utils/validators';
import { globalStyles } from "../../constants/styles";

import MainAsyncButton from "../../components/common/MainAsyncButton";

export default function TaxIdScreen({ navigation }) {
    const [taxId, setTaxId] = useState('');
    const [validTaxId, setValidTaxId] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const dispatch = useDispatch();

    useEffect(() => {
        setError(''); 

        if (taxId.length < 2) {
            setValidTaxId(false);
            setError('');
            return;
        }

        const is_valid = isValidCPF(taxId)
        
        setValidTaxId(is_valid);

        if (validTaxId) Keyboard.dismiss();

        const timeoutId = setTimeout(() => {
            if (!is_valid) setError('CPF inválido.')
        }, 1000);

        return () => clearTimeout(timeoutId);

    }, [taxId]);

    const handlePress = async () => {
        setLoading(true);
        try {
            const cleanTaxId = taxId.replace(/\D/g, ''); 
            const result = await dispatch(registerTaxIdRequest({ tax_id: cleanTaxId })).unwrap();

            if (result.register_step === 'registered') {
                // User already has an account, redirect to login screen's password step
                navigation.navigate('Login', { 
                    tax_id: cleanTaxId, 
                    message: 'Você já tem uma conta!' 
                });
            } else if (result.data && result.data.user && result.data.user.register_step && result.data.user.register_step !== 'new') {
                // In-progress registration found
                navigation.navigate('InProgressConfirmation', {
                    tax_id: cleanTaxId,
                    name: result.data.user.name, // Assuming name is returned
                    register_step: result.data.user.register_step
                });
            } else if (result.data && result.data.user && result.data.user.register_step === 'new') {
                // New registration
                handleRegistrationStep(navigation, 'Name', { tax_id: cleanTaxId });
            } else {
                // Fallback for unexpected response
                setError('Ocorreu um erro inesperado. Tente novamente.');
            }

        } catch (err) { 
            setError(typeof err === 'string' ? err : 'Ocorreu um erro');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.content}>
                    <Text style={globalStyles.title}>Vamos criar uma {'\n'}conta para você</Text>
                    <Input 
                        label='CPF de quem vai usar a conta' 
                        placeholder='000.000.000-00' 
                        width='100%' 
                        onChangeText={(text) => setTaxId(maskCPF(text))} 
                        value={taxId} 
                        keyboardType="number-pad" 
                        maxLength={14}
                        error={error}
                    />
                </View>

                <MainAsyncButton onPress={handlePress} disabled={!validTaxId} loading={loading}/>
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
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10
    },
    content: {
        flex: 1,
    }
});