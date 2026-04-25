import React from 'react';
import { View, Text } from 'react-native';
import Input from '../../../components/common/Input';
import MainAsyncButton from '../../../components/common/MainAsyncButton';
import SecondaryButton from '../../../components/common/SecondaryButton';
import UserBadge from './UserBadge';
import { styles } from '../Login.styles';

export default function PasswordStep({
    cpf,
    password,
    setPassword,
    passwordError,
    loading,
    handleContinue,
    handleSwitchAccount,
    routeMessage
}) {
    return (
        <View style={styles.formArea}>
            <View style={[styles.mainSection, { height: '65%' }]}>
                <View style={styles.logoContainer}>
                    <Text style={styles.title}>GateIn</Text>
                </View>

                <View style={styles.inputContainer}>
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
                    />
                    <MainAsyncButton 
                        title="Entrar"
                        onPress={handleContinue}
                        disabled={!password}
                        loading={loading}
                        style={{ marginTop: 20 }}
                    />
                </View>
            </View> 

            <SecondaryButton
               title="Esqueci minha senha"
               style={{ marginBottom: 12 }}
            />
        </View>
    );
}