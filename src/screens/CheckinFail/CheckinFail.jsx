import React from 'react';
import { View, Text } from 'react-native';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import MainAsyncButton from '../../components/ui/MainAsyncButton';
import { COLORS } from '../../constants/colors';
import { styles } from './CheckinFail.styles';

export default function CheckinFailScreen() {
    const navigation = useNavigation();

    return (
        <ScreenWrapper>
            <View style={styles.container}>
                <View style={styles.content}>
                    <View style={styles.iconBadge}>
                        <MaterialCommunityIcons name="alert-circle-outline" size={34} color={COLORS.error} />
                    </View>
                    <Text style={styles.title}>Check-in Falhou</Text>
                    <Text style={styles.subtitle}>
                        Não foi possível realizar o check-in neste momento. Tente novamente ou contate o suporte.
                    </Text>
                </View>

                <View style={styles.buttonWrapper}>
                    <MainAsyncButton
                        title="Voltar ao início"
                        onPress={async () => {
                            navigation.navigate('Main');
                        }}
                    />
                </View>
            </View>
        </ScreenWrapper>
    );
}
