import React, { useEffect } from "react";
import { StyleSheet, View, Text, Pressable, SafeAreaView, Platform, StatusBar, Image } from "react-native";
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Provider, useDispatch, useSelector } from 'react-redux'; 
import { store } from '../store'; 

// Componentes do Projeto
import MapCard from '../components/home/MapCard';
import QuickActions from "../components/home/QuickActions"; 
import GreetingSection from "../components/home/GreetingSection";
import AppointmentList from "../components/appointments/AppointmentsList"; 
import { openChatModal } from "../store/slices/chatSlice";

import { fetchAppointmentsData, selectAppointmentsStatus } from '../store/slices/appointmentsSlice';

// Constantes
import { COLORS } from '../constants/colors';

// Componente Interno da Home
function HomeContent() {
    const navigation = useNavigation();
    const dispatch = useDispatch();

    const status = useSelector(selectAppointmentsStatus);

    useEffect(() => {
        // Dispara a busca (pode passar o ID do usuário logado)
        if (status === 'idle') {
            dispatch(fetchAppointmentsData('user_123'));
        }
    }, [dispatch, status]);

    // O Header agora é passado como componente para o AppointmentList
    const HeaderComponent = () => (
        <View>
            {/* Top Bar (Notificações) */}
            <View style={styles.headerContainer}>
                <View style={[styles.headerTop, {justifyContent: 'flex-end'}]}>
                    <Pressable style={styles.headerButton} onPress={() => navigation.navigate('Alerts')}>
                        <Icon name="notifications-outline" size={24} color={COLORS.primary || '#F97316'} />
                    </Pressable>
                </View>
            </View>

            {/* Seções de Conteúdo */}
            <GreetingSection />
            
            <View style={{ marginTop: 10 }}>
                <QuickActions />
            </View>
            
            <MapCard />
            
            <Text style={styles.sectionTitle}>
                Próximos agendamentos
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* AppointmentList já contém a lógica de:
                - useDispatch(fetchAppointments) no useEffect interno
                - useSelector para pegar os dados
                Portanto, não é estritamente necessário chamar dispatch aqui fora,
                a menos que queira pré-carregar os dados.
            */}
            <AppointmentList 
                type="active" 
                driverId="123" // Pegar do AuthSlice no futuro
                ListHeaderComponent={<HeaderComponent />}
            />
        </SafeAreaView>
    );
}

// Wrapper Principal com o Provider
export default function HomeScreen() {
    return (
        <HomeContent />
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    headerContainer: {
        paddingHorizontal: 15,
        paddingTop: 10
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    logo: {
        width: 150,
        height: 33.75,
    },
    headerButton: {
        padding: 5, // Aumenta área de toque
    },
    statusBox: {
        marginTop: 10,
        backgroundColor: 'rgba(0, 0, 255, 0.1)',
        borderRadius: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: 'blue',
    },
    statusText: {
        color: 'blue',
        textAlign: 'center',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        paddingHorizontal: 20,
        letterSpacing: 0.5,
        color: '#475569', // Slate-600 (Tema Gate In)
        marginTop: 20,
        marginBottom: 10,
    }
});