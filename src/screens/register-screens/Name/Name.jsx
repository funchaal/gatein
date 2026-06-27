import React, { useEffect, useState } from "react";
import { View, Text, Keyboard } from "react-native";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ScreenWrapper from "../../../components/common/ScreenWrapper";
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from "react-redux";

import Input from "../../../components/ui/Input";
import MainAsyncButton from "../../../components/ui/MainAsyncButton";
import { setName } from "../../../store/slices/registerSlice";
import { COLORS } from "../../../constants/colors";
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
        <ScreenWrapper>
            <View style={styles.container}>
                <View style={styles.content}>
                    <View style={styles.iconBadge}>
                        <MaterialCommunityIcons name="account-outline" size={34} color={COLORS.primary} />
                    </View>
                    <Text style={styles.title}>Qual é o seu nome?</Text>
                    <Text style={styles.subtitle}>Informe seu nome completo</Text>
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

                <View style={styles.buttonWrapper}>
                    <MainAsyncButton onPress={handleNext} disabled={!validName} loading={loading}/>
                </View>
            </View>
        </ScreenWrapper>
    );
}

