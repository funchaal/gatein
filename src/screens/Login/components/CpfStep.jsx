import React from 'react';
import { View, Text } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Input from '../../../components/ui/Input';
import MainAsyncButton from '../../../components/ui/MainAsyncButton';
import SecondaryButton from '../../../components/ui/SecondaryButton';
import { maskCPF } from '../../../utils/masks';
import { COLORS } from '../../../constants/colors';
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
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconBadge}>
                    <MaterialCommunityIcons name="login" size={34} color={COLORS.primary} />
                </View>
                <Text style={styles.title}>Bem-vindo!</Text>
                <Text style={styles.subtitle}>Acesse sua conta para continuar</Text>
                
                <Input 
                    label="Insira seu CPF"
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChangeText={(text) => setCpf(maskCPF(text))}
                    keyboardType="numeric"
                    autoFocus
                    error={cpfError}
                    maxLength={14}
                    width="100%"
                />
            </View>

            <View style={styles.buttonWrapper}>
                <MainAsyncButton 
                    title="Continuar"
                    onPress={handleContinue}
                    disabled={!validCpf}
                    loading={loading}
                />
                <SecondaryButton
                    title="Criar uma conta agora"
                    onPress={() => navigation.navigate('TaxId')}
                />
            </View>
        </View>
    );
}
