import * as React from "react";
import { Dimensions, Image, Text, View } from "react-native";
import Carousel from "react-native-reanimated-carousel";

import { Colors } from "@/constants/Colors";
export default TopSlider = ({ ads }) => {
  const width = Dimensions.get("window").width;
  return (
    <View style={{ flex: 1, marginTop: 15 }}>
      <Carousel
        loop
        width={width - 24}
        height={150}
        autoPlay={true}
        data={ads}
        scrollAnimationDuration={1500}
        panGestureHandlerProps={{
          activeOffsetX: [-10, 10],
        }}
        snapEnabled={true}
        renderItem={({ index }) => (
          <View
            style={{
              flex: 1,
              backgroundColor: Colors.secondary,
              borderRadius: 8,
              marginHorizontal: 2,
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <Image src={ads[index]} style={{ width: "100%", height: "100%" }} />
          </View>
        )}
      />
    </View>
  );
};
