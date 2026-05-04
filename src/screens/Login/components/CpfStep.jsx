import React from 'react';
import { View, Text } from 'react-native';
import Input from '../../../components/ui/Input';
import MainAsyncButton from '../../../components/ui/MainAsyncButton';
import SecondaryButton from '../../../components/ui/SecondaryButton';
import { maskCPF } from '../../../utils/masks';
import { styles } from '../Login.styles';

export default function CpfStep({
    cpf,
    setCpf,
    cpfError,
    validCpf,
    loading,
    handleContinue,
    navigation
}) {
    return (
        <View style={styles.formArea}>
            <View style={styles.mainSection}>
                <View style={styles.logoContainer}>
                    <Text style={styles.title}>GateIn</Text>
                </View>
                
                <View style={styles.inputContainer}>
                    <Text style={styles.subtitle}>Acesse sua conta</Text>
                    <Input 
                        label="Insira seu CPF"
                        placeholder="000.000.000-00"
                        value={cpf}
                        onChangeText={(text) => setCpf(maskCPF(text))}
                        keyboardType="numeric"
                        autoFocus
                        error={cpfError}
                        maxLength={14}
                    />
                </View>
            </View>

            <View style={styles.footerLinks}>
                <SecondaryButton
                    title="Criar uma conta agora"
                    onPress={() => navigation.navigate('TaxId')}
                    style={{ marginBottom: 12 }}
                />
                <MainAsyncButton 
                    title="Continuar"
                    onPress={handleContinue}
                    disabled={!validCpf}
                    loading={loading}
                />
            </View>
        </View>
    );
}