import React from "react";
import { StyleSheet, View, Text, Pressable, ScrollView } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { COLORS } from "../constants/colors";

export default function TermsScreen() {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>Termo de uso do aplicativo {'\n'}ConnectPort</Text>
                <Text style={styles.bodyText}>
                    <Text style={styles.sectionTitle}>1. Aceitação dos Termos</Text>{'\n'}
                    Ao baixar, instalar e utilizar o aplicativo ConnectPort (“Aplicativo”), você concorda em cumprir e aceitar todos os termos e condições estabelecidos neste Termo de Uso. Caso não concorde com qualquer parte dos termos, recomendamos que não utilize o Aplicativo.
                    {'\n\n'}
                    <Text style={styles.sectionTitle}>2. Licença de Uso</Text>{'\n'}
                    A ConnectPort concede ao usuário uma licença limitada, não exclusiva e revogável para utilizar o Aplicativo exclusivamente para fins pessoais e não comerciais. Esta licença é intransferível e não permite sublicenciamento.
                    {'\n\n'}
                    <Text style={styles.sectionTitle}>3. Cadastro e Conta do Usuário</Text>{'\n'}
                    Para acessar determinadas funcionalidades do Aplicativo, o usuário poderá precisar criar uma conta. É de responsabilidade do usuário manter a confidencialidade de suas informações de login e senha.
                    {'\n\n'}
                    <Text style={styles.sectionTitle}>4. Privacidade e Segurança</Text>{'\n'}
                    A ConnectPort se compromete a proteger a privacidade dos usuários. As informações coletadas serão utilizadas exclusivamente para melhorar a experiência do usuário no Aplicativo e conforme detalhado na nossa Política de Privacidade.
                </Text>
            </ScrollView>

            <View style={styles.footer}>
                <Pressable onPress={() => navigation.navigate('Home')} style={styles.button}>
                    <Text style={styles.buttonText}>Concordar e acessar</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    scrollContent: {
        paddingTop: 60,
        paddingBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        textTransform: 'uppercase',
        marginBottom: 20,
        color: '#333',
    },
    bodyText: {
        fontSize: 15,
        lineHeight: 24,
        color: '#555',
    },
    sectionTitle: {
        fontWeight: 'bold',
        color: '#333',
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        backgroundColor: '#fff',
    },
    button: {
        height: 50,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 40,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

