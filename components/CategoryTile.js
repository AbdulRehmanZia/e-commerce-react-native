import { View, TouchableOpacity } from "react-native";
import React from "react";
import { CustomText as Text } from "@/components/CustomText";
import { Colors } from "@/constants/Colors";
import { useRouter } from "expo-router";

const CategoriesButton = ({ Icon, text, name }) => {
  const router = useRouter();
  return (
    <View
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <TouchableOpacity
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: 12,
          borderColor: Colors.secondary,
          borderWidth: 0.2,
          borderRadius: 999,
          padding: 15,
          width: 50,
          height: 50,
          alignItems: "center",
          justifyContent: "center",

          backgroundColor: "#F5F5F5",
        }}
        activeOpacity={0.7}
        onPress={() => {
          router.push({
            pathname: "search",
            params: { query: "", category: name },
          });
          // router.replace({ pathname: "search", params: { query: name } });
        }}
      >
        <Icon
          height={24}
          width={24}
          color={Colors.secondary}
          style={{ color: Colors.secondary }}
        />
      </TouchableOpacity>
      <Text
        style={{
          fontSize: 10,
          width: 50,
          textWarp: true,
          textAlign: "center",
          marginTop: 4,
        }}
      >
        {text}
      </Text>
    </View>
  );
};
export default CategoriesButton;
