import React from 'react';
import { View, Text } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import MainAsyncButton from '../../../components/ui/MainAsyncButton';
import { globalStyles } from '../../../constants/styles';
import { styles } from './UserNotFound.styles';

const UserNotFound = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { tax_id } = route.params || {};

  const handleCreateAccount = () => {
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

export default UserNotFound;