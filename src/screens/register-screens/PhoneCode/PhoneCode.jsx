import React, { useState, useRef, useEffect } from "react";
import { View, Text, Modal, Animated, Dimensions, StyleSheet } from "react-native";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ScreenWrapper from "../../../components/common/ScreenWrapper";
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector, useDispatch } from "react-redux";

import { COLORS } from "../../../constants/colors";
import CodeInput from "./components/CodeInput";
import { useCheckPhoneValidationCodeRequestMutation, useUpdateProfilePhoneMutation } from '../../../services/api';
import { updateUser } from '../../../store/slices/authSlice';
import LoadingModal from "../../../components/ui/LoadingModal";
import MainAsyncButton from "../../../components/ui/MainAsyncButton";
import { ResendCodeButton } from "./components/ResendCodeButton";
import { styles } from "./PhoneCode.styles";

const { height } = Dimensions.get('window');

export default function PhoneCode() {
    const navigation = useNavigation();
    const route = useRoute();
    const dispatch = useDispatch();

    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [isInvalidCode, setIsInvalidCode] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    
    const [checkPhoneValidationCode] = useCheckPhoneValidationCodeRequestMutation();
    const [updateProfilePhone] = useUpdateProfilePhoneMutation();
    const phone = route.params?.phone || "seu celular";

    const tax_id = useSelector((state) => state.register?.user?.tax_id);
    const name = useSelector((state) => state.register?.user?.name);

    const handleNext = async (code) => {
        setLoading(true);
        setErrorMsg('');
        setIsInvalidCode(false);

        const isUpdate = route.params?.isUpdate;

        try {
            if (isUpdate) {
                const result = await updateProfilePhone({ phone: phone, code: code }).unwrap();
                dispatch(updateUser(result.data.user));
                setShowSuccessModal(true);
            } else {
                await checkPhoneValidationCode({ tax_id: tax_id, name: name, phone: phone, code: code }).unwrap(); 
                
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'DriverLicenseNumber' }],
                });
            }
        } catch (error) {
            setIsInvalidCode(true); // Visually mark the input as invalid

            if (error?.data?.detail?.code === 'PHONE_VALIDATION_CODE_INVALID') {
                setErrorMsg('Código inválido');
            } else if (error?.data?.detail?.code === 'TAX_ID_AND_PHONE_MISMATCH') {
                setErrorMsg('Código incorreto.');
            } else {
                setErrorMsg(error?.data?.detail?.message || "Ocorreu um erro inesperado.");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <ScreenWrapper>
            <View style={styles.container}>
                <View style={styles.content}>
                    <View style={styles.iconBadge}>
                        <MaterialCommunityIcons name="message-text-lock-outline" size={34} color={COLORS.primary} />
                    </View>
                    <Text style={styles.title}>Validação do celular</Text>
                    <Text style={styles.subtitle}>
                        Enviamos um código de 4 números para {'\n'}
                        <Text style={{fontWeight: 'bold', color: COLORS.textSecondary}}>{phone}</Text> via SMS.
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
                <ResendCodeButton phone={phone} />
                
                <View/> 
            </View>

            {/* O MODAL FICA AQUI */}
            <LoadingModal visible={loading} text="Validando código..." />

            <SuccessModal 
                visible={showSuccessModal}
                title="Celular atualizado"
                subtitle="Seu número de celular foi verificado e atualizado com sucesso!"
                onConfirm={() => {
                    setShowSuccessModal(false);
                    navigation.navigate('PersonalData');
                }}
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
