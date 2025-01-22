import { Colors } from "@/constants/Colors";
import { Tabs, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import Home from "@/assets/images/tabs/home.png";
import HomeO from "@/assets/images/tabs/home-o.png";
import User from "@/assets/images/tabs/user.png";
import UserO from "@/assets/images/tabs/user-o.png";

import Explore from "@/assets/images/tabs/explore.png";
import ExploreO from "@/assets/images/tabs/explore-o.png";
import Cart from "@/assets/images/tabs/trolley.png";
import CartO from "@/assets/images/tabs/trolley-o.png";
import { Image } from "react-native";
import { useUser } from "@/firebase/UserContext";
export default function TabLayout() {
  const router = useRouter();
  const { user, loading } = useUser();
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login");
      }
    }
  }, [user, loading]);
  return (
    <Tabs
      screenOptions={{
        tabBarItemStyle: {
          marginVertical: 4,
        },
        tabBarShowLabel: false,
        tabBarStyle: { elevation: 0, backgroundColor: Colors.bg },

        tabBarActiveTintColor: Colors.primary,
        headerShown: false,
      }}
      safeAreaInsets={90}
      initialRouteName="home"
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",

          tabBarIcon: ({ color, focused }) =>
            focused ? (
              <Image
                source={Home}
                tintColor={color}
                style={{ width: 22, height: 22 }}
              />
            ) : (
              <Image
                source={HomeO}
                tintColor={color}
                style={{ width: 22, height: 22 }}
              />
            ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, focused }) =>
            focused ? (
              <Image
                source={Explore}
                tintColor={color}
                style={{ width: 22, height: 22 }}
              />
            ) : (
              <Image
                source={ExploreO}
                tintColor={color}
                style={{ width: 22, height: 22 }}
              />
            ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarIcon: ({ color, focused }) =>
            focused ? (
              <Image
                source={Cart}
                tintColor={color}
                style={{ width: 24, height: 24 }}
              />
            ) : (
              <Image
                tintColor={color}
                source={CartO}
                style={{ width: 24, height: 24 }}
              />
            ),
        }}
      />

      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: ({ color, focused }) =>
            focused ? (
              <Image
                source={User}
                tintColor={color}
                style={{ width: 22, height: 22 }}
              />
            ) : (
              <Image
                tintColor={color}
                source={UserO}
                style={{ width: 22, height: 22 }}
              />
            ),
        }}
      />
      {/*    HIDDEN VIEWS    */}

      {/* <Tabs.Screen
        name="wishlist"
        options={{
          tabBarButton: (props) => null,
        }}
      /> */}
    </Tabs>
  );
}
