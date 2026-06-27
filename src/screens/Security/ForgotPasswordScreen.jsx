import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Keyboard, Modal, Animated, Dimensions, Pressable, BackHandler } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import Icon from 'react-native-vector-icons/Ionicons';
import { useForgotPasswordMutation } from '../../services/api';
import Input from '../../components/ui/Input';
import MainAsyncButton from '../../components/ui/MainAsyncButton';
import LoadingModal from '../../components/ui/LoadingModal';
import { COLORS } from '../../constants/colors';
import { globalStyles } from '../../constants/styles';
import { maskCPF } from '../../utils/masks';
import { isValidCPF } from '../../utils/validators';
import { cleanTaxIdString } from '../Login/helpers';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { styles } from './Security.styles';

const { height } = Dimensions.get('window');

export default function ForgotPasswordScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const origin = route?.params?.origin || 'Security';

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

    const [cpf, setCpf] = useState('');
    const [cnh, setCnh] = useState('');

    const [cpfError, setCpfError] = useState('');
    const [validCpf, setValidCpf] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);

    const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

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
                setCpfError('CPF inválido');
            }
        }, 1000);

        return () => clearTimeout(timeoutId);
    }, [cpf]);

    const handleContinuePress = async () => {
        if (!validCpf || !cnh) return;

        Keyboard.dismiss();

        try {
            const cleanCpf = cleanTaxIdString(cpf);
            const response = await forgotPassword({
                tax_id: cleanCpf,
                driver_license: cnh
            }).unwrap();

            if (response.success || response) {
                const phone = response?.data?.phone || response?.phone;
                navigation.navigate('ForgotPasswordCode', {
                    tax_id: cleanCpf,
                    phone,
                    origin
                });
            }
        } catch (err) {
            setShowErrorModal(true);
        }
    };

    return (
        <ScreenWrapper>
            <View style={styles.container}>
                <View style={styles.content}>
                    <View style={styles.iconBadge}>
                        <MaterialCommunityIcons name="shield-key-outline" size={34} color={COLORS.primary} />
                    </View>
                    <Text style={styles.title}>Esqueci minha senha</Text>
                    <Text style={styles.subtitle}>Para redefinir sua senha, precisamos confirmar sua identidade.</Text>

                    <View style={styles.inputContainer}>
                        <Input
                            label='CPF'
                            placeholder='000.000.000-00'
                            keyboardType='numeric'
                            value={cpf}
                            onChangeText={(text) => setCpf(maskCPF(text))}
                            error={cpfError}
                            width="100%"
                        />
                        <Input
                            label='Número de Registro (CNH)'
                            placeholder='Digite o número da sua CNH'
                            keyboardType='numeric'
                            value={cnh}
                            onChangeText={setCnh}
                            width="100%"
                        />
                    </View>
                </View>

                <View style={styles.buttonWrapper}>
                    <MainAsyncButton
                        title="Continuar"
                        onPress={handleContinuePress}
                        disabled={!validCpf || !cnh}
                    />
                </View>
            </View>

            <ErrorModal
                visible={showErrorModal}
                onClose={() => setShowErrorModal(false)}
            />

            <LoadingModal visible={isLoading && !showErrorModal} text="Verificando dados..." />
        </ScreenWrapper>
    );
}

const ErrorModal = ({ visible, onClose }) => {
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
                        <Icon name="alert-circle" size={60} color={COLORS.error || '#ef4444'} style={{ marginBottom: 12 }} />
                        <Text style={modalStyles.title}>Dados divergentes</Text>
                        <Text style={modalStyles.subtitle}>
                            Houve divergência nas informações inseridas com o que consta em nosso banco de dados.
                        </Text>

                        <View style={{ height: 12 }} />
                        <View style={{ width: '100%' }}>
                            <MainAsyncButton
                                title="Tentar novamente"
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

