import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import BottomTabNavigator from './BottomTabNavigator';

// Telas principais (Área Logada)
import MapScreen from '../screens/Map';
import AlertsScreen from '../screens/backlog/AlertsScreen';
import TicketScreen from "../screens/Ticket";
import CheckinProcessingScreen from '../screens/CheckinProcessing';
import CheckinSuccess from '../screens/CheckinSuccess';
import CheckinFail from '../screens/CheckinFail';
import ServicesScreen from '../screens/Services';
import CompanyServicesScreen from '../screens/CompanyServices';
import ServiceWebViewScreen from '../screens/ServiceWebView';

import SecurityScreen from '../screens/Security/SecurityScreen';
import ResetPasswordScreen from '../screens/Security/ResetPasswordScreen';
import ResetPasswordSuccessScreen from '../screens/Security/ResetPasswordSuccessScreen';
import ForgotPasswordScreen from '../screens/Security/ForgotPasswordScreen';
import ForgotPasswordCodeScreen from '../screens/Security/ForgotPasswordCodeScreen';

import PersonalDataScreen from '../screens/Profile/PersonalDataScreen';
import EmailInputScreen from '../screens/Profile/EmailInputScreen';
import EmailCodeScreen from '../screens/Profile/EmailCodeScreen';
import EmailPromptScreen from '../screens/Profile/EmailPromptScreen';
import PhoneScreen from '../screens/register-screens/Phone';
import PhoneCodeScreen from '../screens/register-screens/PhoneCode';

import { COLORS } from "../constants/colors";

const Stack = createStackNavigator();

const getScreenOptions = ({ navigation }) => ({
    headerTitleAlign: 'center',
    headerBackTitleVisible: false,
    headerTintColor: COLORS.primary,
    headerTitleStyle: {
        color: '#0F172A',
        fontSize: 20,
        fontWeight: '700',
    },
    headerStyle: {
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0,
    },
    headerLeft: () => {
        if (!navigation.canGoBack()) return null;
        return (
            <TouchableOpacity 
                onPress={() => navigation.goBack()} 
                style={{
                    marginLeft: 16,
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: 'rgba(249, 115, 22, 0.08)',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Icon name="chevron-left" size={24} color={COLORS.primary} />
            </TouchableOpacity>
        );
    }
});

export default function AppStack() {
    return (
        <Stack.Navigator screenOptions={({ navigation }) => ({ animationEnabled: true, ...getScreenOptions({ navigation }) })}>
            <Stack.Screen 
                name="Main" 
                component={BottomTabNavigator} 
                options={{ headerShown: false }} 
            />
            <Stack.Screen 
                name="Map" 
                component={MapScreen} 
                options={{ headerShown: false }} 
            />
            <Stack.Screen 
                name="Alerts" 
                component={AlertsScreen} 
                options={{ title: 'Alertas' }} 
            />
            <Stack.Screen 
                name='Ticket' 
                component={TicketScreen} 
                options={{ title: 'Ticket de Operação' }} 
            />
            <Stack.Screen 
                name="CheckinProcessing" 
                component={CheckinProcessingScreen} 
                options={{ headerShown: false }} 
            />
            <Stack.Screen 
                name="CheckinSuccess" 
                component={CheckinSuccess} 
                options={{ headerShown: false }} 
            />
            <Stack.Screen 
                name="CheckinFail" 
                component={CheckinFail} 
                options={{ headerShown: false }} 
            />
            <Stack.Screen 
                name="Services" 
                component={ServicesScreen} 
                options={{ title: 'Serviços' }} 
            />
            <Stack.Screen 
                name="CompanyServices" 
                component={CompanyServicesScreen} 
                options={{ title: 'Detalhes da Empresa' }} 
            />
            <Stack.Screen 
                name="ServiceWebView" 
                component={ServiceWebViewScreen} 
                options={{ title: 'Serviço' }} 
            />
            <Stack.Screen 
                name="Security" 
                component={SecurityScreen} 
                options={{ headerShown: false }} 
            />
            <Stack.Screen 
                name="ResetPassword" 
                component={ResetPasswordScreen} 
                options={{ title: 'Redefinir Senha' }} 
            />
            <Stack.Screen 
                name="ResetPasswordSuccess" 
                component={ResetPasswordSuccessScreen} 
                options={{ headerShown: false, gestureEnabled: false }} 
            />
            <Stack.Screen 
                name='ForgotPassword' 
                component={ForgotPasswordScreen} 
                options={{ title: 'Esqueci minha senha' }} 
            />
            <Stack.Screen 
                name='ForgotPasswordCode' 
                component={ForgotPasswordCodeScreen} 
                options={{ title: 'Código de Validação' }} 
            />
            <Stack.Screen 
                name="PersonalData" 
                component={PersonalDataScreen} 
                options={{ headerShown: false }} 
            />
            <Stack.Screen 
                name="EmailInput" 
                component={EmailInputScreen} 
                options={{ title: '' }} 
            />
            <Stack.Screen 
                name="EmailCode" 
                component={EmailCodeScreen} 
                options={{ 
                    title: '',
                    headerLeft: () => null,
                    gestureEnabled: false
                }} 
            />
            <Stack.Screen 
                name='Phone' 
                component={PhoneScreen} 
                options={{ title: '' }} 
            />
            <Stack.Screen 
                name='PhoneCode' 
                component={PhoneCodeScreen} 
                options={{ 
                    title: '', 
                    headerLeft: () => null, 
                    gestureEnabled: false 
                }} 
            />
            <Stack.Screen 
                name="EmailPrompt" 
                component={EmailPromptScreen} 
                options={{ 
                    headerShown: false,
                    gestureEnabled: false 
                }} 
            />
        </Stack.Navigator>
    );
}
