import { StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors'; // Ajuste o caminho conforme sua estrutura

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  loadingText: {
    marginTop: 24,
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.primary, // Ou outra cor de texto padrão do seu app
    textAlign: 'center',
  },
});