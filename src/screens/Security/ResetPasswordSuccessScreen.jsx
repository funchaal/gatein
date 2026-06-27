import React, { useEffect } from 'react';
import { View, Text, StyleSheet, BackHandler } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import MainAsyncButton from '../../components/ui/MainAsyncButton';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../constants/colors';
import { globalStyles } from '../../constants/styles';

export default function ResetPasswordSuccessScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    
    const origin = route?.params?.origin || 'Security';
    const tax_id = route?.params?.tax_id;

    // Previne que o usuário aperte o botão de voltar do Android
    useEffect(() => {
        const onBackPress = () => {
            return true; // Retornar true bloqueia o evento padrão
        };
        
        BackHandler.addEventListener('hardwareBackPress', onBackPress);

        return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, []);

    const handleOkPress = () => {
        if (origin === 'Login') {
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login', params: { tax_id } }],
            });
        } else {
            navigation.navigate('Security');
        }
    };

    return (
        <ScreenWrapper>
            <View style={[styles.container]}>
                <View style={styles.content}>
                    <Icon name="checkmark-circle" size={80} color={COLORS.success || '#22c55e'} />
                    <Text style={[globalStyles.title, styles.title]}>Senha redefinida</Text>
                    <Text style={[globalStyles.subtitle, styles.subtitle]}>
                        Sua senha foi redefinida com sucesso.
                    </Text>
                </View>
                
                <View style={{ width: '100%' }}>
                    <MainAsyncButton 
                        title="Ok"
                        onPress={handleOkPress} 
                    />
                </View>
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        marginTop: 20,
        textAlign: 'center',
        maxWidth: '100%',
    },
    subtitle: {
        textAlign: 'center',
        maxWidth: '100%',
    }
});
