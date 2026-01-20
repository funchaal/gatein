import { COLORS } from './colors';

export const globalStyles = {
  mainButton: {
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    height: 56, 
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center'
  },
  mainButtonText: {
    color: COLORS.primaryButtonText,
    fontSize: 16,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  title: {
      fontSize: 32, 
      color: COLORS.textSecondary, // Certifique-se que essa cor existe no seu arquivo colors
      marginBottom: 25, 
      lineHeight: 35,   
      // fontWeight: 'bold',
      maxWidth: '95%'
    },
  subtitle: {
    fontSize: 22,
    color: COLORS.textSubtitle,
    marginBottom: 20,
    maxWidth: '90%'
  },
  input: {
    height: 56,
    width: '100%',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginTop: 2,
    fontSize: 18,
    color: COLORS.textPrimary,
  },
  outlineButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
};
