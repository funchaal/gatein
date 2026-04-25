import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from '@react-navigation/native';
import Input from "../../components/common/Input";
import { COLORS } from "../../constants/colors";
import { useDispatch } from "react-redux";

// ✅ Importe também o useLoginMutation
import { useValidateDriverLicenseRequestMutation, useLoginMutation } from "../../services/api";
import { globalStyles } from "../../constants/styles";
import MainAsyncButton from "../../components/common/MainAsyncButton";
import LoadingModal from "../../components/common/LoadingModal";

export default function DriverLicenseNumberScreen({ route }) {
    const navigation = useNavigation();
    const [driverLicense, setDriverLicense] = useState('');
    const [validDriverLicense, setValidDriverLicense] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const taxId = route?.params?.login_payload?.tax_id || route?.params?.tax_id;
    const fromLogin = route?.params?.from_login || false;
    // ✅ Pegue o payload completo que veio da tela de login (tax_id e password)
    const loginPayload = route?.params?.login_payload; 

    const dispatch = useDispatch();
    const [validateDriverLicense] = useValidateDriverLicenseRequestMutation();
    // ✅ Instancie a mutation de login
    const [login] = useLoginMutation(); 

    const handleNext = async () => {
        setLoading(true);
        setError('');
        try {
            // 1. Valida a CNH
            await validateDriverLicense({ 
                tax_id: taxId, 
                driver_license: driverLicense,
                from_login: fromLogin 
            }).unwrap();

            // 2. Decide o próximo passo
            if (fromLogin && loginPayload) {
                // ✅ Se veio do Login, executa o auto-login
                await login(loginPayload).unwrap();
                
                // Nota: Não precisamos dar um navigation.navigate ou replace aqui.
                // Como o seu authSlice ouve o sucesso do login e altera o estado global, 
                // o seu StateGate/AppNavigator vai automaticamente renderizar as rotas internas!
            } else {
                // ✅ Se veio do Registro, segue para a criação de senha
                navigation.reset({
                    index: 0,
                    routes: [{ 
                        name: 'Password',
                        params: { tax_id: taxId } // É recomendado repassar o taxId
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
            // ✅ Pequeno fallback caso o auto-login dê algum erro de senha
            else if (errorCode === 'PASSWORD_INVALID') {
                 setError('Erro ao realizar login automático. Volte e tente novamente.');
            }
            else {
                console.log("Erro ao validar CNH:", err);
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