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
  Add: undefined;
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
            tabBarActiveTintColor: colors.text,
            tabBarInactiveTintColor: colors.muted,
            tabBarIcon: () => null,
            tabBarIconStyle: { display: "none" },
            tabBarLabelStyle: { fontSize: 12, fontWeight: "800" },
            tabBarStyle: {
              borderTopWidth: 0,
              elevation: 0,
              backgroundColor: scheme === "dark" ? colors.surfaceDark : colors.surface,
              height: 64,
              paddingBottom: 10,
              paddingTop: 8
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
