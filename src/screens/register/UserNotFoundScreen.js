import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import MainAsyncButton from '../../components/common/MainAsyncButton';
import { COLORS } from '../../constants/colors';
import { globalStyles } from '../../constants/styles';

const UserNotFoundScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { tax_id } = route.params || {};

  const handleCreateAccount = () => {
    // Navega para a tela de registro, passando o CPF já digitado
    navigation.navigate('TaxIdScreen', { tax_id });
  };

  return (
    <View style={styles.container}>
      <Text style={[globalStyles.h1, styles.title]}>Usuário não encontrado</Text>
      <Text style={styles.message}>
        Não encontramos um usuário para o CPF{' '}
        <Text style={styles.bold}>{tax_id}</Text>.
      </Text>
      <Text style={styles.message}>
        Deseja criar uma nova conta?
      </Text>

      <View style={styles.buttonContainer}>
        <MainAsyncButton
          title="Criar uma conta agora"
          onPress={handleCreateAccount}
        />
        <MainAsyncButton
          title="Voltar para o Login"
          onPress={() => navigation.navigate('Login')}
          style={{marginTop: 10}}
          type="secondary"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.background,
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
  },
  message: {
    fontSize: 18,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 25,
  },
  bold: {
    fontWeight: 'bold',
  },
  buttonContainer: {
    width: '100%',
    position: 'absolute',
    bottom: 40,
    paddingHorizontal: 20,
  },
});

export default UserNotFoundScreen;
