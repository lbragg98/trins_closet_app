import { StyleSheet } from "react-native";

import { colors } from "./colors";

export const sharedStyles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 18
  },
  title: {
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: 0,
    color: "#FBF6FF"
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0
  },
  label: {
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 16
  },
  button: {
    minHeight: 50,
    borderRadius: 8,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center"
  },
  buttonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900"
  },
  ghostButton: {
    minHeight: 42,
    borderRadius: 8,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1
  },
  ghostButtonText: {
    fontSize: 14,
    fontWeight: "800"
  },
  card: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 14
  },
  shadow: {
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 22,
    elevation: 3
  }
});
