import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AddClothingScreen } from "./src/screens/AddClothingScreen";
import { ClosetScreen } from "./src/screens/ClosetScreen";
import { ModelSettingsScreen } from "./src/screens/ModelSettingsScreen";
import { OutfitBuilderScreen } from "./src/screens/OutfitBuilderScreen";
import { useClosetStore } from "./src/store/useClosetStore";
import { colors } from "./src/theme/colors";

export type RootTabParamList = {
  Builder: undefined;
  Closet: undefined;
  Add: { editItemId?: string } | undefined;
  Model: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function App() {
  const scheme = useColorScheme();
  const hydrateFromStorage = useClosetStore((state) => state.hydrateFromStorage);

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  const navTheme = scheme === "dark" ? DarkTheme : DefaultTheme;

  return (
    <SafeAreaProvider>
      <NavigationContainer
        theme={{
          ...navTheme,
          colors: {
            ...navTheme.colors,
            primary: colors.accent,
            background: scheme === "dark" ? colors.backgroundDark : colors.background,
            card: scheme === "dark" ? colors.surfaceDark : colors.surface,
            text: scheme === "dark" ? colors.textDark : colors.text
          }
        }}
      >
        <StatusBar style={scheme === "dark" ? "light" : "dark"} />
        <Tab.Navigator
          initialRouteName="Builder"
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: colors.neonPinkSoft,
            tabBarInactiveTintColor: colors.text,
            tabBarIcon: () => null,
            tabBarIconStyle: { display: "none" },
            tabBarLabelStyle: {
              fontSize: 13,
              fontWeight: "900",
              textShadowColor: colors.neonPink,
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 10
            },
            tabBarStyle: {
              borderTopWidth: 1,
              borderTopColor: "rgba(255, 183, 240, 0.32)",
              elevation: 0,
              backgroundColor: "rgba(22, 8, 38, 0.9)",
              height: 64,
              paddingBottom: 10,
              paddingTop: 8,
              shadowColor: colors.neonPink,
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.42,
              shadowRadius: 18
            }
          }}
        >
          <Tab.Screen name="Builder" component={OutfitBuilderScreen} />
          <Tab.Screen name="Closet" component={ClosetScreen} />
          <Tab.Screen name="Add" component={AddClothingScreen} />
          <Tab.Screen name="Model" component={ModelSettingsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
