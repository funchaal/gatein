import React, { useState, useEffect, useCallback } from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    StyleSheet, 
    SafeAreaView, 
    KeyboardAvoidingView, 
    Platform,
    LayoutAnimation,
    UIManager
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Input from '../components/common/Input'; // Importe o componente criado acima

import { loginRequest } from '../store/slices/authSlice';
import { useFocusEffect } from '@react-navigation/native';

// Habilita animações no Android
// if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
//     UIManager.setLayoutAnimationEnabledExperimental(true);
// }

const COLORS = {
    primary: '#F97316', // Seu Laranja
    background: '#FFFFFF',
    text: '#1F2937',
    muted: '#6B7280'
};

export default function LoginScreen({ navigation }) {
    const dispatch = useDispatch();
    
    // Redux
    const { user, token } = useSelector((state) => state.auth);

    // Estados
    const [step, setStep] = useState('cpf'); // 'cpf' ou 'password'
    const [cpf, setCpf] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    useEffect(() => {
        setError('');
    }, [step]);

    // Verifica se já existe usuário salvo ao abrir a tela
    useEffect(() => {
        if (token && user?.tax_id) {
            setCpf(user.tax_id);
            setStep('password');
        }
    }, [token, user]);

    // Ação do Botão Principal
    const handleMainButton = async () => {
        if (step === 'cpf') {
            // Validação simples antes de avançar
            if (cpf.length < 11) {
                alert("Digite um CPF válido"); 
                return;
            }
            // Animação suave para troca de input
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setStep('password');
        } else {
            // Ação de Login Real
            console.log("Logando...", { cpf, password });
            try {
                setLoading(true)
                const user = await dispatch(loginRequest({ cpf, password })).unwrap();
                console.log("Login bem-sucedido:", user);
            } catch (error) {
                console.log("Erro no login:", error);
                setError(error);
            }
            finally {
                setLoading(false);
            }
            // dispatch(loginRequest({ cpf, password }));
        }
    };

    // Voltar para trocar a conta
    const handleSwitchAccount = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        // Se estiver logado, aqui você daria dispatch(logout())
        setStep('cpf');
        setCpf('');
        setPassword('');
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"} 
                style={styles.content}
            >
                {/* Cabeçalho */}
                <View style={styles.header}>
                    <Text style={styles.welcomeText}>
                        {step === 'cpf' ? 'Bem-vindo de volta!' : 'Quase lá...'}
                    </Text>
                    <Text style={styles.subText}>
                        {step === 'cpf' 
                            ? 'Informe seu CPF para acessar sua conta.' 
                            : 'Digite sua senha para entrar.'}
                    </Text>
                </View>

                {/* Área dos Inputs */}
                <View style={styles.formArea}>
                    
                    {/* SE ESTIVER NO PASSO SENHA: Mostra o CPF como uma "Caixinha" fixa */}
                    {step === 'password' && (
                        <View style={styles.cpfBadgeContainer}>
                            <View style={styles.cpfBadge}>
                                <View style={styles.avatarCircle}>
                                    <Text style={styles.avatarText}>
                                        {user?.name ? user.name[0] : 'U'}
                                    </Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.badgeLabel}>Acessando como</Text>
                                    <Text style={styles.badgeValue}>
                                        {user?.name || cpf}
                                    </Text>
                                </View>
                                {/* Botãozinho X pequeno para trocar rápido se quiser */}
                                <TouchableOpacity onPress={handleSwitchAccount} style={styles.changeUserIcon}>
                                    <Text style={{ color: COLORS.primary, fontSize: 12, fontWeight: 'bold' }}>ALTERAR</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {/* INPUT DE CPF (Só aparece se o passo for CPF) */}
                    {step === 'cpf' && (
                        <Input 
                            label="CPF"
                            placeholder="000.000.000-00"
                            value={cpf}
                            onChangeText={setCpf}
                            keyboardType="numeric"
                            autoFocus
                        />
                    )}

                    {/* INPUT DE SENHA (Só aparece se o passo for Password) */}
                    {step === 'password' && (
                        <>
                        <Input 
                            label="Senha"
                            placeholder="Sua senha secreta"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoFocus
                        />
                        <Text style={styles.errorText}>{error}</Text>
                        </>
                    )}

                    <TouchableOpacity 
                        style={styles.primaryButton} 
                        onPress={handleMainButton}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.buttonText}>
                            {step === 'cpf' ? 'Continuar' : loading ? 'Carregando...' : 'Entrar'}
                        </Text>
                    </TouchableOpacity>

                    {/* Links de Apoio */}
                    <View style={styles.footerLinks}>
                        {step === 'password' ? (
                            <TouchableOpacity onPress={() => console.log('Recuperar')}>
                                <Text style={styles.linkText}>Esqueci minha senha</Text>
                            </TouchableOpacity>
                        ) : null}

                        <TouchableOpacity 
                            onPress={step === 'password' ? handleSwitchAccount : () => navigation.navigate('Welcome')}
                            style={{ marginTop: 15 }}
                        >
                            <Text style={[styles.linkText, { fontWeight: 'bold' }]}>
                                {step === 'password' ? 'Entrar com outra conta' : 'Ainda não tem conta? Crie agora'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    header: {
        marginBottom: 32,
    },
    welcomeText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 8,
    },
    subText: {
        fontSize: 16,
        color: COLORS.muted,
    },
    formArea: {
        width: '100%',
    },
    // Estilos da "Caixinha" do CPF
    cpfBadgeContainer: {
        marginBottom: 10,
    },
    cpfBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF4E5', // Laranja bem clarinho
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#FED7AA', // Laranja borda suave
    },
    avatarCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 18,
    },
    badgeLabel: {
        fontSize: 12,
        color: COLORS.muted,
    },
    badgeValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    changeUserIcon: {
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    // Botão Principal
    primaryButton: {
        backgroundColor: COLORS.primary,
        height: 56,
        borderRadius: 12, // Igual ao input
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    footerLinks: {
        marginTop: 24,
        alignItems: 'center',
    },
    linkText: {
        color: COLORS.muted,
        fontSize: 14,
    }, 
    errorText: {
        color: '#DC2626',
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    }

});