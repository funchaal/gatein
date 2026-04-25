import React from 'react';
import { ScrollView, Text } from 'react-native';
import { styles } from '../Terms.styles';

export default function TermsBody() {
    return (
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
    );
}