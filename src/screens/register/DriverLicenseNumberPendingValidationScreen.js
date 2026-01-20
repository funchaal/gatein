import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from '@react-navigation/native';
import { COLORS } from "../../constants/colors";
import { globalStyles } from "../../constants/styles";
import MainAsyncButton from "../../components/common/MainAsyncButton";

export default function DriverLicensePendingValidationScreen() {
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
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center'
    }
});