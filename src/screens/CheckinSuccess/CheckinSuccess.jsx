import React from 'react';
import { View, Text } from 'react-native';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import MainAsyncButton from '../../components/ui/MainAsyncButton';
import { COLORS } from '../../constants/colors';
import { styles } from './CheckinSuccess.styles';

export default function CheckinSuccessScreen() {
    const navigation = useNavigation();

    return (
        <ScreenWrapper>
            <View style={styles.container}>
                <View style={styles.content}>
                    <View style={styles.iconBadge}>
                        <MaterialCommunityIcons name="check-circle-outline" size={34} color={COLORS.success} />
                    </View>
                    <Text style={styles.title}>Check-in Concluído</Text>
                    <Text style={styles.subtitle}>
                        Seu check-in foi realizado com sucesso.
                    </Text>
                </View>

                <View style={styles.buttonWrapper}>
                    <MainAsyncButton
                        title="Prosseguir"
                        onPress={async () => {
                            navigation.navigate('Main');
                        }}
                    />
                </View>
            </View>
        </ScreenWrapper>
    );
}
