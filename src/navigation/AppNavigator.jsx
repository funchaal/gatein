import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { useSelector } from "react-redux";

import AuthNavigator from "./AuthNavigator";
import AppStack from "./AppStack";

const Stack = createStackNavigator();

export default function AppNavigator() {
    const { isAuthenticated } = useSelector((state) => state.auth);

    // ✅ LÓGICA DE ROTEAMENTO BASEADA NO ESTADO
    const shouldShowAppStack = isAuthenticated;

    return (
        <Stack.Navigator
            screenOptions={{
                animationEnabled: true,
                headerShown: false,
            }}
        >
            {shouldShowAppStack ? (
                <Stack.Screen 
                    name="AppFlow" 
                    component={AppStack} 
                />
            ) : (
                <Stack.Screen 
                    name="AuthFlow" 
                    component={AuthNavigator}
                />
            )}
        </Stack.Navigator>
    );
}
