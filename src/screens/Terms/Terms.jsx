import React from "react";
import { View, Text, Pressable } from "react-native";
import { useNavigation } from '@react-navigation/native';

import TermsBody from "./components/TermsBody";
import { handleAgree } from "./helpers";
import { styles } from "./Terms.styles";

export default function TermsScreen() {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <TermsBody />

            <View style={styles.footer}>
                <Pressable onPress={() => handleAgree(navigation)} style={styles.button}>
                    <Text style={styles.buttonText}>Concordar e acessar</Text>
                </Pressable>
            </View>
        </View>
    );
}