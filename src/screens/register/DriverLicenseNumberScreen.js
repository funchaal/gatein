import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from '@react-navigation/native';
import uuid from 'react-native-uuid';
import Input from "../../components/common/Input";
import { COLORS } from "../../constants/colors";
import { useDispatch } from "react-redux";
import { validateDriverLicenseRequest } from "../../store/slices/registerSlice";
import { globalStyles } from "../../constants/styles";
import MainAsyncButton from "../../components/common/MainAsyncButton";
import LoadingModal from "../../components/common/LoadingModal";

export default function DriverLicenseNumberScreen({ route }) {
    const navigation = useNavigation();
    const [driverLicense, setDriverLicense] = useState('');
    const [validDriverLicense, setValidDriverLicense] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const dispatch = useDispatch();

    const handleNext = async () => {
        setLoading(true);
        setError('');
        try {
            const deviceId = uuid.v4();
            await dispatch(validateDriverLicenseRequest({ 
                driver_license: driverLicense,
                device: deviceId 
            })).unwrap();

            // On success, navigate to Password screen
            navigation.reset({
                index: 0,
                routes: [{ name: 'Password' }],
            });
            
        }
        catch (err) {
            if (err.code === 'DRIVER_LICENSE_NUMBER_MISMATCH') {
                navigation.navigate('DriverLicenseInvalid')
                setError('O número da CNH não corresponde ao encontrado em nosso sistema.');
            } 
            else if (err.code === 'DRIVER_LICENSE_NUMBER_PENDING_VALIDATION'){
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'DriverLicensePendingValidation' }],
                });
                setError('Ocorreu um erro ao validar sua CNH.');
            }
            else {
                console.log(err)
                setError(err.message || 'Ocorreu um erro ao validar sua CNH.');
            }
        }
        finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        setError('');
        if (driverLicense.length > 5) { // Basic validation
            setValidDriverLicense(true);
        } else {
            setValidDriverLicense(false);
        }
    }, [driverLicense]);

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.content}>
                    <Text style={globalStyles.title}>Valide sua CNH</Text>
                    <Input 
                        label='Número da CNH' 
                        placeholder='01234567890' 
                        width='100%' 
                        onChangeText={(text) => setDriverLicense(text)} 
                        value={driverLicense} 
                        keyboardType="number-pad" 
                        maxLength={11}
                        error={error}
                    />
                </View>

                <MainAsyncButton onPress={handleNext} disabled={!validDriverLicense}/>
            </View>
            <LoadingModal visible={loading} text="Validando sua CNH..." />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    container: {
        flex: 1,
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10
    },
    content: {
        flex: 1,
    }
});