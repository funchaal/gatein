import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { COLORS } from '../../constants/colors';
import { globalStyles } from '../../constants/styles';
import { handleRegistrationStep } from '../../utils/tools';
import { deleteRegistrationRequest } from '../../store/slices/registerSlice';

// Helper function to mask parts of the name
const maskName = (name) => {
    if (!name) return '';
    const nameParts = name.split(' ');
    return nameParts.map((part, index) => {
        if (index === 0) return part; // Keep first name
        return part.length > 2 ? `${part.substring(0, 2)}***` : `${part.substring(0, 1)}**`;
    }).join(' ');
};


const InProgressConfirmationScreen = ({ navigation, route }) => {
  const { tax_id, name, register_step } = route.params || {};
  const dispatch = useDispatch();

  const handleContinue = () => {
    handleRegistrationStep(navigation, register_step, { tax_id });
  };

  const handleStartOver = async () => {
    try {
        await dispatch(deleteRegistrationRequest({ tax_id })).unwrap();
        navigation.navigate('TaxId');
    } catch (error) {
        console.error('Failed to delete registration:', error);
        // Optionally, show an error message to the user
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 50,
  },
  subtitle: {
    fontSize: 20,
    color: COLORS.textSecondary,
    marginBottom: 30,
    lineHeight: 30,
  },
  boldName: {
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    paddingVertical: 12,
    alignItems: 'flex-start',
  },
  secondaryButton: {
    marginTop: 0,
  },
  primaryText: {
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  secondaryText: {
    fontSize: 18,
    color: 'gray',
    fontWeight: 'bold',
  },
});

export default InProgressConfirmationScreen;
