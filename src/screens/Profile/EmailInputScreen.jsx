import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Keyboard, Pressable } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Input from '../../components/ui/Input';
import MainAsyncButton from '../../components/ui/MainAsyncButton';
import LoadingModal from '../../components/ui/LoadingModal';
import { COLORS } from '../../constants/colors';
import { useSendEmailValidationCodeMutation } from '../../services/api';

export default function EmailInputScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const isUpdate = route.params?.isUpdate ?? false;

    const [email, setEmail] = useState('');
    const [isValid, setIsValid] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [sendEmailValidationCode, { isLoading }] = useSendEmailValidationCodeMutation();

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

    // Simple email regex validation
    useEffect(() => {
        setErrorMsg('');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        setIsValid(emailRegex.test(email.trim()));
    }, [email]);

    const handleContinuePress = async () => {
        if (!isValid) return;

        Keyboard.dismiss();
        try {
            await sendEmailValidationCode({ email: email.trim().toLowerCase() }).unwrap();
            navigation.navigate('EmailCode', { email: email.trim().toLowerCase(), isUpdate });
        } catch (error) {
            setErrorMsg(error?.data?.detail?.message || error?.data?.error?.message || 'Falha ao enviar código para o e-mail.');
        }
    };

    return (
        <ScreenWrapper>
            <View style={styles.container}>
                <View style={styles.content}>
                    <View style={styles.iconBadge}>
                        <MaterialCommunityIcons name="email-outline" size={34} color={COLORS.primary} />
                    </View>
                    <Text style={styles.title}>
                        {isUpdate ? "Atualizar e-mail" : "Cadastrar e-mail"}
                    </Text>
                    <Text style={styles.subtitle}>
                        Insira seu e-mail de contato abaixo
                    </Text>
                    <View style={styles.inputContainer}>
                        <Input 
                            label='E-mail' 
                            placeholder='email@exemplo.com' 
                            width='100%' 
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            value={email}
                            onChangeText={setEmail}
                            error={errorMsg}
                        />
                    </View>
                </View>

                <View style={styles.buttonWrapper}>
                    <MainAsyncButton 
                        title="Próximo"
                        onPress={handleContinuePress} 
                        disabled={!isValid}
                        loading={isLoading}
                    />
                </View>
            </View>
            <LoadingModal visible={isLoading} text="Enviando código..." />
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        paddingVertical: 10,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        paddingBottom: '15%',
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
    inputContainer: {
        width: '100%',
    },
    buttonWrapper: {
        paddingBottom: 32,
        width: '100%',
    }
});
