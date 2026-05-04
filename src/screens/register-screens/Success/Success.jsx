import React from "react";
import { View, Text, Pressable, SafeAreaView } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { styles } from "./Success.styles";

export default function Success() {
    const navigation = useNavigation();

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.content}>
                    <Text style={styles.title}>Conta criada!</Text>
                    <Text style={styles.subtitle}>Agora basta fazer login para desfrutar das novidades!</Text>
                </View>
                
                <Pressable onPress={() => navigation.navigate('Login')} style={styles.button}>
                    <Text style={styles.buttonText}>Fazer Login</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}