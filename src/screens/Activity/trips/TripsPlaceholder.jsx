import React from "react";
import { View, Text } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { THEME } from "../../../components/appointments/AppointmentCard/constants";

export default function TripsPlaceholder() {
    return (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Icon name="ship-wheel" size={42} color={THEME.slate400} />
            <Text style={{ fontSize: 16, fontWeight: "700", color: THEME.slate900 }}>Viagens</Text>
            <Text style={{ fontSize: 13, color: THEME.slate400 }}>Em breve disponível</Text>
        </View>
    );
}
