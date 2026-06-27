import React, { useState, useEffect } from "react";
import { View, Text, Keyboard } from "react-native";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import ScreenWrapper from "../../../components/common/ScreenWrapper";
import { useSelector } from 'react-redux';
import { useRegisterRequestMutation } from "../../../services/api";
import Input from "../../../components/ui/Input";
import MainAsyncButton from "../../../components/ui/MainAsyncButton";
import { COLORS } from "../../../constants/colors";
import { styles } from "./Password.styles";

export default function Password() {
    const navigation = useNavigation();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [validPasswords, setValidPasswords] = useState(false);
    
    const tax_id = useSelector((state) => state.register?.user?.tax_id);
    const [registerRequest, { isLoading }] = useRegisterRequestMutation();

    useEffect(() => {
        setError('');

        if (!password || !confirmPassword) {
            setValidPasswords(false);
            return;
        }

        const match = password === confirmPassword;
        setValidPasswords(match);

        // if (match) Keyboard.dismiss();

        const timeoutId = setTimeout(() => {
            if (!match) setError('As senhas não coincidem.');
        }, 1000);

        return () => clearTimeout(timeoutId);
    }, [password, confirmPassword]);

    const handleContinue = async () => {
        try {
            await registerRequest({ tax_id, password }).unwrap();
            navigation.navigate('Success');
        } catch (err) {
            setError(err?.data?.error?.message || "Falha ao registrar a senha.");
            console.error(err);
        }
    };

    return (
        <ScreenWrapper>
            <View style={styles.container}>
                <View style={styles.content}>
                    <View style={styles.iconBadge}>
                        <MaterialCommunityIcons name="lock-outline" size={34} color={COLORS.primary} />
                    </View>
                    <Text style={styles.title}>Defina uma senha</Text>
                    <Text style={styles.subtitle}>Essa senha será utilizada para acessar o App</Text>
                    <Input 
                        label='Senha' 
                        placeholder='Digite sua senha' 
                        width='100%' 
                        secureTextEntry={true} 
                        value={password}
                        onChangeText={setPassword}
                    />
                    <Input 
                        label='Confirmar senha' 
                        placeholder='Repita sua senha' 
                        width='100%' 
                        secureTextEntry={true} 
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        error={error}
                    />
                </View>
                
                <View style={styles.buttonWrapper}>
                    <MainAsyncButton 
                        onPress={handleContinue} 
                        disabled={!validPasswords} 
                        loading={isLoading} 
                    />
                </View>
            </View>
        </ScreenWrapper>
    );
}

