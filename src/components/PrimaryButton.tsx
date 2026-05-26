import { Pressable, PressableProps, StyleSheet, useColorScheme } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { colors } from "../theme/colors";
import { sharedStyles } from "../theme/styles";
import { AppText } from "./AppText";

type PrimaryButtonProps = PressableProps & {
  title: string;
  variant?: "filled" | "ghost" | "danger";
};

export function PrimaryButton({ title, variant = "filled", style, disabled, ...props }: PrimaryButtonProps) {
  const scheme = useColorScheme();
  const isGhost = variant === "ghost";
  const isDanger = variant === "danger";

  return (
    <Pressable
      {...props}
      disabled={disabled}
      style={({ pressed }) => [
        isGhost ? sharedStyles.ghostButton : sharedStyles.button,
        {
          backgroundColor: isGhost ? "rgba(35, 18, 55, 0.54)" : isDanger ? colors.danger : colors.accent,
          borderColor: isGhost ? "rgba(255, 183, 240, 0.66)" : colors.neonPinkSoft,
          shadowColor: isDanger ? colors.danger : colors.neonPink,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: disabled ? 0 : isGhost ? 0.28 : 0.48,
          shadowRadius: isGhost ? 10 : 18,
          opacity: disabled ? 0.45 : pressed ? 0.86 : 1
        },
        style as object
      ]}
    >
      {!isGhost && !isDanger ? (
        <LinearGradient
          colors={[colors.accentDeep, colors.accent, colors.neonPink]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fill}
        >
          <AppText style={sharedStyles.buttonText}>{title}</AppText>
        </LinearGradient>
      ) : (
        <AppText
          style={[
            isGhost ? sharedStyles.ghostButtonText : sharedStyles.buttonText,
            isGhost && { color: scheme === "dark" ? colors.textDark : colors.text }
          ]}
        >
          {title}
        </AppText>
      )}
    </Pressable>
  );
}

export const buttonRowStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center"
  },
  grow: {
    flex: 1
  }
});

const styles = StyleSheet.create({
  fill: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center"
  }
});
