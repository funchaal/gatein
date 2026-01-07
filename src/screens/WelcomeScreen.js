import React from "react";
import { StyleSheet, View, Text, Pressable, Image } from "react-native";
import { useNavigation } from '@react-navigation/native';
import Input from "../components/common/Input"; // Caminho atualizado
import { COLORS } from "../constants/colors"; // Cores centralizadas
import { useDispatch } from "react-redux";
import { checkAuthStatus, setUser } from "../store/slices/authSlice";



export default function WelcomeScreen() {
    const navigation = useNavigation();
    const dispatch = useDispatch();

    function handleLogin() {
        // A lógica de validação de CPF e senha entraria aqui
//         dispatch(setUser({
//     id: 1234,
//     name: 'Rafael Silva',
//     tax_id: 43316667865, // CPF/CNPJ
//     role: 'driver',
//   }))
        navigation.navigate('Login');
    }
    
    function handleRegister() {
        // Navega para a primeira tela do fluxo de cadastro
        navigation.navigate('TaxId'); // Supondo que 'TaxId' é o nome da rota de cadastro
    }

    return (
        <View style={styles.container}>
            <Image 
                source={require('../../assets/images/gate.png')} // Assumindo que a logo está em assets/images
                style={styles.logo}
            />
            
            <View style={styles.formContainer}>
                {/* <Input Title='Insira seu número de CPF' Label='CPF' />
                <Input Title='Insira sua senha' Label='Senha' isPassword={true} /> */}
                
                <Pressable onPress={handleLogin} style={styles.primaryButton}>
                    <Text style={styles.primaryButtonText}>Acessar</Text>
                </Pressable>
                
                <Pressable style={styles.secondaryButton} onPress={handleRegister}>
                    <Text style={styles.secondaryButtonText}>Criar conta</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    logo: {
        width: '100%',
        display: 'absolute',
        marginTop: '20%',
        opacity: 0.0,
    },
    formContainer: {
        width: '100%',
        alignItems: 'center',
        padding: 20,
        paddingBottom: 40,
    },
    primaryButton: {
        width: '100%',
        height: 50,
        borderWidth: 1, 
        borderColor: '#F97316',
        marginTop: 30,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
    },
    primaryButtonText: {
        color: '#F97316',
        fontSize: 16,
        fontWeight: 'bold',
    },
    secondaryButton: {
        width: '100%',
        height: 50,
        backgroundColor: '#F97316',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        marginTop: 10,
    },
    secondaryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    footerText: {
        fontSize: 15,
    },
    footerLink: {
        color: COLORS.primary,
        fontWeight: 'bold',
    }
});

