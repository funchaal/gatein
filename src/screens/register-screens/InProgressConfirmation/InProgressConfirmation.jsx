import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { globalStyles } from '../../../constants/styles';
import { handleRegistrationStep } from '../../../utils/tools';
import { useDeleteRegistrationRequestMutation } from '../../../services/api';
import { styles } from './InProgressConfirmation.styles';

const maskName = (name) => {
    if (!name) return '';
    const nameParts = name.split(' ');
    return nameParts.map((part, index) => {
        if (index === 0) return part; 
        return part.length > 2 ? `${part.substring(0, 2)}***` : `${part.substring(0, 1)}**`;
    }).join(' ');
};

const InProgressConfirmation = ({ navigation, route }) => {
  const { tax_id, name, register_step } = route.params || {};
  const dispatch = useDispatch();
  const [deleteRegistration] = useDeleteRegistrationRequestMutation();

  const handleContinue = () => {
    handleRegistrationStep(navigation, register_step, { tax_id });
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={globalStyles.title}>Quase lá</Text>
        <Text style={styles.subtitle}>
            Identificamos um cadastro em andamento para o CPF com final <Text style={{fontWeight: 'bold'}}>{tax_id.slice(-4)}</Text>. O nome informado foi <Text style={styles.boldName}>{maskName(name)}</Text>, é você?
        </Text>
        
        <View style={styles.buttonContainer}>
            <Pressable onPress={handleContinue} style={styles.button}>
                <Text style={styles.primaryText}>Sim, sou eu, continuar cadastro</Text>
            </Pressable>
            <Pressable onPress={handleStartOver} style={[styles.button, styles.secondaryButton]}>
                <Text style={styles.secondaryText}>Não sou eu, iniciar cadastro do zero</Text>
            </Pressable>
        </View>

      </View>
    </SafeAreaView>
  );
};

export default InProgressConfirmation;