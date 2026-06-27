import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import ListItem from '../../components/ui/ListItem';
import ListSeparator from '../../components/ui/ListSeparator';
import ScreenHeader from '../../components/ui/ScreenHeader';
import { useSelector } from 'react-redux';
import { Smartphone, Mail, ChevronRight } from 'lucide-react-native';

export default function PersonalDataScreen() {
    const navigation = useNavigation();
    const user = useSelector((state) => state.auth.user) || {};

    const formatPhone = (phoneStr) => {
        if (!phoneStr) return 'Não cadastrado';
        return phoneStr;
    };

    const hasEmail = !!user.email;

    return (
        <ScreenWrapper noPadding={true}>
            <ScreenHeader title="Contato" noBorder={true} />

            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                <ListItem 
                    title="Atualizar número de celular" 
                    subtitles={[formatPhone(user.phone)]}
                    onPress={() => navigation.navigate('Phone', { isUpdate: true })}
                    rightElement={<ChevronRight size={18} color="#94A3B8" />}
                    leftElement={<Smartphone size={22} color="#666666" />}
                />
                <ListSeparator />
                <ListItem 
                    title={hasEmail ? "Atualizar email" : "Adicionar email"} 
                    subtitles={[hasEmail ? user.email : "Nenhum cadastrado"]}
                    onPress={() => navigation.navigate('EmailInput', { isUpdate: true })}
                    rightElement={<ChevronRight size={18} color="#94A3B8" />}
                    leftElement={<Mail size={22} color="#666666" />}
                />
            </ScrollView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        paddingVertical: 16,
    },
});
