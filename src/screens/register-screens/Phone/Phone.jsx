import React, { useState, useEffect } from "react";
import { View, Text, Pressable, Modal, Keyboard } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; 
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from "react-redux";

import Input from "../../../components/ui/Input";
import MainAsyncButton from "../../../components/ui/MainAsyncButton";
import { globalStyles } from "../../../constants/styles";

import { capitalize } from '../../../utils/tools';
import { useSendPhoneValidationCodeRequestMutation } from "../../../services/api";
import { styles } from "./Phone.styles";

export default function Phone() {
    const navigation = useNavigation();
    const dispatch = useDispatch();

    const userName = capitalize(useSelector((state) => state.register?.user?.name) || "usuário"); 
    const firstName = userName.split(' ')[0];

    const [phone, setPhone] = useState('');
    const [validPhone, setValidPhone] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);

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

    const handleConfirm = async () => {
        setModalVisible(false);
        setLoading(true);

        try {
            await sendPhoneValidationCode({ phone: phone }).unwrap();
            navigation.navigate('PhoneCode', { phone: phone });
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
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.content}>
                    <Text style={[globalStyles.title, styles.title]}>
                        Beleza <Text>{firstName}!</Text>{'\n'}
                        Quase tudo pronto.
                    </Text>
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