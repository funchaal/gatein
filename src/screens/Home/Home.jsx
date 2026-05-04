import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import AppointmentList from "../../components/appointments/AppointmentsList";
import HomeHeader from "./components/HomeHeader";
import { styles } from './Home.styles';

export default function HomeScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <HomeHeader />
            {/* A lista de agendamentos assume o protagonismo da tela */}
            <AppointmentList type="active" />
        </SafeAreaView>
    );
}