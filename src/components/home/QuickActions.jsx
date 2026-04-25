import React from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDispatch } from 'react-redux';
import { openChatModal } from '../../store/slices/chatSlice';

const THEME = {
    slate900: '#0F172A',
    slate100: '#F1F5F9', // Fundo do botão
    slate600: '#475569', // Cor do ícone/texto
    orange:   '#F97316',
};

const actions = [
    { id: 'docs', label: 'Meus Docs', icon: 'document-text-outline' },
    { id: 'chat', label: 'Chat Suporte', icon: 'chatbubble-ellipses-outline', badge: 2 }, // Exemplo com notificação
    { id: 'wallet', label: 'Financeiro', icon: 'card-outline' },
    { id: 'help', label: 'Ajuda', icon: 'help-circle-outline' },
];

export default function QuickActions() {
    const dispatch = useDispatch();

    const handlePress = (actionId) => {
        if (actionId === 'chat') {
            dispatch(openChatModal());
        }
        // Adicionar outras ações aqui se necessário
    };

    return (
        <View style={styles.container}>
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {actions.map((action) => (
                    <TouchableOpacity 
                        key={action.id} 
                        style={styles.chip}
                        onPress={() => handlePress(action.id)}
                    >
                        <Icon name={action.icon} size={20} color={THEME.slate600} />
                        
                        <Text style={styles.label}>{action.label}</Text>
                        
                        {action.badge && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{action.badge}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
        marginTop: 2,
    },
    scrollContent: {
        paddingHorizontal: 12, // Alinha com a margem dos cards
        gap: 10, // Espaço entre os botões
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white', // Fundo sutil
        height: 45, 
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 15, // Pílula completa
        borderWidth: 1,
        borderColor: '#E2E8F0',
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: THEME.slate900,
    },
    badge: {
        backgroundColor: THEME.orange,
        borderRadius: 10,
        width: 18,
        height: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 4,
    },
    badgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    }
});