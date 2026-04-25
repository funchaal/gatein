import React from "react";
import { StyleSheet, View, Text, Pressable, SafeAreaView } from "react-native";
import { useNavigation } from '@react-navigation/native';
import Input from "../../components/common/Input";
import { COLORS } from "../../constants/colors";

export default function CPFScreen() {
    const navigation = useNavigation();

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.content}>
                    <Text style={styles.title}>Vamos criar uma conta para você</Text>
                    <Text style={styles.subtitle}>Informe seu CPF para começar</Text>
                    <Input Label='' Title='000.000.000-00' width='100%' />
                </View>
                
                <Pressable onPress={() => navigation.navigate('Phone')} style={styles.button}>
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
        marginBottom: 20,
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
