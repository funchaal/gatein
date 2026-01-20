import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    // SafeAreaView, // <--- REMOVIDO DAQUI
    KeyboardAvoidingView,
    Platform,
    LayoutAnimation,
    UIManager,
    Keyboard,
    Pressable,
    TouchableOpacity
} from 'react-native';

// --- ADICIONADO AQUI ---
import { SafeAreaView } from 'react-native-safe-area-context'; 

import { useSelector, useDispatch } from 'react-redux';

// Components
import Input from '../components/common/Input';
import MainAsyncButton from '../components/common/MainAsyncButton';

// Store & Utils
import { loginRequest } from '../store/slices/authSlice';
import { isValidCPF } from '../utils/validators';
import { maskCPF } from '../utils/masks';
import { COLORS } from '../constants/colors';
import SecondaryButton from '../components/common/SecondaryButton';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function LoginScreen({ navigation, route }) {
    const dispatch = useDispatch();
    const { user, token } = useSelector((state) => state.auth);

    const [step, setStep] = useState(route?.params?.tax_id ? 'password' : 'cpf');
    const [cpf, setCpf] = useState(route?.params?.tax_id || '');
    const [password, setPassword] = useState('');
    
    const [cpfError, setCpfError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [loading, setLoading] = useState(false);
    const [validCpf, setValidCpf] = useState(false);
    
    useEffect(() => {
        if (step === 'cpf') setPasswordError('');
        else setCpfError('');
    }, [step]);
    
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

    useEffect(() => {
        setPasswordError('');
    }, [password]);


    useEffect(() => {
        if (token && user?.tax_id) {
            setCpf(user.tax_id);
            setStep('password');
        }
    }, [token, user]);

    const handleSwitchAccount = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setStep('cpf');
        setCpf('');
        setPassword('');
        setPasswordError('');
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
            try {
                const cleanTaxId = cpf.replace(/\D/g, '');
                const login_payload = { tax_id: cleanTaxId, password };
                
                // O dispatch agora lida com o sucesso internamente.
                // Se der certo, o estado 'isAuthenticated' vai mudar e o AppNavigator
                // vai automaticamente levar para a tela principal.
                await dispatch(loginRequest(login_payload)).unwrap();

            } catch (error) {
                // O 'error' agora é o objeto que definimos no rejectWithValue
                const { data, status } = error;
                const cleanTaxId = cpf.replace(/\D/g, '');
                const login_payload = { tax_id: cleanTaxId, password };

                if (status === 404 && data.error.code === 'USER_NOT_FOUND') {
                    navigation.replace('UserNotFound', { tax_id: cleanTaxId });
                } 
                else if (status === 403 && data.error.code === 'DEVICE_NOT_VALIDATED') {
                    navigation.replace('DriverLicenseNumber', { from_login: true, login_payload });
                }
                else if (status === 401 && data.error.code === 'PASSWORD_INVALID') {
                    setPasswordError(data.error.message);
                }
                else {
                    // Erro genérico
                    setPasswordError('Ocorreu um erro inesperado. Tente novamente.');
                }
            } finally {
                setLoading(false);
            }
        }
    };

    const renderUserBadge = () => (
        <View style={styles.cpfBadgeContainer}>
            <View style={styles.cpfBadge}>
                {/* <View style={styles.avatarCircle}>
                    <Text style={styles.avatarText}>
                        {user?.name ? user.name[0] : 'U'}
                    </Text>
                </View> */}
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
        // O uso aqui permanece o mesmo, mas agora vem da biblioteca correta
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
    avatarCircle: {
        width: 45,
        height: 45,
        borderRadius: 30,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    avatarText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 18,
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