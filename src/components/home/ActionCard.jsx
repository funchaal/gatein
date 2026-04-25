import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { DRIVER_STATUS } from '../../constants/driver_status';
import { COLORS } from '../../constants/colors';

// Pequenos componentes para organizar o card
const InfoLine = ({ label, value }) => (
    <Text style={styles.infoLineText}>
        <Text style={styles.infoLabel}>{label}: </Text>
        <Text style={styles.infoValue}>{value}</Text>
    </Text>
);

const ActionButton = ({ text, onPress, disabled = false, type = 'primary' }) => (
    <Pressable 
        onPress={onPress} 
        disabled={disabled}
        style={[
            styles.button, 
            type === 'primary' ? styles.primaryButton : styles.secondaryButton,
            disabled && styles.disabledButton
        ]}
    >
        <Text style={type === 'primary' ? styles.primaryButtonText : styles.secondaryButtonText}>
            {text}
        </Text>
    </Pressable>
);

export default function ActionCard({ status, appointment }) {
    const renderContent = () => {
        switch (status) {
            case DRIVER_STATUS.EM_TRANSITO:
                return (
                    <>
                        <Text style={styles.title}>Próximo Destino</Text>
                        <Text style={styles.terminalName}>{appointment.terminal}</Text>
                        <InfoLine label="Horário" value={appointment.horario} />
                        <InfoLine label="Placa" value={appointment.placa} />
                        <ActionButton text="Navegar até o Terminal" onPress={() => alert('Abrir Waze/Google Maps')} />
                    </>
                );
            case DRIVER_STATUS.APROXIMANDO:
                 return (
                    <>
                        <Text style={styles.title}>Atenção</Text>
                        <Text style={styles.mainInfo}>Você está se aproximando do {appointment.terminal}</Text>
                        <Text style={styles.subtitle}>Entrada pelo Gate 3</Text>
                        <ActionButton text="Ver Instruções de Acesso" onPress={() => {}} type="secondary" />
                    </>
                );
            case DRIVER_STATUS.PRONTO_CHECKIN:
                return (
                    <>
                        <Text style={styles.title}>Pronto para Check-in</Text>
                        <Text style={styles.mainInfo}>Bem-vindo ao {appointment.terminal}</Text>
                        <ActionButton text="Realizar Check-innnnn" onPress={() => alert('Abrindo câmera para biometria...')} />
                    </>
                );
            case DRIVER_STATUS.DENTRO_TERMINAL:
                return (
                     <>
                        <Text style={styles.title}>Dirija-se para:</Text>
                        <Text style={styles.locationInfo}>{appointment.localizacaoInterna}</Text>
                        <Text style={styles.subtitle}>Siga as instruções no mapa abaixo.</Text>
                        <ActionButton text="Ver Mapa Interno" onPress={() => {}} />
                    </>
                );
            default:
                return <Text>Nenhum agendamento ativo.</Text>;
        }
    };
    
    // Muda a cor do card com base no status
    const cardStyle = {
        [DRIVER_STATUS.EM_TRANSITO]: styles.cardDefault,
        [DRIVER_STATUS.APROXIMANDO]: styles.cardWarning,
        [DRIVER_STATUS.PRONTO_CHECKIN]: styles.cardSuccess,
        [DRIVER_STATUS.DENTRO_TERMINAL]: styles.cardInfo,
    }[status];

    return <View style={[styles.card, cardStyle]}>{renderContent()}</View>;
}


const styles = StyleSheet.create({
    card: {
        width: '90%',
        borderRadius: 10,
        padding: 20,
        marginTop: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    cardDefault: { backgroundColor: '#fff' },
    cardWarning: { backgroundColor: '#fffbe6' }, // Amarelo claro
    cardSuccess: { backgroundColor: '#f0fff4' }, // Verde claro
    cardInfo: { backgroundColor: '#e6f7ff' }, // Azul claro
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#888',
        marginBottom: 8,
    },
    terminalName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    mainInfo: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
    },
    locationInfo: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.primary,
        textAlign: 'center',
        marginVertical: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    infoLineText: {
        fontSize: 16,
        color: '#555',
        marginBottom: 4,
    },
    infoLabel: {
        fontWeight: 'normal',
    },
    infoValue: {
        fontWeight: 'bold',
    },
    button: {
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 15,
    },
    primaryButton: {
        backgroundColor: 'red',
    },
    secondaryButton: {
        backgroundColor: COLORS.primary,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    secondaryButtonText: {
        color: COLORS.primary,
        fontSize: 16,
        fontWeight: 'bold',
    },
});
