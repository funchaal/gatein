import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    LayoutAnimation,
    UIManager,
    Keyboard,
    TouchableOpacity,
    Alert
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context'; 
import { useSelector, useDispatch } from 'react-redux';

// Components
import Input from '../components/common/Input';
import MainAsyncButton from '../components/common/MainAsyncButton';
import SecondaryButton from '../components/common/SecondaryButton';

// Store & Utils
import { loginRequest, clearError } from '../store/slices/authSlice';
import { isValidCPF } from '../utils/validators';
import { maskCPF } from '../utils/masks';
import { COLORS } from '../constants/colors';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function LoginScreen({ navigation, route }) {
    const dispatch = useDispatch();
    const { savedTaxId, error: authError } = useSelector((state) => state.auth);

    // Prioriza: route params > savedTaxId do Keychain
    const initialCpf = route?.params?.tax_id || savedTaxId || '';
    const initialStep = initialCpf ? 'password' : 'cpf';

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
    }, [savedTaxId]);

    // Tratar erro de dispositivo não validado
    useEffect(() => {
        if (authError?.data?.error?.code === 'DEVICE_NOT_VALIDATED') {
            Alert.alert(
                'Dispositivo não autorizado',
                authError.data.error.message || 'Este dispositivo não está autorizado. Entre em contato com o suporte.',
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
                const cleanTaxId = cpf.replace(/\D/g, '');
                const login_payload = { tax_id: cleanTaxId, password };
                
                // Dispatch login - credenciais serão salvas automaticamente no Keychain
                await dispatch(loginRequest(login_payload)).unwrap();
                
                // Se chegou aqui, login foi bem-sucedido
                // O AppNavigator vai redirecionar automaticamente

            } catch (error) {
                // Tratar erros específicos
                const { data, status } = error;
                const cleanTaxId = cpf.replace(/\D/g, '');
                const login_payload = { tax_id: cleanTaxId, password };

                if (status === 404 && data?.error?.code === 'USER_NOT_FOUND') {
                    // Usuário não encontrado -> tela de cadastro
                    navigation.replace('UserNotFound', { tax_id: cleanTaxId });
                } 
                else if (status === 403 && data?.error?.code === 'DEVICE_NOT_VALIDATED') {
                    // Dispositivo não validado -> validar CNH
                    navigation.replace('DriverLicenseNumber', { 
                        from_login: true, 
                        login_payload 
                    });
                }
                else if (status === 401 && data?.error?.code === 'PASSWORD_INVALID') {
                    // Senha incorreta
                    setPasswordError(data.error.message || 'Senha incorreta');
                }
                else if (error?.code === 'DEVICE_ID_ERROR') {
                    // Erro ao obter device ID
                    setPasswordError('Não foi possível identificar o dispositivo');
                }
                else {
                    // Erro genérico
                    setPasswordError('Ocorreu um erro inesperado. Tente novamente.');
                    console.error('Login error:', error);
                }
            } finally {
                setLoading(false);
            }
        }
    };

    const renderUserBadge = () => (
        <View style={styles.cpfBadgeContainer}>
            <View style={styles.cpfBadge}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.badgeLabel}>Acessando como</Text>
                    <Text style={styles.badgeValue}>
                        {maskCPF(cpf)}
                    </Text>
                </View>
                <TouchableOpacity onPress={handleSwitchAccount} style={styles.changeUserIcon}>
                    <Text style={styles.changeUserText}>ALTERAR</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderCpfStep = () => (
        <View style={styles.formArea}>
            <View style={styles.mainSection}>
                <View style={styles.logoContainer}>
                    <Text style={styles.title}>GateIn</Text>
                </View>
                
                <View style={styles.inputContainer}>
                    <Text style={styles.subtitle}>Acesse sua conta</Text>
                    <Input 
                        label="Insira seu CPF"
                        placeholder="000.000.000-00"
                        value={cpf}
                        onChangeText={(text) => setCpf(maskCPF(text))}
                        keyboardType="numeric"
                        autoFocus
                        error={cpfError}
                        maxLength={14}
                    />
                </View>
            </View>

            <View style={styles.footerLinks}>
                <SecondaryButton
                    title="Criar uma conta agora"
                    onPress={() => navigation.navigate('TaxId')}
                    style={{ marginBottom: 12 }}
                />
                <MainAsyncButton 
                    title="Continuar"
                    onPress={handleContinue}
                    disabled={!validCpf}
                    loading={loading}
                />
            </View>
        </View>
    );

    const renderPasswordStep = () => (
        <View style={styles.formArea}>
            <View style={[styles.mainSection, { height: '65%' }]}>
                <View style={styles.logoContainer}>
                    <Text style={styles.title}>GateIn</Text>
                </View>

                <View style={styles.inputContainer}>
                    {renderUserBadge()}

                    {route?.params?.message && (
                        <Text style={styles.infoMessage}>{route.params.message}</Text>
                    )}

                    <Input 
                        label="Insira sua senha"
                        placeholder="***********"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        autoFocus
                        error={passwordError}
                    />
                    <MainAsyncButton 
                        title="Entrar"
                        onPress={handleContinue}
                        disabled={!password}
                        loading={loading}
                        style={{ marginTop: 20 }}
                    />
                </View>
            </View> 

            <SecondaryButton
               title="Esqueci minha senha"
               style={{ marginBottom: 12 }}
            />
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"} 
                style={styles.content}
            >
                {step === 'cpf' ? renderCpfStep() : renderPasswordStep()}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background || '#F5F5F5',
        padding: 24, 
        paddingBottom: 0
    },
    content: {
        flex: 1,
    },
    formArea: {
        flex: 1, 
        justifyContent: 'space-between',
        width: '100%',
    },
    mainSection: {
        height: '50%', 
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    logoContainer: {
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        width: '100%',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    subtitle: {
        fontSize: 20, 
        fontWeight: 'bold', 
        color: COLORS.textSecondary, 
        marginBottom: 20 
    },
    inputContainer: {
        width: '100%',
    },
    cpfBadgeContainer: {
        marginBottom: 30,
    },
    cpfBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.card || '#f7f7f7ff', 
        borderRadius: 15,
        padding: 16,
    },
    badgeLabel: {
        fontSize: 16,
        color: COLORS.muted || '#888',
    },
    badgeValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    changeUserIcon: {
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    changeUserText: {
        color: COLORS.primary, 
        fontSize: 14, 
        fontWeight: 'bold', 
    },
    footerLinks: {
        paddingBottom: 20,
    },
    infoMessage: {
        color: COLORS.text,
        textAlign: 'center',
        marginBottom: 20,
        fontSize: 16,
        fontWeight: 'bold'
    },
});