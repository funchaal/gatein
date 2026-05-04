import { StyleSheet } from "react-native";
import { COLORS } from "../../../constants/colors";

export const styles = StyleSheet.create({
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