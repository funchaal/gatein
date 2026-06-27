import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, Animated, Dimensions, Pressable, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../constants/colors';
import CodeInput from '../register-screens/PhoneCode/components/CodeInput';
import { useVerifyEmailValidationCodeMutation, useSendEmailValidationCodeMutation } from '../../services/api';
import { updateUser, dismissEmailPrompt } from '../../store/slices/authSlice';
import { useDispatch } from 'react-redux';
import LoadingModal from '../../components/ui/LoadingModal';
import MainAsyncButton from '../../components/ui/MainAsyncButton';

const { height } = Dimensions.get('window');

export default function EmailCodeScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const dispatch = useDispatch();

    const email = route.params?.email || 'seu e-mail';
    const isUpdate = route.params?.isUpdate ?? false;

    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [isInvalidCode, setIsInvalidCode] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const [verifyEmailValidationCode] = useVerifyEmailValidationCodeMutation();
    const [sendEmailValidationCode, { isLoading: isResending }] = useSendEmailValidationCodeMutation();

    useEffect(() => {
        navigation.setOptions({
            headerTitle: '',
            headerLeft: () => (
                <Pressable
                    onPress={() => navigation.goBack()}
                    style={({ pressed }) => [
                        {
                            marginLeft: 24,
                            width: 36,
                            height: 36,
                            borderRadius: 18,
                            backgroundColor: 'rgba(249, 115, 22, 0.08)',
                            alignItems: 'center',
                            justifyContent: 'center',
                        },
                        pressed && { opacity: 0.7 }
                    ]}
                >
                    <Icon name="chevron-back" size={24} color={COLORS.primary} />
                </Pressable>
            ),
        });
    }, [navigation]);

    const handleNext = async (code) => {
        setLoading(true);
        setErrorMsg('');
        setIsInvalidCode(false);

        try {
            const result = await verifyEmailValidationCode({ email, code }).unwrap();
            dispatch(updateUser(result.data.user));
            setShowSuccessModal(true);
        } catch (error) {
            setIsInvalidCode(true);
            setErrorMsg(error?.data?.detail?.message || error?.data?.error?.message || 'Código inválido ou expirado.');
        } finally {
            setLoading(false);
        }
    };

    const handleSuccessConfirm = () => {
        setShowSuccessModal(false);
        dispatch(dismissEmailPrompt());
        if (isUpdate) {
            navigation.navigate('PersonalData');
        }
    };

    const handleResend = async () => {
        setErrorMsg('');
        setIsInvalidCode(false);
        try {
            await sendEmailValidationCode({ email }).unwrap();
            Alert.alert("Código Enviado", "Um novo código foi enviado para o seu e-mail.");
        } catch (error) {
            Alert.alert("Erro", "Não foi possível reenviar o código.");
        }
    };

    return (
        <ScreenWrapper>
            <View style={styles.container}>
                <View style={styles.content}>
                    <View style={styles.iconBadge}>
                        <MaterialCommunityIcons name="email-check-outline" size={34} color={COLORS.primary} />
                    </View>
                    <Text style={styles.title}>Validação do e-mail</Text>
                    <Text style={styles.subtitle}>
                        Enviamos um código de 4 números para {'\n'}
                        <Text style={{fontWeight: 'bold', color: COLORS.textSecondary}}>{email}</Text>.
                    </Text>

                    <View style={styles.inputWrapper}>
                        <CodeInput 
                            onComplete={handleNext}
                            error={isInvalidCode}
                            onErrorDismiss={() => {
                                setIsInvalidCode(false);
                                setErrorMsg('');
                            }}
                        />
                        <Text style={styles.errorText}>
                            {errorMsg || ''} 
                        </Text>
                    </View>
                </View>
                
                <Pressable onPress={handleResend} disabled={isResending} style={styles.resendButton}>
                    <Text style={styles.resendText}>
                        {isResending ? "Reenviando..." : "Não recebi o código. Reenviar"}
                    </Text>
                </Pressable>
                
                <View/> 
            </View>

            <LoadingModal visible={loading} text="Validando código..." />

            <SuccessModal 
                visible={showSuccessModal}
                title="E-mail verificado"
                subtitle="Seu e-mail foi verificado e atualizado com sucesso!"
                onConfirm={handleSuccessConfirm}
            />
        </ScreenWrapper>
    );
}

const SuccessModal = ({ visible, title, subtitle, onConfirm }) => {
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
        <Modal transparent visible={showModal} animationType="none" statusBarTranslucent onRequestClose={onConfirm}>
            <View style={modalStyles.overlay}>
                <Animated.View style={[modalStyles.backdrop, { opacity }]} />
                <Animated.View style={[
                    modalStyles.modalContainer,
                    { transform: [{ translateY: panY }] }
                ]}>
                    <View style={modalStyles.content}>
                        <View style={modalStyles.iconBadge}>
                            <MaterialCommunityIcons name="check-circle" size={38} color="#22c55e" />
                        </View>
                        <Text style={modalStyles.title}>{title}</Text>
                        <Text style={modalStyles.subtitle}>{subtitle}</Text>
                        
                        <View style={{ width: '100%' }}>
                            <MainAsyncButton 
                                title="Ok"
                                onPress={onConfirm}
                            />
                        </View>
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
    iconBadge: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: 'rgba(34, 197, 94, 0.08)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0F172A',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 15,
        color: '#64748B',
        marginBottom: 24,
        textAlign: 'center',
        lineHeight: 20,
    }
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        paddingVertical: 10,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    iconBadge: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: `${COLORS.primary}18`,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 30,
        color: COLORS.textSecondary,
        marginBottom: 8,
        lineHeight: 38,
        fontWeight: '700',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 15,
        color: COLORS.muted,
        marginBottom: 40,
        lineHeight: 22,
        textAlign: 'center',
        maxWidth: '90%',
    },
    inputWrapper: {
        width: '100%',
        alignItems: 'center',
    },
    errorText: {
        color: COLORS.error || '#ef4444',
        fontSize: 14,
        marginTop: 12,
        height: 20,
        textAlign: 'center',
    },
    resendButton: {
        alignSelf: 'center',
        paddingVertical: 12,
        marginBottom: 24,
    },
    resendText: {
        color: COLORS.primary,
        fontWeight: '600',
        fontSize: 14,
    }
});
