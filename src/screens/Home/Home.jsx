import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import ScreenWrapper from "../../components/common/ScreenWrapper";
import ActivityList from "../../components/appointments/ActivityList";
import HomeTopBar from "./components/HomeTopBar";
import AnnouncementsCarousel from "./components/AnnouncementsCarousel";
import ActionButtons from "./components/ActionButtons";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";

export default function HomeScreen() {
    const navigation = useNavigation();
    const emailPromptRequired = useSelector((state) => state.auth.emailPromptRequired);

    useEffect(() => {
        if (emailPromptRequired) {
            navigation.navigate("EmailPrompt");
        }
    }, [emailPromptRequired, navigation]);

    const renderHomeHeader = () => (
        <View style={styles.headerContainer}>
            <HomeTopBar />
            <ActionButtons />
            <AnnouncementsCarousel />
            <Text style={styles.sectionTitle}>Próximas operações</Text>
        </View>
    );

    const homeEmptyState = {
        title: "Sem operações futuras por enquanto",
        subtitle: "Seus próximos agendamentos e viagens aparecerão aqui.",
        isDiscreet: true,
    };

    return (
        <ScreenWrapper noPadding={true}>
            <ActivityList 
                type="active-all" 
                padded={true}
                scrollable={true}
                ListHeaderComponent={renderHomeHeader()}
                contentContainerStyle={styles.scrollContent}
                emptyState={homeEmptyState}
            />
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingBottom: 32,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1a1a2e',
        paddingTop: 16,
        paddingBottom: 16,
        backgroundColor: 'white',
    },
    headerContainer: {
        paddingHorizontal: 20,
    },
});
