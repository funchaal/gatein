import React from "react";
import { View, Text } from "react-native";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ScreenWrapper from "../../../components/common/ScreenWrapper";
import { useNavigation } from '@react-navigation/native';
import MainAsyncButton from "../../../components/ui/MainAsyncButton";
import { COLORS } from "../../../constants/colors";
import { styles } from "./DriverLicenseInvalid.styles";

export default function DriverLicenseInvalid() {
    const navigation = useNavigation();

    const handleTryAgain = () => {
        navigation.goBack();
    };

    return (
        <ScreenWrapper>
            <View style={styles.container}>
                <View style={styles.content}>
                    <View style={styles.iconBadge}>
                        <MaterialCommunityIcons name="alert-circle-outline" size={34} color={COLORS.error} />
                    </View>
                    <Text style={styles.title}>CNH Inválida</Text>
                    <Text style={styles.subtitle}>
                        O número da CNH informado está incorreto. Por favor, tente novamente.
                    </Text>
                </View>
                <View style={styles.buttonWrapper}>
                    <MainAsyncButton onPress={handleTryAgain} title="Tentar Novamente" />
                </View>
            </View>
        </ScreenWrapper>
    );
}
