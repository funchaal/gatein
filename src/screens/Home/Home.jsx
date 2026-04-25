import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

// Componentes do Projeto
import AppointmentList from "../../components/appointments/AppointmentsList";
import HomeHeader from "./components/HomeHeader";

import { styles } from './Home.styles';

// Wrapper Principal com o Provider
export default function HomeScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <HomeHeader />
            <AppointmentList type="active" />
        </SafeAreaView>
    );
}