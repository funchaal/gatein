import React from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from '@react-navigation/native';
import { globalStyles } from "../../../constants/styles";
import MainAsyncButton from "../../../components/ui/MainAsyncButton";
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
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.content}>
                    <Text style={globalStyles.title}>Cadastro em Análise</Text>
                    <Text style={globalStyles.subtitle}>
                        Não há cadastros com seu CPF nos terminais parceiros, mas não se preocupe, assim que houver, mandaremos uma mensagem para você utilizar o app.
                    </Text>
                </View>
                <MainAsyncButton onPress={handleBackToStart} label="Entendido" />
            </View>
        </SafeAreaView>
    );
}