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
    color: colors.text,
    textShadowColor: "rgba(255, 79, 216, 0.72)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0,
    color: colors.text,
    textShadowColor: "rgba(123, 44, 191, 0.6)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8
  },
  label: {
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0,
    color: colors.neonPinkSoft
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
    color: "#FFF9FF",
    fontSize: 15,
    fontWeight: "900",
    textShadowColor: "rgba(255, 79, 216, 0.72)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8
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
    fontWeight: "800",
    color: colors.text
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
