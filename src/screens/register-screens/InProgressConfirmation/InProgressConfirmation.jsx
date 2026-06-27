import React from 'react';
import { View, Text, Pressable } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import { useDispatch } from 'react-redux';
import { useDeleteRegistrationRequestMutation } from '../../../services/api';
import { COLORS } from "../../../constants/colors";
import { styles } from './InProgressConfirmation.styles';

const handleRegistrationStep = (navigation, register_step, params = {}) => {
    switch (register_step) {
        case 'registered':
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login', params: { tax_id: params.tax_id }} ],
            });
            break;
        case 'driver_license':
            navigation.reset({
                index: 0,
                routes: [{ name: 'DriverLicenseNumber' } ],
            });
            break;
        case 'driver_license_pending_validation':
            navigation.reset({
                index: 0,
                routes: [{ name: 'DriverLicensePendingValidation' } ],
            });
            break;
        case 'password':
            navigation.reset({
                index: 0,
                routes: [{ name: 'Password' } ],
            });
            break;
        default:
            navigation.navigate('Name');
            break;
    }
};

const maskCpf = (cpf) => {
  if (!cpf) return '';
  const cleaned = cpf.replace(/\D/g, ''); 
  
  if (cleaned.length !== 11) return cpf; 
  
  return cleaned.replace(/^(\d{3})\d{6}(\d{2})$/, '$1.***.***-$2');
};

const InProgressConfirmation = ({ navigation, route }) => {
  const { tax_id, masked_name, register_step } = route.params || {};
  const dispatch = useDispatch();
  const [deleteRegistration] = useDeleteRegistrationRequestMutation();

  const handleContinue = () => {
    handleRegistrationStep(navigation, 'password', { tax_id });
  };

  const handleStartOver = async () => {
    try {
        await deleteRegistration({ tax_id }).unwrap();
        navigation.navigate('TaxId');
    } catch (error) {
        console.error('Failed to delete registration:', error);
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.content}>
            <View style={styles.iconBadge}>
                <MaterialCommunityIcons name="account-clock-outline" size={34} color={COLORS.primary} />
            </View>
            <Text style={styles.title}>Quase lá</Text>
            <Text style={styles.subtitle}>
                Identificamos um cadastro em andamento para o CPF <Text style={{fontWeight: 'bold'}}>{maskCpf(tax_id)}</Text>. O nome informado foi <Text style={styles.boldName}>{masked_name}</Text>, é você?
            </Text>
        </View>
        
        <View style={styles.buttonWrapper}>
            <Pressable onPress={handleContinue} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Sim, sou eu, continuar</Text>
            </Pressable>
            <Pressable onPress={handleStartOver} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Não sou eu, iniciar do zero</Text>
            </Pressable>
        </View>

      </View>
    </ScreenWrapper>
  );
};

export default InProgressConfirmation;