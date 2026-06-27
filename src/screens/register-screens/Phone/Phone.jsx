import React, { useState, useEffect, useRef } from "react";
import { View, Text, Pressable, Modal, Keyboard, Animated, Dimensions, StyleSheet as RNStyleSheet } from "react-native";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ScreenWrapper from "../../../components/common/ScreenWrapper";
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from "react-redux";

import Input from "../../../components/ui/Input";
import MainAsyncButton from "../../../components/ui/MainAsyncButton";

import { capitalize } from '../../../utils/tools';
import { useSendPhoneValidationCodeRequestMutation } from "../../../services/api";
import { COLORS } from "../../../constants/colors";
import { styles } from "./Phone.styles";

const { height } = Dimensions.get('window');

export default function Phone() {
    const navigation = useNavigation();
    const route = useRoute();
    const dispatch = useDispatch();

    const isUpdate = route.params?.isUpdate;

    const authUser = useSelector((state) => state.auth?.user);
    const registerUser = useSelector((state) => state.register?.user);
    const userName = capitalize(authUser?.name || registerUser?.name || "usuário"); 
    const firstName = userName.split(' ')[0];

    const tax_id = authUser?.tax_id || registerUser?.tax_id;

    const [phone, setPhone] = useState('');
    const [validPhone, setValidPhone] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const panY = useRef(new Animated.Value(height)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    const [sendPhoneValidationCode] = useSendPhoneValidationCodeRequestMutation();

    const maskPhone = (value) => {
        return value
            .replace(/\D/g, '') 
            .replace(/^(\d{2})(\d)/g, '($1) $2') 
            .replace(/(\d)(\d{4})$/, '$1-$2') 
            .slice(0, 15); 
    };

    const handleVerify = () => {
        Keyboard.dismiss();
        setModalVisible(true);
    };

    const handleDismissModal = () => {
        setModalVisible(false);
    };

    useEffect(() => {
        if (modalVisible) {
            setShowModal(true);
            Animated.parallel([
                Animated.spring(panY, {
                    toValue: 0,
                    useNativeDriver: true,
                    damping: 20,
                    stiffness: 150,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(panY, {
                    toValue: height,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                setShowModal(false);
            });
        }
    }, [modalVisible, opacity, panY]);

    const handleConfirm = async () => {
        setModalVisible(false);
        setLoading(true);

        try {
            await sendPhoneValidationCode({ tax_id: tax_id, phone: phone }).unwrap();
            navigation.navigate('PhoneCode', { phone: phone, isUpdate: isUpdate });
        } catch (error) {
            // console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (phone.length === 15) {
            setValidPhone(true);
        } else {
            setValidPhone(false);
        }
    }, [phone]);

    return (
        <ScreenWrapper>
            <View style={styles.container}>
                <View style={styles.content}>
                    <View style={styles.iconBadge}>
                        <MaterialCommunityIcons name="cellphone" size={34} color={COLORS.primary} />
                    </View>
                    <Text style={styles.title}>
                        {isUpdate ? "Atualizar celular" : `Beleza ${firstName}!\nQuase tudo pronto.`}
                    </Text>
                    <Text style={styles.subtitle}>
                        {isUpdate ? "Informe seu novo número de celular" : "Informe seu número de celular"}
                    </Text>
                    <Input 
                        label='Celular' 
                        placeholder='(00) 00000-0000' 
                        width='100%' 
                        keyboardType="phone-pad"
                        value={phone}
                        onChangeText={(text) => setPhone(maskPhone(text))}
                        maxLength={15}
                    />
                </View>
                
                <View style={styles.buttonWrapper}>
                    <MainAsyncButton 
                        onPress={handleVerify} 
                        disabled={!validPhone} 
                        loading={loading}
                    />
                </View>
            </View>

            {showModal && (
                <Modal transparent visible={showModal} animationType="none" statusBarTranslucent>
                    <View style={modalStyles.overlay}>
                        <Animated.View style={[modalStyles.backdrop, { opacity }]} />
                        <Animated.View style={[
                            modalStyles.modalContainer,
                            { transform: [{ translateY: panY }] }
                        ]}>
                            <View style={modalStyles.content}>
                                <Text style={modalStyles.modalText}>O número está correto?</Text>
                                <Text style={modalStyles.modalPhone}>{phone}</Text>
                                <Text style={modalStyles.modalSubText}>
                                    Um código de verificação será enviado para este número.
                                </Text>

                                <View style={modalStyles.modalButtons}>
                                    <Pressable 
                                        style={modalStyles.modalButtonCancel} 
                                        onPress={handleDismissModal}
                                    >
                                        <Text style={modalStyles.modalButtonTextCancel}>Editar</Text>
                                    </Pressable>
                                    
                                    <Pressable 
                                        style={modalStyles.modalButtonConfirm} 
                                        onPress={handleConfirm}
                                    >
                                        <Text style={modalStyles.modalButtonTextConfirm}>Confirmar</Text>
                                    </Pressable>
                                </View>
                            </View>
                            <View style={{ height: 20 }} />
                        </Animated.View>
                    </View>
                </Modal>
            )}
        </ScreenWrapper>
    );
}

const modalStyles = RNStyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...RNStyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    modalContainer: {
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
    },
    content: {
        paddingVertical: 8,
    },
    modalText: {
        fontSize: 16,
        color: '#333',
        marginBottom: 8,
    },
    modalPhone: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.textSecondary,
        marginBottom: 8,
    },
    modalSubText: {
        fontSize: 14,
        color: COLORS.muted,
        marginBottom: 28,
        lineHeight: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    modalButtonCancel: {
        flex: 1,
        height: 50,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalButtonConfirm: {
        flex: 1,
        height: 50,
        borderRadius: 12,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalButtonTextCancel: {
        color: COLORS.primary,
        fontWeight: '600',
        fontSize: 16,
    },
    modalButtonTextConfirm: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

