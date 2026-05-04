import { StyleSheet } from "react-native";
import { COLORS } from "../../../constants/colors";

export const styles = StyleSheet.create({
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