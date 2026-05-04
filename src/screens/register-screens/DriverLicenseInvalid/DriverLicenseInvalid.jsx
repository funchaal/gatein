import React from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from '@react-navigation/native';
import { globalStyles } from "../../../constants/styles";
import MainAsyncButton from "../../../components/ui/MainAsyncButton";
import { styles } from "./DriverLicenseInvalid.styles";

export default function DriverLicenseInvalid() {
    const navigation = useNavigation();

    const handleTryAgain = () => {
        navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.content}>
                    <Text style={globalStyles.title}>CNH Inválida</Text>
                    <Text style={globalStyles.subtitle}>
                        O número da CNH informado está incorreto. Por favor, tente novamente.
                    </Text>
                </View>
                <MainAsyncButton onPress={handleTryAgain} label="Tentar Novamente" />
            </View>
        </SafeAreaView>
    );
}