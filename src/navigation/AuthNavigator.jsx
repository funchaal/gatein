import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import { TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import WelcomeScreen from '../screens/Welcome';
import LoginScreen from '../screens/Login';
import TaxIdScreen from '../screens/register-screens/TaxId';
import NameScreen from '../screens/register-screens/Name';
import PhoneScreen from '../screens/register-screens/Phone';
import PhoneCodeScreen from '../screens/register-screens/PhoneCode';
import DriverLicenseNumberScreen from '../screens/register-screens/DriverLicenseNumber';
import DriverLicensePendingValidationScreen from '../screens/register-screens/DriverLicenseNumberPendingValidation';
import DriverLicenseInvalidScreen from '../screens/register-screens/DriverLicenseInvalid';
import PasswordScreen from '../screens/register-screens/Password';
import SuccessScreen from '../screens/register-screens/Success';
import InProgressConfirmationScreen from '../screens/register-screens/InProgressConfirmation';
import UserNotFoundScreen from '../screens/register-screens/UserNotFound';

import ResetPasswordScreen from '../screens/Security/ResetPasswordScreen';
import ResetPasswordSuccessScreen from '../screens/Security/ResetPasswordSuccessScreen';
import ForgotPasswordScreen from '../screens/Security/ForgotPasswordScreen';
import ForgotPasswordCodeScreen from '../screens/Security/ForgotPasswordCodeScreen';

import { COLORS } from '../constants/colors';

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
                    marginLeft: 24,
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

export default function AuthNavigator() {
    const { savedTaxId } = useSelector((state) => state.auth);

    return (
        <Stack.Navigator screenOptions={({ navigation }) => ({ animationEnabled: true, ...getScreenOptions({ navigation }) })}>
            <Stack.Screen 
                name='Welcome' 
                component={WelcomeScreen} 
                options={{ headerShown: false }} 
            />
            <Stack.Screen 
                name='Login' 
                component={LoginScreen} 
                options={{ headerShown: false }}
                initialParams={{ tax_id: savedTaxId }}
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
                options={{ title: '' }} 
            />
            <Stack.Screen 
                name='Name' 
                component={NameScreen} 
                options={{ title: '' }} 
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
                name='DriverLicenseNumber' 
                component={DriverLicenseNumberScreen} 
                options={{ 
                    title: '', 
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
                    headerLeft: () => null, 
                    gestureEnabled: false 
                }} 
            />
            <Stack.Screen 
                name='Success' 
                component={SuccessScreen} 
                options={{ headerShown: false }} 
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
                name="ResetPassword" 
                component={ResetPasswordScreen} 
                options={{ title: 'Redefinir Senha' }} 
            />
            <Stack.Screen 
                name="ResetPasswordSuccess" 
                component={ResetPasswordSuccessScreen} 
                options={{ headerShown: false, gestureEnabled: false }} 
            />
        </Stack.Navigator>
    );
}
