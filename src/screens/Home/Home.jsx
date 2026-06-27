import React, { useEffect } from "react";
import { StyleSheet, Text, ScrollView, View } from "react-native";
import ScreenWrapper from "../../components/common/ScreenWrapper";
import ActivityList from "../../components/appointments/ActivityList";
import HomeTopBar from "./components/HomeTopBar";
import AnnouncementsCarousel from "./components/AnnouncementsCarousel";
import HomeDivider from "./components/HomeDivider";
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

    return (
        <ScreenWrapper noPadding={true}>
            <ScrollView 
                showsVerticalScrollIndicator={true} 
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.headerContainer}>
                    <HomeTopBar />
                    <AnnouncementsCarousel />
                    <HomeDivider />
                    <ActionButtons />
                    <Text style={styles.sectionTitle}>Próximos agendamentos</Text>
                </View>
                <ActivityList 
                    type="active-all" 
                    padded={true}
                    scrollable={false}
                />
            </ScrollView>
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
        paddingBottom: 10,
        backgroundColor: 'white',
    },
    headerContainer: {
        paddingHorizontal: 20,
    },
});
