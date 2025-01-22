import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  Animated,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

const useChangingBackground = (images, interval = 5000) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    const changeImage = () => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }).start(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }).start();
      });
    };

    const intervalId = setInterval(changeImage, interval);
    return () => clearInterval(intervalId);
  }, [fadeAnim, images, interval]);

  return { currentImage: images[currentIndex], fadeAnim };
};

const HomePageHeader = ({
  height,
  setSearchQuery,
  searchQuery,
  handleSearch,
}) => {
  const images = [
    require("@/assets/images/ad1.jpg"),
    require("@/assets/images/ad2.jpg"),
  ];

  const { currentImage, fadeAnim } = useChangingBackground(images);

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <ImageBackground
        source={currentImage}
        style={{
          width: "100%",
          height: height * 0.3,
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)", // Add a semi-transparent overlay
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: "80%",
              borderRadius: 999,
              backgroundColor: Colors.bg,
              paddingVertical: 10,
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 15,
            }}
          >
            <TextInput
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={{
                fontSize: 16,
                color: Colors.text,
                flex: 1,
              }}
              cursorColor={Colors.secondary}
              selectionColor={Colors.secondary}
              placeholder="Search..."
              placeholderTextColor={Colors.text}
            />
            <TouchableOpacity onPress={handleSearch}>
              <Feather name="search" size={24} color={Colors.secondary} />
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </Animated.View>
  );
};

export default HomePageHeader;
