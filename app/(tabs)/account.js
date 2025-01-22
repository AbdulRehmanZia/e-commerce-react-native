import React, { useCallback } from "react";
import { useFocusEffect, router } from "expo-router";
import { useUser } from "../../firebase/UserContext";
import {
  View,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { CustomText as Text } from "@/components/CustomText";
import { LogOut } from "lucide-react-native";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/firebase";

const ProfileScreen = () => {
  // const navigation = useNavigation();
  // const router = useRouter();
  const { user, setUserData } = useUser();

  useFocusEffect(
    useCallback(() => {
      setUserData(true);
      return () => {};
    }, []),
  );

  const menuItems = [
    { icon: "user", label: "Edit Profile", route: "editProfile" },
    // { icon: "map-pin", label: "Shopping Address", route: "Address" },
    {
      icon: "heart",
      label: `Wishlist (${user && user.wishlist ? user.wishlist.length : 0})`,
      route: "wishlist",
    },
    {
      icon: "clock",
      label: `Order History (${user && user.orders ? user.orders.length : 0}) `,
      route: "orders",
    },
    // { icon: "bell", label: "Notification", route: "Notifications" },
  ];

  const MenuItem = ({ icon, label, onPress }) => (
    <TouchableOpacity
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
      }}
      onPress={onPress}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Icon name={icon} size={20} color="#666" />
        <Text style={{ fontSize: 16, marginLeft: 16, color: "#333" }}>
          {label}
        </Text>
      </View>
      <Icon name="chevron-right" size={20} color="#CCCCCC" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#f0f0f0",
        paddingTop: 30,
      }}
    >
      <ScrollView>
        <View
          style={{
            alignItems: "center",
            padding: 24,
            backgroundColor: "#f0f0f0",
          }}
        >
          <View
            style={{
              width: 96,
              height: 96,
              borderRadius: 48,
              overflow: "hidden",
              backgroundColor: "#fce7f3",
            }}
          >
            {user && user.photoURL ? (
              <Image
                source={{ uri: user.photoURL }}
                style={{ width: "100%", height: "100%" }}
              />
            ) : (
              <Image
                source={{ uri: "https://via.placeholder.com/96" }}
                style={{ width: "100%", height: "100%" }}
              />
            )}
          </View>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "600",
              marginTop: 16,
              textTransform: "capitalize",
            }}
          >
            {user && user.displayName}
          </Text>
        </View>

        <View style={{ backgroundColor: "#f0f0f0", marginTop: 16 }}>
          {menuItems.map((item, index) => (
            <MenuItem
              key={index}
              icon={item.icon}
              label={item.label}
              onPress={() => router.push(`/${item.route}`)}
            />
          ))}

          {user && router && (
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: "#eee",
              }}
              onPress={async () => {
                await signOut(auth).then(() => {
                  // router.replace("/login");
                });
                // navigator.
                // router.replace("/logout");
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <LogOut size={20} color="#E3242B" />
                <Text
                  style={{ fontSize: 16, marginLeft: 16, color: "#E3242B" }}
                >
                  Logout
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
