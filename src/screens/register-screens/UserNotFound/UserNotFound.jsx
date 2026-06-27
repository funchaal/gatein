import React from 'react';
import { View, Text, Pressable } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import MainAsyncButton from '../../../components/ui/MainAsyncButton';
import { COLORS } from "../../../constants/colors";
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
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.content}>
            <View style={styles.iconBadge}>
                <MaterialCommunityIcons name="account-search-outline" size={34} color={COLORS.warning} />
            </View>
            <Text style={styles.title}>Usuário não encontrado</Text>
            <Text style={styles.subtitle}>
              Não encontramos um usuário para o CPF{' '}
              <Text style={styles.bold}>{tax_id}</Text>.{'\n'}
              Deseja criar uma nova conta?
            </Text>
        </View>

        <View style={styles.buttonWrapper}>
            <MainAsyncButton
              title="Criar uma conta agora"
              onPress={handleCreateAccount}
            />
            <Pressable 
                onPress={() => navigation.navigate('Login')} 
                style={globalStyles.outlineButton}
            >
                <Text style={globalStyles.outlineButtonText}>Voltar para o Login</Text>
            </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default UserNotFound;
