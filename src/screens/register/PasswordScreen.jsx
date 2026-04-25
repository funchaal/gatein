import React from "react";
import { StyleSheet, View, Text, Pressable, SafeAreaView } from "react-native";
import { useNavigation } from '@react-navigation/native';
import Input from "../../components/common/Input";
import { COLORS } from "../../constants/colors";

export default function PasswordScreen() {
    const navigation = useNavigation();

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.content}>
                    <Text style={styles.title}>Defina uma senha para acessar sua conta</Text>
                    <Text style={styles.subtitle}>Essa senha será utilizada para acessar o App.</Text>
                    <Input Label='Senha' Title='Digite sua senha' width='100%' isPassword={true} />
                    <Input Label='Confirmar senha' Title='Repita sua senha' width='100%' isPassword={true} />
                </View>
                
                <Pressable onPress={() => navigation.navigate('Success')} style={styles.button}>
                    <Text style={styles.buttonText}>Continuar</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
        justifyContent: 'space-between',
        padding: 30,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '600',
        maxWidth: '80%',
        marginBottom: 15,
        color: '#333',
    },
    subtitle: {
        fontSize: 18,
        color: '#666',
        marginBottom: 30,
    },
    button: {
        height: 50,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 40,
        width: '100%',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
