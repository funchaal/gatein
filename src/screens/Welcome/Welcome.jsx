import React from "react";
import { View } from "react-native";
import { useNavigation } from '@react-navigation/native';

import WelcomeBackground from "./components/WelcomeBackground";
import WelcomeActions from "./components/WelcomeActions";

import { handleLoginNavigation, handleRegisterNavigation } from "./helpers";
import { styles } from "./Welcome.styles";

export default function WelcomeScreen() {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            {/* 1. Ícone de Fundo (Marca d'água "Boom Gate") */}
            <WelcomeBackground />

            {/* 2. Conteúdo Principal */}
            <WelcomeActions 
                onLogin={() => handleLoginNavigation(navigation)}
                onRegister={() => handleRegisterNavigation(navigation)}
            />
        </View>
    );
}
