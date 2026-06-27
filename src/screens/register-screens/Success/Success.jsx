import React from "react";
import { View, Text } from "react-native";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import ScreenWrapper from "../../../components/common/ScreenWrapper";
import MainAsyncButton from "../../../components/ui/MainAsyncButton";
import { COLORS } from "../../../constants/colors";
import { styles } from "./Success.styles";

export default function Success() {
    const navigation = useNavigation();

    return (
        <ScreenWrapper>
            <View style={styles.container}>
                <View style={styles.content}>
                    <View style={styles.iconBadge}>
                        <MaterialCommunityIcons name="check-circle-outline" size={34} color={COLORS.success} />
                    </View>
                    <Text style={styles.title}>Conta criada!</Text>
                    <Text style={styles.subtitle}>Agora basta fazer login para desfrutar das novidades!</Text>
                </View>
                
                <View style={styles.buttonWrapper}>
                    <MainAsyncButton onPress={() => navigation.navigate('Login')} title="Fazer Login" />
                </View>
            </View>
        </ScreenWrapper>
    );
}
