import { View, Image } from "react-native";
import React from "react";
import TempImage from "@/assets/images/loading.gif";
import { Colors } from "@/constants/Colors";

const Loading = () => {
  return (
    <View
      style={{
        flex: 1,
        height: "100%",
        width: "100%",
        backgroundColor: Colors.bg,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Image
        source={TempImage}
        style={{ width: 60, height: 60, backgroundColor: "#FFF" }}
      />
    </View>
  );
};

export default Loading;
