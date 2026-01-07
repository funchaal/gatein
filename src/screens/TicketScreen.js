import React from "react";
import { StyleSheet, View, Text, Pressable, ScrollView } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { COLORS } from "../constants/colors";
import Divisor from "../components/common/Divisor"; // Componente extraído

// Pequeno componente para evitar repetição de código
const InfoRow = ({ label, value }) => (
    <View style={styles.infoRow}>
        <Text style={styles.label}>{label}:</Text>
        <Text style={styles.value}>{value}</Text>
    </View>
);

export default function TicketScreen() {
    const navigation = useNavigation();

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>DP World Santos</Text>
                <Text style={styles.headerSubtitle}>Guia de movimentação de container</Text>
                <Text style={styles.headerSubtitle}>Recebimento Exportação</Text>
            </View>
            <Divisor/>
            <InfoRow label="Container" value="SEGU6547680" />
            <InfoRow label="Tamanho/ISO" value="45G1/45G1" />
            <InfoRow label="PB Container" value="28710.0" />
            <Divisor/>
            <InfoRow label="Placa do Veículo" value="DTC2069" />
            <InfoRow label="Peso Balança" value="35246.0" />
            <Divisor/>
            <InfoRow label="Motorista" value="Adalberto Pereira da Silva" />
            <InfoRow label="CPF" value="254.893.675-54" />
            <Divisor/>
            <View style={styles.instructionBlock}>
                <Text style={styles.instructionTitle}>Localização:</Text>
                <Text style={styles.instructionValue}>Bloco 1E / Quadra 14</Text>
            </View>
            <Divisor/>
            <Text style={styles.notice}>Passagem obrigatória pelo Scanner 2</Text>
            <Divisor/>

            <Pressable onPress={() => { /* Lógica de Download */ }} style={styles.button}>
                <Text style={styles.buttonText}>Download Ticket</Text>
            </Pressable>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    contentContainer: {
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 10,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#444'
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 5,
    },
    label: {
        color: '#555',
        fontSize: 16,
    },
    value: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    instructionBlock: {
        alignItems: 'center',
        marginVertical: 10,
        padding: 10,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
    },
    instructionTitle: {
        fontSize: 16,
        color: '#555'
    },
    instructionValue: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 4,
    },
    notice: {
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#d9534f', // Um tom de vermelho
        fontSize: 16,
    },
    button: {
        height: 50,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 40,
        marginTop: 20,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

