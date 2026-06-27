import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, BackHandler } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import MainAsyncButton from '../../components/ui/MainAsyncButton';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../constants/colors';
import { globalStyles } from '../../constants/styles';
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
        BackHandler.addEventListener('hardwareBackPress', onBackPress);
        return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, []);

    const handleAddPress = () => {
        // Navigate to email input (not in edit/profile update mode, so isUpdate: false)
        navigation.navigate('EmailInput', { isUpdate: false });
    };

    const handleSkipPress = () => {
        dispatch(dismissEmailPrompt());
    };

    return (
        <ScreenWrapper>
            <View style={styles.container}>
                <View style={styles.content}>
                    <View style={styles.iconBadge}>
                        <Icon name="mail-unread-outline" size={38} color={COLORS.primary} />
                    </View>
                    <Text style={[globalStyles.title, styles.title]}>E-mail de contato</Text>
                    <Text style={[globalStyles.subtitle, styles.subtitle]}>
                        Adicione um endereço de e-mail à sua conta. É muito importante manter seus dados de contato atualizados para comunicações e segurança.
                    </Text>
                </View>
                
                <View style={styles.buttonWrapper}>
                    <MainAsyncButton 
                        title="Adicionar e-mail"
                        onPress={handleAddPress} 
                    />
                    <View style={{ height: 12 }} />
                    <Pressable 
                        style={[globalStyles.outlineButton, { height: 56, borderColor: '#94A3B8' }]} 
                        onPress={handleSkipPress}
                    >
                        <Text style={[globalStyles.outlineButtonText, { color: '#64748B' }]}>Pular por enquanto</Text>
                    </Pressable>
                </View>
            </View>
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
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconBadge: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: `${COLORS.primary}18`,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    title: {
        textAlign: 'center',
        maxWidth: '100%',
        marginBottom: 8,
    },
    subtitle: {
        textAlign: 'center',
        maxWidth: '90%',
        lineHeight: 22,
    },
    buttonWrapper: {
        width: '100%',
        paddingBottom: 24,
    }
});
