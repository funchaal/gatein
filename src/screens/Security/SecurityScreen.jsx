import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Text, Modal, Animated, Dimensions, Pressable, Keyboard } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import { useVerifyCurrentPasswordMutation } from '../../services/api';
import ListItem from '../../components/ui/ListItem';
import ListSeparator from '../../components/ui/ListSeparator';
import ScreenHeader from '../../components/ui/ScreenHeader';
import { Lock, Key, LogOut, ChevronRight } from 'lucide-react-native';
import Input from '../../components/ui/Input';
import MainAsyncButton from '../../components/ui/MainAsyncButton';
import LoadingModal from '../../components/ui/LoadingModal';
import { COLORS } from '../../constants/colors';
import { globalStyles } from '../../constants/styles';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';

const { height } = Dimensions.get('window');

export default function SecurityScreen() {
    const navigation = useNavigation();
    const dispatch = useDispatch();

    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const handleLogoutPress = () => {
        setShowLogoutModal(true);
    };

    const handleLogoutConfirm = () => {
        setShowLogoutModal(false);
        dispatch(logout());
    };

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [currentPasswordError, setCurrentPasswordError] = useState('');

    const [verifyCurrentPassword, { isLoading }] = useVerifyCurrentPasswordMutation();

    const handleResetPasswordPress = () => {
        setCurrentPassword('');
        setCurrentPasswordError('');
        setShowConfirmModal(true);
    };

    const handleForgotPasswordPress = () => {
        navigation.navigate('ForgotPassword', { origin: 'Security' });
    };

    const handleConfirm = async () => {
        if (!currentPassword) {
            setCurrentPasswordError('A senha atual é obrigatória.');
            return;
        }
        
        Keyboard.dismiss();
        
        // Descer o modal de confirmação primeiro
        setShowConfirmModal(false);
        
        // Aguardar o tempo da animação do modal descer antes de iniciar a request
        setTimeout(async () => {
            try {
                const response = await verifyCurrentPassword({ current_password: currentPassword }).unwrap();
                
                // Em caso de sucesso, pega o token da resposta e vai para a tela de nova senha
                const token = response?.token || response?.data?.token || response;
                if (token) {
                    navigation.navigate('ResetPassword', { token });
                }
            } catch (err) {
                // Caso erro, exibir novamente o modal de confirmação
                if (err?.status === 401 && err?.data?.detail?.code === 'CURRENT_PASSWORD_INVALID') {
                    setCurrentPasswordError('Senha atual inválida.');
                } else {
                    setCurrentPasswordError(err?.data?.error?.message || err?.data?.detail?.message || "Falha ao verificar a senha.");
                }
                setShowConfirmModal(true);
            }
        }, 300);
    };

    return (
        <ScreenWrapper noPadding={true}>
            <ScreenHeader title="Segurança" noBorder={true} />

            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                <ListItem 
                    title="Redefinir senha" 
                    onPress={handleResetPasswordPress}
                    rightElement={<ChevronRight size={18} color="#94A3B8" />}
                    leftElement={<Lock size={22} color="#666666" />}
                />
                <ListSeparator />
                <ListItem 
                    title="Esqueci minha senha" 
                    onPress={handleForgotPasswordPress}
                    rightElement={<ChevronRight size={18} color="#94A3B8" />}
                    leftElement={<Key size={22} color="#666666" />}
                />

                {/* Spacer to push logout down */}
                <View style={styles.logoutSpacer} />

                {/* Logout option - styled as red ListItem */}
                <ListSeparator />
                <ListItem 
                    title="Desconectar" 
                    titleStyle={{ color: '#EF4444' }}
                    onPress={handleLogoutPress}
                    leftElement={<LogOut size={22} color="#EF4444" />}
                />
            </ScrollView>

            <LogoutModal
                visible={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={handleLogoutConfirm}
            />

            <ConfirmModal 
                visible={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                currentPassword={currentPassword}
                setCurrentPassword={setCurrentPassword}
                error={currentPasswordError}
                onConfirm={handleConfirm}
            />

            <LoadingModal visible={isLoading && !showConfirmModal} text="Verificando..." />
        </ScreenWrapper>
    );
}

const ConfirmModal = ({ visible, onClose, currentPassword, setCurrentPassword, error, onConfirm }) => {
    const panY = useRef(new Animated.Value(height)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const [showModal, setShowModal] = useState(visible);

    useEffect(() => {
        if (visible) {
            setShowModal(true);
            Animated.parallel([
                Animated.spring(panY, {
                    toValue: 0,
                    useNativeDriver: true,
                    damping: 20,
                    stiffness: 150
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(panY, {
                    toValue: height,
                    duration: 250,
                    useNativeDriver: true
                }),
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true
                }),
            ]).start(() => {
                setShowModal(false);
            });
        }
    }, [visible, opacity, panY]);

    if (!showModal) return null;

    return (
        <Modal transparent visible={showModal} animationType="none" statusBarTranslucent onRequestClose={onClose}>
            <View style={modalStyles.overlay}>
                <Animated.View style={[modalStyles.backdrop, { opacity }]} />
                <Animated.View style={[
                    modalStyles.modalContainer,
                    { transform: [{ translateY: panY }] }
                ]}>
                    <View style={modalStyles.content}>
                        <Text style={modalStyles.title}>Confirmar identidade</Text>
                        <Text style={modalStyles.subtitle}>Digite sua senha atual para continuar.</Text>
                        
                        <View style={{ width: '100%', marginBottom: 20 }}>
                            <Input 
                                label="Senha Atual"
                                placeholder="Digite sua senha atual"
                                secureTextEntry={true}
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                                error={error}
                            />
                        </View>

                        <View style={{ width: '100%' }}>
                            <MainAsyncButton 
                                title="Confirmar"
                                onPress={onConfirm}
                            />
                        </View>
                        <View style={{ height: 12 }} />
                        <Pressable 
                            style={[globalStyles.outlineButton, { width: '100%', height: 56 }]} 
                            onPress={onClose}
                        >
                            <Text style={globalStyles.outlineButtonText}>Cancelar</Text>
                        </Pressable>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

const LogoutModal = ({ visible, onClose, onConfirm }) => {
    const panY = useRef(new Animated.Value(height)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const [showModal, setShowModal] = useState(visible);

    useEffect(() => {
        if (visible) {
            setShowModal(true);
            Animated.parallel([
                Animated.spring(panY, {
                    toValue: 0,
                    useNativeDriver: true,
                    damping: 20,
                    stiffness: 150
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(panY, {
                    toValue: height,
                    duration: 250,
                    useNativeDriver: true
                }),
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true
                }),
            ]).start(() => {
                setShowModal(false);
            });
        }
    }, [visible, opacity, panY]);

    if (!showModal) return null;

    return (
        <Modal transparent visible={showModal} animationType="none" statusBarTranslucent onRequestClose={onClose}>
            <View style={modalStyles.overlay}>
                <Animated.View style={[modalStyles.backdrop, { opacity }]} />
                <Animated.View style={[
                    modalStyles.modalContainer,
                    { transform: [{ translateY: panY }] }
                ]}>
                    <View style={modalStyles.content}>
                        <Text style={modalStyles.title}>Desconectar</Text>
                        <Text style={modalStyles.subtitle}>Deseja realmente desconectar?</Text>
                        
                        <View style={{ width: '100%' }}>
                            <MainAsyncButton 
                                title="Sair"
                                onPress={onConfirm}
                                style={{ backgroundColor: '#EF4444' }}
                            />
                        </View>
                        <View style={{ height: 12 }} />
                        <Pressable 
                            style={[globalStyles.outlineButton, { width: '100%', height: 56, borderColor: '#94A3B8' }]} 
                            onPress={onClose}
                        >
                            <Text style={[globalStyles.outlineButtonText, { color: '#666' }]}>Cancelar</Text>
                        </Pressable>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

const modalStyles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    modalContainer: {
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
    },
    content: {
        alignItems: 'center',
        width: '100%'
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.textPrimary || '#000',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textSecondary || '#666',
        marginBottom: 20,
        textAlign: 'center'
    }
});

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        paddingVertical: 16,
    },
    logoutSpacer: {
        flex: 1,
        minHeight: 48,
    },
});
