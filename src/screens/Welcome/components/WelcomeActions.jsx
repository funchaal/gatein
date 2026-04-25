import React from 'react';
import { View, Text, Pressable } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { styles } from '../Welcome.styles';

export default function WelcomeActions({ onLogin, onRegister }) {
    return (
        <View style={styles.contentContainer}>
            <Text style={styles.title}>
                <Text style={styles.boldText}>Domine</Text>{'\n'}
                sua viagem{'\n'}
                <Text style={styles.boldText}>com informação</Text>{'\n'}
                rápida
            </Text>

            {/* Botão de Registro com Ícone > */}
            <Pressable style={styles.registerButton} onPress={onRegister}>
                <Text style={styles.registerButtonText}>Criar conta</Text>
                <MaterialCommunityIcons name="chevron-right" size={24} color="white" />
            </Pressable>
            
            {/* Botão de Login */}
            <Pressable onPress={onLogin} style={styles.loginButton}>
                <Text style={styles.loginButtonText}>Acessar sua conta</Text>
            </Pressable>
        </View>
    );
}