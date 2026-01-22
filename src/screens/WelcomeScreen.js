import React from "react";
import { StyleSheet, View, Text, Pressable } from "react-native";
import { useNavigation } from '@react-navigation/native';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { COLORS } from "../constants/colors"; 

export default function WelcomeScreen() {
    const navigation = useNavigation();

    function handleLogin() {
        navigation.navigate('Login');
    }
    
    function handleRegister() {
        navigation.navigate('TaxId');
    }

    return (
        <View style={styles.container}>
            {/* 1. Ícone de Fundo (Marca d'água "Boom Gate") */}
            <MaterialCommunityIcons 
                name="boom-gate" 
                size={300} 
                color={COLORS.primary} 
                style={styles.backgroundIcon} 
            />

            {/* 2. Conteúdo Principal */}
            <View style={styles.contentContainer}>
                <Text style={styles.title}>
                    <Text style={styles.boldText}>Domine</Text>{'\n'}
                    sua viagem{'\n'}
                    <Text style={styles.boldText}>com informação</Text>{'\n'}
                    rápida
                </Text>

                {/* Botão de Registro com Ícone > */}
                <Pressable style={styles.registerButton} onPress={handleRegister}>
                    <Text style={styles.registerButtonText}>Criar conta</Text>
                    <MaterialCommunityIcons name="chevron-right" size={24} color="white" />
                </Pressable>
                
                {/* Botão de Login */}
                <Pressable onPress={handleLogin} style={styles.loginButton}>
                    <Text style={styles.loginButtonText}>Acessar sua conta</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        position: 'relative', 
        overflow: 'hidden',   
    },
    backgroundIcon: {
        position: 'absolute',
        bottom: 100,    
        right: -70,     
        opacity: 0.1,   
        transform: [{ rotate: '-20deg' }, { scale: 2 }], 
        zIndex: 0,      
    },
    contentContainer: {
        flex: 1,
        zIndex: 1, 
        paddingTop: '35%', 
        paddingHorizontal: 20,
        alignItems: 'flex-start', 
    },
    title: {
        fontSize: 43,
        color: COLORS.textSecondary,
        marginBottom: 30,
        lineHeight: 50,
    },
    boldText: {
        fontWeight: 'bold',
        // color: COLORS.primary, 
    },
    registerButton: {
        marginTop: 10,
        height: 54, 
        backgroundColor: COLORS.primary, 
        borderRadius: 30, 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        paddingHorizontal: 25, 
        minWidth: 150, 
        gap: 10, 
    }, 
    registerButtonText: {
        color: 'white', 
        fontSize: 16, 
        fontWeight: 'bold',
    }, 
    loginButton: {
        marginTop: 12,
        height: 50, 
        paddingHorizontal: 30,
        borderRadius: 30, 
        alignItems: 'center', 
        justifyContent: 'center',
        borderWidth: 1, 
        borderColor: COLORS.primary, 
    },
    loginButtonText: {
        color: COLORS.primary, 
        fontSize: 16, 
        fontWeight: 'bold'
    }
});