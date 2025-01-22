import React, { useState, useEffect } from "react";
import { View, Image, FlatList, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Feather";
import { CustomText as Text } from "@/components/CustomText";
import { useUser } from "@/firebase/UserContext";
import fetchProductData from "@/helpers/product";
import { removeFromWishlist } from "@/helpers/users";
import Loading from "../components/Loading";
import { ArrowLeft } from "lucide-react-native";
import { Colors } from "@/constants/Colors";
import { useRouter } from "expo-router";

const WishlistScreen = () => {
  const [loading, setLoading] = useState(true);
  const [wishlistItems, setWishlistItems] = useState([]);
  const { user, setUserData } = useUser();
  const router = useRouter();
  useEffect(() => {
    if (user && user.wishlist) {
      const fetch_data = async () =>
        await Promise.all(
          user.wishlist.map(async (item) => await fetchProductData(item)),
        );
      fetch_data().then((data) => {
        setWishlistItems(data);
        setLoading(false);
      });
    }
  }, [user]);

  const removeFromWishlist_Local = async (productId) => {
    setWishlistItems((prev) => prev.filter((item) => item.id !== productId));
    await removeFromWishlist(user.uid, productId);
    setUserData(true);
  };

  const renderWishlistItem = ({ item }) => {
    // console.log("IMAGE: ", item);
    return (
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          borderRadius: 8,
          padding: 4,
          marginBottom: 12,
          borderWidth: 0.7,
          borderColor: Colors.primary,
        }}
      >
        <Image
          source={{ uri: item.imageUrls[0] }}
          style={{
            width: 140,
            height: 200,
            borderRadius: 4,
            backgroundColor: Colors.primary,
          }}
        />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text
            style={{
              fontSize: 20,
              fontFamily: "bold",
              marginBottom: 4,
            }}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "#666",
              marginBottom: 4,
            }}
          >
            {item.category}
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 4,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                color: "#333",
                marginRight: 4,
              }}
            >
              {item.currency}
            </Text>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#333",
              }}
            >
              {item.price}
            </Text>
          </View>
          <Text
            style={{
              fontSize: 12,
              color: "#666",
            }}
          >
            Delivery: {item.deliveryTime}
          </Text>
        </View>
        <TouchableOpacity
          style={{ padding: 8 }}
          onPress={() => removeFromWishlist_Local(item.id)}
        >
          <Icon name="trash-2" size={20} color="#FF4444" />
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        // padding: 4,
        backgroundColor: "#f0f0f0",
      }}
    >
      <View
        style={{
          width: "100%",
          paddingHorizontal: 8,
          paddingVertical: 8,
          display: "flex",
          alignItems: "center",
          flexDirection: "row",
          gap: 12,
        }}
      >
        <ArrowLeft
          onPress={() => {
            router.back();
          }}
          style={{ color: Colors.primary }}
        />
        <Text
          style={{
            fontFamily: "black",
            fontSize: 28,
          }}
        >
          WishList
        </Text>
      </View>
      {wishlistItems.length === 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 24,
          }}
        >
          <Icon name="heart" size={48} color="#CCCCCC" />
          <Text
            style={{
              marginTop: 16,
              fontSize: 16,
              color: "#666",
            }}
          >
            Your wishlist is empty
          </Text>
        </View>
      ) : (
        <FlatList
          data={wishlistItems}
          renderItem={renderWishlistItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            padding: 16,
          }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default WishlistScreen;
