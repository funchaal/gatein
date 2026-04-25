import React, { useState, useEffect } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    LayoutAnimation,
    UIManager,
    Keyboard,
    Alert
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context'; 
import { useSelector, useDispatch } from 'react-redux';

// Components
import CpfStep from './components/CpfStep';
import PasswordStep from './components/PasswordStep';

// Store & Utils
import { clearError } from '../../store/slices/authSlice';
import { useLoginMutation } from '../../services/api';
import { isValidCPF } from '../../utils/validators';
import { maskCPF } from '../../utils/masks';
import { styles } from './Login.styles';
import { cleanTaxIdString, getInitialCpf, getInitialStep } from './helpers';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function LoginScreen({ navigation, route }) {
    const dispatch = useDispatch();
    const { savedTaxId, error: authError } = useSelector((state) => state.auth);
    const [loginMutation] = useLoginMutation();

    const initialCpf = getInitialCpf(route?.params?.tax_id, savedTaxId);
    const initialStep = getInitialStep(initialCpf);

    const [step, setStep] = useState(initialStep);
    const [cpf, setCpf] = useState(initialCpf ? maskCPF(initialCpf) : '');
    const [password, setPassword] = useState('');
    
    const [cpfError, setCpfError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [loading, setLoading] = useState(false);
    const [validCpf, setValidCpf] = useState(false);
    
    // Limpar erros ao trocar de step
    useEffect(() => {
        if (step === 'cpf') setPasswordError('');
        else setCpfError('');
    }, [step]);
    
    // Validação de CPF com debounce
    useEffect(() => {
        setCpfError('');
        if (cpf.length < 2) {
            setValidCpf(false);
            return;
        }

        const is_valid = isValidCPF(cpf);
        setValidCpf(is_valid);

        const timeoutId = setTimeout(() => {
            if (!is_valid && cpf.length > 1) { 
                setCpfError('CPF inválido.');
            }
        }, 1000);

        return () => clearTimeout(timeoutId);
    }, [cpf]);

    // Limpar erro de senha ao digitar
    useEffect(() => {
        setPasswordError('');
        dispatch(clearError());
    }, [password, dispatch]);

    // Preencher CPF automaticamente se vier do savedTaxId
    useEffect(() => {
        if (savedTaxId && !cpf) {
            setCpf(maskCPF(savedTaxId));
            setStep('password');
        }
    }, [savedTaxId, cpf]);

    // Tratar erro de dispositivo não validado
    useEffect(() => {
        if (authError?.data?.error?.code === 'DEVICE_NOT_VALIDATED') {
            Alert.alert(
                'Dispositivo não autorizado',
                authError?.data?.error?.message || 'Este dispositivo não está autorizado. Entre em contato com o suporte.',
                [
                    {
                        text: 'OK',
                        onPress: () => dispatch(clearError())
                    }
                ]
            );
        }
    }, [authError, dispatch]);

    const handleSwitchAccount = () => {
        dispatch(clearError());
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setStep('cpf');
        setCpf('');
        setPassword('');
        setPasswordError('');
        setCpfError('');
    };

    const handleContinue = async () => {
        if (step === 'cpf') {
            if (validCpf) {
                Keyboard.dismiss();
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setStep('password');
            }
        } else {
            setLoading(true);
            setPasswordError('');
            dispatch(clearError());
            
            try {
                const cleanTaxId = cleanTaxIdString(cpf);
                const login_payload = { tax_id: cleanTaxId, password };
                
                // Dispara o login e espera o resultado
                await loginMutation(login_payload).unwrap();
                
            } catch (error) {
                const { data, status } = error;
                const cleanTaxId = cleanTaxIdString(cpf);
                const login_payload = { tax_id: cleanTaxId, password };

                // ✅ Mapeia o erro buscando tanto no padrão FastAPI (detail) quanto no fallback (error)
                const errorCode = data?.detail?.code || data?.error?.code || error?.code;

                if (status === 404 && errorCode === 'USER_NOT_FOUND') {
                    navigation.replace('UserNotFound', { tax_id: cleanTaxId });
                } 
                else if (status === 403 && errorCode === 'DEVICE_NOT_VALIDATED') {
                    navigation.replace('DriverLicenseNumber', { 
                        from_login: true, 
                        login_payload 
                    });
                }
                else if (status === 401 && errorCode === 'PASSWORD_INVALID') {
                    // O erro de senha fica na tela atual
                    setPasswordError('Senha incorreta.');
                }
                else if (errorCode === 'DEVICE_ID_ERROR') {
                    setPasswordError('Não foi possível identificar o dispositivo.');
                }
                else {
                    setPasswordError('Ocorreu um erro inesperado. Tente novamente.');
                    console.error('Login error:', error);
                }
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"} 
                style={styles.content}
            >
                {step === 'cpf' ? (
                    <CpfStep 
                        cpf={cpf}
                        setCpf={setCpf}
                        cpfError={cpfError}
                        validCpf={validCpf}
                        loading={loading}
                        handleContinue={handleContinue}
                        navigation={navigation}
                    />
                ) : (
                    <PasswordStep 
                        cpf={cpf}
                        password={password}
                        setPassword={setPassword}
                        passwordError={passwordError}
                        loading={loading}
                        handleContinue={handleContinue}
                        handleSwitchAccount={handleSwitchAccount}
                        routeMessage={route?.params?.message}
                    />
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}