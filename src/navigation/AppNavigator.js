import React, { useEffect } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { useSelector } from "react-redux";

import BottomTabNavigator from './BottomTabNavigator';

// Telas principais (Área Logada)
import MapScreen from '../screens/MapScreen';
import AlertsScreen from '../screens/AlertsScreen';
import TicketScreen from "../screens/TicketScreen";
import FacialRecognitionScreen from '../screens/FacialRecognitionScreen';
import CheckinSuccessScreen from '../screens/CheckinSuccessScreen';

// Telas de Auth (Login/Registro)
import WelcomeScreen from "../screens/WelcomeScreen";
import LoginScreen from "../screens/LoginScreen";
import TermsScreen from "../screens/TermsScreen";
import TaxIdScreen from "../screens/register/TaxIdScreen";
import NameScreen from "../screens/register/NameScreen";
import LicenseScreen from "../screens/register/LicenseScreen";
import DocumentCamera from "../screens/register/DocumentCamera";
import PhoneScreen from "../screens/register/PhoneScreen";
import PhoneCodeScreen from "../screens/register/PhoneCodeScreen";
import DriverLicenseNumberScreen from "../screens/register/DriverLicenseNumberScreen";
import DriverLicensePendingValidationScreen from "../screens/register/DriverLicenseNumberPendingValidationScreen";
import DriverLicenseInvalidScreen from "../screens/register/DriverLicenseInvalidScreen";
import PasswordScreen from "../screens/register/PasswordScreen";
import SuccessScreen from "../screens/register/SuccessScreen";
import InProgressConfirmationScreen from "../screens/register/InProgressConfirmationScreen";
import UserNotFoundScreen from "../screens/register/UserNotFoundScreen";

import { COLORS } from "../constants/colors";

const Stack = createStackNavigator();

const screenOptions = {
    headerBackTitle: 'Voltar',
    headerTintColor: COLORS.primary,
    headerStyle: {
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0,
    }
};

export default function AppNavigator() {
    const { isAuthenticated, isOffline, savedTaxId } = useSelector((state) => state.auth);

    // ✅ LÓGICA DE ROTEAMENTO BASEADA NO ESTADO
    // Isso acontece DINAMICAMENTE conforme o estado muda
    const shouldShowAppStack = isAuthenticated; // Online autenticado OU Offline com dados salvos

    return (
        <Stack.Navigator
            screenOptions={{
                // Remove initialRouteName - deixa o Stack decidir dinamicamente
                animationEnabled: true,
            }}
        >
            {shouldShowAppStack ? (
                // ---------------------------------------------------------
                // GRUPO 1: USUÁRIO LOGADO (APP STACK)
                // Acessível quando:
                // - isAuthenticated = true (sessão válida online)
                // - isAuthenticated = true + isOffline = true (modo offline)
                // ---------------------------------------------------------
                <Stack.Group>
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
                        options={{ title: 'Alertas', ...screenOptions }} 
                    />
                    <Stack.Screen 
                        name='Ticket' 
                        component={TicketScreen} 
                        options={{ title: 'Ticket de Operação', ...screenOptions }} 
                    />
                    <Stack.Screen 
                        name="FacialRecognition" 
                        component={FacialRecognitionScreen} 
                        options={{ title: 'Reconhecimento Facial', ...screenOptions }} 
                    />
                    <Stack.Screen 
                        name="CheckinSuccess" 
                        component={CheckinSuccessScreen} 
                        options={{ headerShown: false }} 
                    />
                </Stack.Group>
            ) : (
                // ---------------------------------------------------------
                // GRUPO 2: USUÁRIO NÃO LOGADO (AUTH STACK)
                // Acessível quando:
                // - isAuthenticated = false (sem credenciais ou sessão expirada)
                // ---------------------------------------------------------
                <Stack.Group>
                    {/* 
                        A ordem aqui importa para o initialRouteName automático:
                        - Se tem savedTaxId → vai para Login
                        - Se não tem → vai para Welcome
                    */}
                    <Stack.Screen 
                        name='Welcome' 
                        component={WelcomeScreen} 
                        options={{ headerShown: false }} 
                    />
                    <Stack.Screen 
                        name='Login' 
                        component={LoginScreen} 
                        options={{ headerShown: false }}
                        initialParams={{ tax_id: savedTaxId }} // ✅ Passa savedTaxId
                    />
                    <Stack.Screen 
                        name='UserNotFound' 
                        component={UserNotFoundScreen} 
                        options={{ headerShown: false }} 
                    />
                    
                    {/* Telas de Registro */}
                    <Stack.Screen 
                        name='InProgressConfirmation' 
                        component={InProgressConfirmationScreen} 
                        options={{ headerShown: false }} 
                    />
                    <Stack.Screen 
                        name='TaxId' 
                        component={TaxIdScreen} 
                        options={{ title: '', ...screenOptions }} 
                    />
                    <Stack.Screen 
                        name='Name' 
                        component={NameScreen} 
                        options={{ title: '', ...screenOptions }} 
                    />
                    <Stack.Screen 
                        name='Phone' 
                        component={PhoneScreen} 
                        options={{ title: '', ...screenOptions }} 
                    />
                    <Stack.Screen 
                        name="License" 
                        component={LicenseScreen}
                        options={{ title: 'Documento de Identificação', ...screenOptions }}
                    />
                    <Stack.Screen 
                        name="DocumentCamera" 
                        component={DocumentCamera}
                        options={{ 
                            headerShown: false,
                            gestureEnabled: false,
                            presentation: 'fullScreenModal', 
                            ...screenOptions
                        }}
                    />
                    <Stack.Screen 
                        name='AuthFacialRecognition' 
                        component={FacialRecognitionScreen} 
                        options={{ title: 'Reconhecimento Facial', ...screenOptions }} 
                    />
                    <Stack.Screen 
                        name='PhoneCode' 
                        component={PhoneCodeScreen} 
                        options={{ 
                            title: '', 
                            ...screenOptions, 
                            headerLeft: () => null, 
                            gestureEnabled: false 
                        }} 
                    />
                    <Stack.Screen 
                        name='DriverLicenseNumber' 
                        component={DriverLicenseNumberScreen} 
                        options={{ 
                            title: '', 
                            ...screenOptions, 
                            headerLeft: () => null, 
                            gestureEnabled: false 
                        }} 
                    />
                    <Stack.Screen 
                        name='DriverLicenseInvalid' 
                        component={DriverLicenseInvalidScreen} 
                        options={{ headerShown: false }} 
                    />
                    <Stack.Screen 
                        name='DriverLicensePendingValidation' 
                        component={DriverLicensePendingValidationScreen} 
                        options={{ headerShown: false }} 
                    />
                    <Stack.Screen 
                        name='Password' 
                        component={PasswordScreen} 
                        options={{ 
                            title: '', 
                            ...screenOptions, 
                            headerLeft: () => null, 
                            gestureEnabled: false 
                        }} 
                    />
                    <Stack.Screen 
                        name='Success' 
                        component={SuccessScreen} 
                        options={{ headerShown: false }} 
                    />
                </Stack.Group>
            )}
        </Stack.Navigator>
    );
}