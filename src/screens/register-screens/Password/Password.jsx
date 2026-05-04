import React from "react";
import { View, Text, Pressable, SafeAreaView } from "react-native";
import { useNavigation } from '@react-navigation/native';
import Input from "../../../components/ui/Input";
import { styles } from "./Password.styles";

export default function Password() {
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