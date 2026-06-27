import React from "react";
import { View, Text } from "react-native";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ScreenWrapper from "../../../components/common/ScreenWrapper";
import { useNavigation } from '@react-navigation/native';
import MainAsyncButton from "../../../components/ui/MainAsyncButton";
import { COLORS } from "../../../constants/colors";
import { styles } from "./DriverLicenseNumberPendingValidation.styles";

export default function DriverLicenseNumberPendingValidation() {
    const navigation = useNavigation();

    const handleBackToStart = () => {
        navigation.reset({
            index: 0,
            routes: [{ name: 'Welcome' }],
        });
    };

    return (
        <ScreenWrapper>
            <View style={styles.container}>
                <View style={styles.content}>
                    <View style={styles.iconBadge}>
                        <MaterialCommunityIcons name="timer-sand" size={34} color={COLORS.warning} />
                    </View>
                    <Text style={styles.title}>Cadastro em Análise</Text>
                    <Text style={styles.subtitle}>
                        Não há cadastros com seu CPF nos terminais parceiros, mas não se preocupe, assim que houver, mandaremos uma mensagem para você utilizar o app.
                    </Text>
                </View>
                <View style={styles.buttonWrapper}>
                    <MainAsyncButton onPress={handleBackToStart} title="Entendido" />
                </View>
            </View>
        </ScreenWrapper>
    );
}
