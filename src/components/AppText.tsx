import { Text, TextProps, useColorScheme } from "react-native";

import { colors } from "../theme/colors";

type AppTextProps = TextProps & {
  muted?: boolean;
};

export function AppText({ style, muted, ...props }: AppTextProps) {
  const scheme = useColorScheme();

  return (
    <Text
      {...props}
      style={[
        {
          color: muted
            ? scheme === "dark"
              ? colors.mutedDark
              : colors.neonPinkSoft
            : scheme === "dark"
              ? colors.textDark
              : colors.text,
          letterSpacing: 0
        },
        style
      ]}
    />
  );
}
