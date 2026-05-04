import React, { useEffect, useState } from "react";
import { View, Text, Keyboard } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from "react-redux";

import Input from "../../../components/ui/Input";
import { globalStyles } from "../../../constants/styles";
import MainAsyncButton from "../../../components/ui/MainAsyncButton";
import { setName } from "../../../store/slices/registerSlice";
import { styles } from "./Name.styles";

export default function Name() {
    const navigation = useNavigation();
    const [nameInput, setNameInput] = useState('');
    const [validName, setValidName] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const dispatch = useDispatch();

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

        if (nameInput.length < 3) {
            setValidName(false);
            setError('');
            return;
        }

        const is_valid = isValidName(nameInput);
        
        setValidName(is_valid);

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