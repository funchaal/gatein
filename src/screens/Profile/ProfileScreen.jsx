import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import { useNavigation } from '@react-navigation/native';
import ListItem from '../../components/ui/ListItem';
import ScreenHeader from '../../components/ui/ScreenHeader';
import { COLORS } from '../../constants/colors';
import { useSelector } from 'react-redux';
import { capitalize } from '../../utils/tools';
import { User, Shield, ChevronRight } from 'lucide-react-native';

export default function ProfileScreen() {
    const navigation = useNavigation();
    const user = useSelector((state) => state.auth.user) || {};

    const handleSecurityPress = () => {
        navigation.navigate('Security');
    };



    // Helper to extract initials
    const getInitials = (name) => {
        if (!name) return "RN";
        const parts = name.trim().split(" ");
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    const displayName = capitalize(user.name || 'rafael n.');
    const displayPhone = user.phone || '+55 (11) 98765-4321';

    return (
        <ScreenWrapper noPadding={true}>
            <ScreenHeader title="Perfil" noBorder={true} />

            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                {/* Compact Profile Info */}
                <View style={styles.profileRow}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{getInitials(displayName)}</Text>
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.userName} numberOfLines={1}>{displayName}</Text>
                        <Text style={styles.userPhone} numberOfLines={1}>{displayPhone}</Text>
                    </View>
                </View>

                {/* Wide line separator from border to border */}
                <View style={styles.divider} />

                {/* Settings list items */}
                <ListItem 
                    title="Contato" 
                    subtitles={["Celular e email"]}
                    onPress={() => navigation.navigate("PersonalData")}
                    rightElement={<ChevronRight size={18} color="#94A3B8" />}
                    leftElement={<User size={22} color="#666666" />}
                />

                <ListItem 
                    title="Segurança" 
                    subtitles={["Acesso, senha e desconectar"]}
                    onPress={handleSecurityPress}
                    rightElement={<ChevronRight size={18} color="#94A3B8" />}
                    leftElement={<Shield size={22} color="#666666" />}
                />
            </ScrollView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#FFFFFF',
        paddingBottom: 40,
    },
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 22,
        fontWeight: '600',
        color: '#475569',
    },
    profileInfo: {
        marginLeft: 16,
        justifyContent: 'center',
        flex: 1,
    },
    userName: {
        fontSize: 17,
        fontWeight: '600',
        color: '#0F172A',
        marginBottom: 2,
    },
    userPhone: {
        fontSize: 14,
        color: '#64748B',
    },
    divider: {
        height: 1,
        backgroundColor: '#E2E8F0',
    },
});
