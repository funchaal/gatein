import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, BackHandler } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import MainAsyncButton from '../../components/ui/MainAsyncButton';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../constants/colors';
import { useDispatch } from 'react-redux';
import { dismissEmailPrompt } from '../../store/slices/authSlice';

export default function EmailPromptScreen() {
    const navigation = useNavigation();
    const dispatch = useDispatch();

    // Prevent Android hardware back button to make sure user explicitly chooses to skip or proceed
    useEffect(() => {
        const onBackPress = () => {
            return true;
        };
        const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
        return () => subscription.remove();
    }, []);

    const handleAddPress = () => {
        // Navigate to email input (not in edit/profile update mode, so isUpdate: false)
        navigation.navigate('EmailInput', { isUpdate: false });
    };

    const handleSkipPress = () => {
        dispatch(dismissEmailPrompt());
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            navigation.navigate('Main');
        }
    };

    return (
        <ScreenWrapper style={styles.wrapper}>
            <View style={styles.container}>
                <View style={styles.content}>
                    <View style={styles.iconBadge}>
                        <MaterialCommunityIcons name="email-fast-outline" size={42} color={COLORS.primary} />
                    </View>
                    
                    <Text style={styles.title}>Adicione seu e-mail</Text>
                    <Text style={styles.subtitle}>
                        Cadastre um endereço de e-mail de contato para manter sua conta protegida e acompanhar suas operações.
                    </Text>

                    <View style={styles.benefitsCard}>
                        <View style={styles.benefitRow}>
                            <MaterialCommunityIcons name="shield-check-outline" size={22} color={COLORS.primary} style={styles.benefitIcon} />
                            <Text style={styles.benefitText}>Mais segurança e facilidade na recuperação da conta</Text>
                        </View>
                        <View style={styles.benefitDivider} />
                        <View style={styles.benefitRow}>
                            <MaterialCommunityIcons name="bell-ring-outline" size={22} color={COLORS.primary} style={styles.benefitIcon} />
                            <Text style={styles.benefitText}>Receba notificações e comprovantes das operações</Text>
                        </View>
                    </View>
                </View>
                
                <View style={styles.buttonWrapper}>
                    <MainAsyncButton 
                        title="Adicionar e-mail"
                        onPress={handleAddPress} 
                    />
                    <View style={{ height: 12 }} />
                    <Pressable 
                        style={({ pressed }) => [
                            styles.skipButton,
                            pressed && { opacity: 0.7, backgroundColor: '#F1F5F9' }
                        ]} 
                        onPress={handleSkipPress}
                    >
                        <Text style={styles.skipButtonText}>Pular por enquanto</Text>
                    </Pressable>
                </View>
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        backgroundColor: '#FFFFFF',
    },
    container: {
        flex: 1,
        justifyContent: 'space-between',
        paddingVertical: 16,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 8,
    },
    iconBadge: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(249, 115, 22, 0.10)',
        borderWidth: 1,
        borderColor: 'rgba(249, 115, 22, 0.20)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#0F172A',
        textAlign: 'center',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 15,
        lineHeight: 22,
        color: '#64748B',
        textAlign: 'center',
        maxWidth: '92%',
        marginBottom: 28,
    },
    benefitsCard: {
        width: '100%',
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    benefitRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    benefitIcon: {
        marginRight: 12,
    },
    benefitText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
        color: '#334155',
        fontWeight: '500',
    },
    benefitDivider: {
        height: 1,
        backgroundColor: '#E2E8F0',
        marginVertical: 12,
    },
    buttonWrapper: {
        width: '100%',
        paddingBottom: 16,
    },
    skipButton: {
        height: 52,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#CBD5E1',
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    skipButtonText: {
        color: '#475569',
        fontSize: 15,
        fontWeight: '600',
    },
});
