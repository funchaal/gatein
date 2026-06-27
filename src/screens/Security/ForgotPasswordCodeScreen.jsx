import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, BackHandler } from "react-native";
import ScreenWrapper from "../../components/common/ScreenWrapper";
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

import { COLORS } from "../../constants/colors";
import CodeInput from "./components/CodeInput";
import { globalStyles } from "../../constants/styles";
import { useValidateForgotPasswordCodeMutation } from '../../services/api';
import LoadingModal from "../../components/ui/LoadingModal";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { styles } from './Security.styles';

export default function ForgotPasswordCodeScreen() {
    const navigation = useNavigation();
    const route = useRoute();

    const origin = route?.params?.origin || 'Security';

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

    const [errorMsg, setErrorMsg] = useState('');
    const [isInvalidCode, setIsInvalidCode] = useState(false);

    const [validateForgotPasswordCode, { isLoading }] = useValidateForgotPasswordCodeMutation();

    const phone = route.params?.phone || "seu celular";
    const tax_id = route.params?.tax_id;

    const handleNext = async (code) => {
        setErrorMsg('');
        setIsInvalidCode(false);

        try {
            const response = await validateForgotPasswordCode({ tax_id: tax_id, code: code }).unwrap();

            const token = response?.token || response?.data?.token || response;

            navigation.navigate('ResetPassword', { token, origin, tax_id });

        } catch (error) {
            setIsInvalidCode(true); // Visually mark the input as invalid
            setErrorMsg("Código inválido ou incorreto.");
        }
    }

    return (
        <ScreenWrapper>
            <View style={styles.container}>
                <View style={styles.content}>
                    <View style={styles.iconBadge}>
                        <MaterialCommunityIcons name="message-processing-outline" size={34} color={COLORS.primary} />
                    </View>
                    <Text style={styles.title}>Valide seu celular</Text>

                    <Text style={styles.subtitle}>
                        Enviamos um código de 6 números para {'\n'}
                        <Text style={{ fontWeight: 'bold', color: COLORS.textDark }}>{phone}</Text> via SMS.
                    </Text>

                    <View style={styles.inputContainer}>
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
            </View>

            <LoadingModal visible={isLoading} text="Validando código..." />
        </ScreenWrapper>
    );
}
