import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Keyboard, Modal, Animated, Dimensions, Pressable, BackHandler } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import Icon from 'react-native-vector-icons/Ionicons';
import { useChangePasswordMutation } from '../../services/api';
import Input from '../../components/ui/Input';
import MainAsyncButton from '../../components/ui/MainAsyncButton';
import LoadingModal from '../../components/ui/LoadingModal';
import { COLORS } from '../../constants/colors';
import { globalStyles } from '../../constants/styles';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { styles } from './Security.styles';

const { height } = Dimensions.get('window');

export default function ResetPasswordScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const token = route?.params?.token;
    const origin = route?.params?.origin || 'Security';
    const tax_id = route?.params?.tax_id;

    // Set up back button to go back to origin if pressed
    useEffect(() => {
        navigation.setOptions({
            headerTitle: '',
            headerLeft: () => (
                <Pressable
                    onPress={() => navigation.navigate(origin)}
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

        // Handle hardware back press for Android
        const onBackPress = () => {
            navigation.navigate(origin);
            return true;
        };

        BackHandler.addEventListener('hardwareBackPress', onBackPress);
        return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [navigation, origin]);

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [validPasswords, setValidPasswords] = useState(false);

    const [showExpiredModal, setShowExpiredModal] = useState(false);

    const [changePassword, { isLoading }] = useChangePasswordMutation();

    useEffect(() => {
        setError('');

        if (!newPassword || !confirmPassword) {
            setValidPasswords(false);
            return;
        }

        const match = newPassword === confirmPassword;
        setValidPasswords(match);

        const timeoutId = setTimeout(() => {
            if (!match) setError('As senhas não coincidem.');
        }, 1000);

        return () => clearTimeout(timeoutId);
    }, [newPassword, confirmPassword]);

    const handleSavePress = async () => {
        Keyboard.dismiss();

        try {
            const response = await changePassword({
                new_password: newPassword,
                token: token
            }).unwrap();

            if (response.success || response) {
                navigation.navigate('ResetPasswordSuccess', { origin, tax_id });
            }
        } catch (err) {
            if (err?.status === 401) {
                setShowExpiredModal(true);
            } else {
                setError(err?.data?.error?.message || err?.data?.detail?.message || "Falha ao redefinir a senha.");
            }
        }
    };

    const handleExpiredOk = () => {
        setShowExpiredModal(false);
        navigation.goBack();
    };

    return (
        <ScreenWrapper>
            <View style={styles.container}>
                <View style={styles.content}>
                    <View style={styles.iconBadge}>
                        <MaterialCommunityIcons name="lock-reset" size={34} color={COLORS.primary} />
                    </View>
                    <Text style={styles.title}>Defina uma nova senha</Text>
                    <Text style={styles.subtitle}>Sua nova senha deve ser diferente da anterior.</Text>

                    <View style={styles.inputContainer}>
                        <Input
                            label='Nova Senha'
                            placeholder='Digite sua nova senha'
                            secureTextEntry={true}
                            value={newPassword}
                            onChangeText={setNewPassword}
                            width="100%"
                        />
                        <Input
                            label='Confirmar Nova Senha'
                            placeholder='Repita a nova senha'
                            secureTextEntry={true}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            error={error}
                            width="100%"
                        />
                    </View>
                </View>

                <View style={styles.buttonWrapper}>
                    <MainAsyncButton
                        title="Salvar senha"
                        onPress={handleSavePress}
                        disabled={!validPasswords}
                    />
                </View>
            </View>
            <ExpiredModal
                visible={showExpiredModal}
                onClose={handleExpiredOk}
            />

            <LoadingModal visible={isLoading} text="Redefinindo senha..." />
        </ScreenWrapper>
    );
}

const ExpiredModal = ({ visible, onClose }) => {
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
                        <Text style={modalStyles.title}>Sessão expirada</Text>
                        <Text style={modalStyles.subtitle}>Sua validação expirou. Por favor, verifique sua senha atual novamente.</Text>

                        <View style={{ height: 12 }} />
                        <View style={{ width: '100%' }}>
                            <MainAsyncButton
                                title="Voltar"
                                onPress={onClose}
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

