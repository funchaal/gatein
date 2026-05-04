import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';

import MainAsyncButton from '../../components/ui/MainAsyncButton';
import { COLORS } from '../../constants/colors';
import { globalStyles } from '../../constants/styles';

export default function CheckinFailScreen() {
    const navigation = useNavigation();

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.content}>
                    <Text style={globalStyles.title}>Checkin{'\n'}Falhou</Text>
                    <Text style={globalStyles.subtitle}>
                        Não foi possível realizar o check-in neste momento. Tente novamente ou contate o suporte.
                    </Text>

                    <View style={styles.iconContainer}>
                        <Icon name="x-circle" size={120} color="#E53935" />
                    </View>
                </View>

                <MainAsyncButton
                    title="Voltar ao início"
                    onPress={async () => {
                        navigation.navigate('Main');
                    }}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    container: {
        flex: 1,
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10
    },
    content: {
        flex: 1,
    },
    iconContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
