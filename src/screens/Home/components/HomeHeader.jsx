import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../../constants/colors';
import MapCard from '../../../components/home/MapCard';
import QuickActions from '../../../components/home/QuickActions';
import GreetingSection from '../../../components/home/GreetingSection';
import { styles } from '../Home.styles';

export default function HomeHeader() {
    const navigation = useNavigation();

    return (
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
}