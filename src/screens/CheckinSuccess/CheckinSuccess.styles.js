import { StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors'; // Ajuste o caminho conforme sua estrutura

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'space-between', // Empurra o botão para baixo e o texto para cima
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'center', // Centraliza o texto de sucesso na tela
    alignItems: 'center',
  },
  successText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary, // Pode substituir por COLORS.success caso exista
    textAlign: 'center',
    lineHeight: 30,
  },
  buttonContainer: {
    width: '100%',
    paddingBottom: 20,
  }
});