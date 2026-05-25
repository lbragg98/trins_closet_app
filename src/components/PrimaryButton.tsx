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
          backgroundColor: isGhost ? "transparent" : isDanger ? colors.danger : colors.accent,
          borderColor: scheme === "dark" ? colors.borderDark : colors.border,
          opacity: disabled ? 0.45 : pressed ? 0.82 : 1
        },
        style as object
      ]}
    >
      {!isGhost && !isDanger ? (
        <LinearGradient
          colors={[colors.accentDeep, colors.accent, colors.rose]}
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
