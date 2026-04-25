import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, Keyboard } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from '@react-navigation/native';
import Input from "../../components/common/Input";
import { COLORS } from "../../constants/colors";
import { useDispatch } from "react-redux";
import { setName } from "../../store/slices/registerSlice";
import { globalStyles } from "../../constants/styles";

import MainAsyncButton from "../../components/common/MainAsyncButton";

export default function NameScreen() {
    const navigation = useNavigation();
    const [nameInput, setNameInput] = useState('');
    const [validName, setValidName] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const dispatch = useDispatch();

    // Função simples de validação (mínimo 2 palavras e 3 letras)
    const isValidName = (text) => {
        const words = text.trim().split(/\s+/);
        return words.length >= 2 && text.length >= 3;
    };

    const handleNext = async () => {
        const cleanName = nameInput.trim().replace(/\s+/g, ' ').toUpperCase(); 
        
        dispatch(setName(cleanName));
        navigation.navigate('Phone');
    }

    useEffect(() => {
        setError(''); 

        // Não valida se tiver muito pouco texto ainda
        if (nameInput.length < 3) {
            setValidName(false);
            setError('');
            return;
        }

        const is_valid = isValidName(nameInput);
        
        setValidName(is_valid);

        // Delay para mostrar o erro apenas se o usuário parar de digitar
        const timeoutId = setTimeout(() => {
            if (!is_valid) setError('Por favor, informe seu nome completo.');
        }, 1000);

        return () => clearTimeout(timeoutId);

    }, [nameInput]);

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.content}>
                    <Text style={globalStyles.title}>Qual é o seu nome?</Text>
                    {/* Mantive o subtitle pois ajuda no contexto de "Nome e Sobrenome" */}
                    {/* <Text style={globalStyles.subtitle}>Nos diga como devemos te chamar</Text> */}
                    
                    <Input 
                        label='Nome completo' 
                        placeholder='Digite seu nome e sobrenome' 
                        width='100%' 
                        onChangeText={setNameInput} 
                        value={nameInput} 
                        autoCapitalize="words"
                        error={error}
                    />
                </View>

                <MainAsyncButton onPress={handleNext} disabled={!validName} loading={loading}/>
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
    }
});