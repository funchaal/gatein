
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { STATUS } from '../../constants/status';

const statusColors = {
    [STATUS.NO_ACTION]: {
        background: '#e9ecef',
        font: '#495057',
        buttonBackground: '#495057',
        buttonFont: '#ffffff',
    },
    [STATUS.CHECKIN_AVAILABLE]: {
        background: '#8e44ad',
        font: '#ffffff',
        buttonBackground: '#ffffff',
        buttonFont: '#8e44ad',
    },
    [STATUS.CHECKIN_DONE]: {
        background: '#3498db',
        font: '#ffffff',
        buttonBackground: '#ffffff',
        buttonFont: '#3498db',
    },
};

const ActionButton = ({ text, onPress, disabled = false, backgroundColor, fontColor }) => (
    <Pressable 
        onPress={onPress} 
        disabled={disabled}
        style={[
            styles.button,
            { backgroundColor: backgroundColor },
            disabled && styles.disabledButton
        ]}
    >
        <Text style={[styles.buttonText, { color: fontColor }]}>
            {text}
        </Text>
    </Pressable>
);

export default function StatusCard({ status, terminal }) {
    const navigation = useNavigation();
    const colors = statusColors[status] || statusColors[STATUS.NO_ACTION];

    const renderContent = () => {
        switch (status) {
            case STATUS.NO_ACTION:
                return (
                    <>
                        <Text style={[styles.title, { color: colors.font }]}>Status</Text>
                        <Text style={[styles.mainInfo, { color: colors.font }]}>Sem ações disponíveis no momento.</Text>
                    </>
                );
            case STATUS.CHECKIN_AVAILABLE:
                return (
                    <>
                        <Text style={[styles.title, { color: colors.font }]}>Check-in disponível</Text>
                        <Text style={[styles.mainInfo, { color: colors.font }]}>Check-in no terminal {terminal}</Text>
                        <Text style={[styles.subtitle, { color: colors.font }]}>Você está dentro do raio de check-in do terminal. Faça a biometria para agilizar sua entrada.</Text>
                        <ActionButton 
                            text="Realizar Check-in" 
                            onPress={() => alert('Abrindo câmera para biometria...')} 
                            backgroundColor={colors.buttonBackground} 
                            fontColor={colors.buttonFont} 
                        />
                    </>
                );
            case STATUS.CHECKIN_DONE:
                return (
                    <>
                        <Text style={[styles.title, { color: colors.font }]}>Check-in realizado</Text>
                        <Text style={[styles.mainInfo, { color: colors.font }]}>Check-in no terminal {terminal} concluído com sucesso!</Text>
                        <ActionButton 
                            text="Ver Ticket" 
                            onPress={() => navigation.navigate('TicketScreen')} 
                            backgroundColor={colors.buttonBackground} 
                            fontColor={colors.buttonFont} 
                        />
                    </>
                );
            default:
                return <Text>Nenhum status definido.</Text>;
        }
    };

    return <View style={[styles.card, { backgroundColor: colors.background }]}>{renderContent()}</View>;
}

const styles = StyleSheet.create({
    card: {
        width: '100%',
        borderRadius: 15,
        padding: 15,
    },
    title: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 5,
        opacity: 0.8,
    },
    mainInfo: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
        textAlign: 'left',
    },
    subtitle: {
        fontSize: 14,
        textAlign: 'left',
        marginBottom: 15,
        opacity: 0.9,
    },
    button: {
        height: 45,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    disabledButton: {
        backgroundColor: '#ccc',
        borderColor: '#ccc',
    },
    buttonText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
});
