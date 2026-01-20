import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, Pressable, Modal, Keyboard } from "react-native";
// Mudança principal: Importar SafeAreaView do pacote correto
import { SafeAreaView } from "react-native-safe-area-context"; 
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from "react-redux";

import Input from "../../components/common/Input";
import MainAsyncButton from "../../components/common/MainAsyncButton";
import { COLORS } from "../../constants/colors";
import { globalStyles } from "../../constants/styles";

import { capitalize } from '../../utils/tools';

import { sendPhoneValidationCodeRequest } from "../../store/slices/registerSlice";

export default function PhoneScreen() {
    const navigation = useNavigation();
    const dispatch = useDispatch();

    const userName = capitalize(useSelector((state) => state.register?.user?.name) || "usuário"); 
    const firstName = userName.split(' ')[0];

    const [phone, setPhone] = useState('');
    const [validPhone, setValidPhone] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);

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

    const handleConfirm = async () => {
        setModalVisible(false);
        setLoading(true);

        try {
            await dispatch(sendPhoneValidationCodeRequest({ phone: phone })).unwrap();
            
            // Simula delay ou navegação
            navigation.navigate('PhoneCode', { phone: phone });
        } catch (error) {
            console.log(error);
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
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.content}>
                    <Text style={[globalStyles.title, styles.title]}>
                        Beleza <Text>{firstName}!</Text>{'\n'}
                        Quase tudo pronto.
                    </Text>
                    {/* <Text style={globalStyles.subtitle}>Agora informe seu número de celular</Text> */}
                    
                    <Input 
                        label='Agora informe seu número de celular' 
                        placeholder='(00) 00000-0000' 
                        width='100%' 
                        keyboardType="phone-pad"
                        value={phone}
                        onChangeText={(text) => setPhone(maskPhone(text))}
                        maxLength={15}
                    />
                </View>
                
                <MainAsyncButton 
                    onPress={handleVerify} 
                    disabled={!validPhone} 
                    loading={loading}
                />
            </View>

            {/* Modal de Confirmação */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalText}>O número está correto?</Text>
                        <Text style={styles.modalPhone}>{phone}</Text>
                        <Text style={styles.modalSubText}>
                            Um código de verificação será enviado para este número.
                        </Text>

                        <View style={styles.modalButtons}>
                            <Pressable 
                                style={styles.modalButton} 
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.modalButtonTextCancel}>Editar</Text>
                            </Pressable>
                            
                            <Pressable 
                                style={styles.modalButton} 
                                onPress={handleConfirm}
                            >
                                <Text style={styles.modalButtonTextConfirm}>OK</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    container: {
        flex: 1,
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10
    },
    content: {
        flex: 1,
    },
    title: {
        lineHeight: 36,
    },
    // Estilos do Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '85%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 24,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    modalText: {
        fontSize: 16,
        color: '#333',
        marginBottom: 8,
    },
    modalPhone: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 8,
    },
    modalSubText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 24,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 20,
    },
    modalButton: {
        padding: 8,
    },
    modalButtonTextCancel: {
        color: COLORS.primary,
        fontWeight: '600',
        fontSize: 16,
    },
    modalButtonTextConfirm: {
        color: COLORS.primary,
        fontWeight: 'bold',
        fontSize: 16,
    },
});