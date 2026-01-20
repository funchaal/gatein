import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from '@react-navigation/native';
import { COLORS } from "../../constants/colors";
import { globalStyles } from "../../constants/styles";
import MainAsyncButton from "../../components/common/MainAsyncButton";

export default function DriverLicenseInvalidScreen() {
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