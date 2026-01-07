import React from "react";
import { StyleSheet, View, Text, Pressable, SafeAreaView } from "react-native";
import { useNavigation } from '@react-navigation/native';
import Input from "../../components/common/Input";
import { COLORS } from "../../constants/colors";

export default function PhoneScreen() {
    const navigation = useNavigation();
    const userName = "Rafael"; // Idealmente, viria do estado da aplicação ou da rota

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.content}>
                    <Text style={styles.title}>Beleza, <Text style={{ color: COLORS.primary }}>{userName}</Text>{'\n'}Quase tudo pronto</Text>
                    <Text style={styles.subtitle}>Agora informe seu número de celular</Text>
                    <Input Label='' Title='(00) 00000-0000' width='100%' keyboardType="phone-pad" />
                </View>
                
                <Pressable onPress={() => navigation.navigate('Confirm')} style={styles.button}>
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
        marginBottom: 15,
        color: '#333',
        lineHeight: 36,
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
