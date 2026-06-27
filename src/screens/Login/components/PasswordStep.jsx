import React from 'react';
import { View, Text } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Input from '../../../components/ui/Input';
import MainAsyncButton from '../../../components/ui/MainAsyncButton';
import SecondaryButton from '../../../components/ui/SecondaryButton';
import UserBadge from './UserBadge';
import { COLORS } from '../../../constants/colors';
import { styles } from '../Login.styles';

export default function PasswordStep({
    cpf,
    password,
    setPassword,
    passwordError,
    loading,
    handleContinue,
    handleSwitchAccount,
    routeMessage,
    navigation
}) {
    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconBadge}>
                    <MaterialCommunityIcons name="lock-outline" size={34} color={COLORS.primary} />
                </View>
                <Text style={styles.title}>Quase lá!</Text>
                <Text style={styles.subtitle}>Digite sua senha para acessar</Text>
                
                <UserBadge cpf={cpf} onSwitchAccount={handleSwitchAccount} />

                {routeMessage && (
                    <Text style={styles.infoMessage}>{routeMessage}</Text>
                )}

                <Input 
                    label="Insira sua senha"
                    placeholder="***********"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoFocus
                    error={passwordError}
                    width="100%"
                />
            </View> 

            <View style={styles.buttonWrapper}>
                <MainAsyncButton 
                    title="Entrar"
                    onPress={handleContinue}
                    disabled={!password}
                    loading={loading}
                />
                <SecondaryButton
                   title="Esqueci minha senha"
                   onPress={() => navigation.navigate('ForgotPassword', { origin: 'Login' })}
                />
            </View>
        </View>
    );
}
