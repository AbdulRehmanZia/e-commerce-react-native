import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from "react-native";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { CustomText as Text } from "@/components/CustomText";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import fetchProductData from "@/helpers/product";
import { useUser } from "@/firebase/UserContext";
import { Feather } from "@expo/vector-icons";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import Loading from "@/components/Loading";

const Cart = () => {
  const { user, setUserData } = useUser();
  const [cartData, setCartData] = useState([]);
  const [prices, setPrices] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);
  const cartDataRef = useRef(cartData);
  const userRef = useRef(user);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  useEffect(() => {
    cartDataRef.current = cartData;
  }, [cartData]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const updateCartInFirebase = async () => {
    if (userRef.current && cartDataRef.current) {
      const docRef = doc(db, "users", userRef.current.uid);
      await updateDoc(docRef, {
        cart: cartDataRef.current,
      });
      setUserData(true);
    }
  };

  useEffect(() => {
    // console.log(prices);
    if (Object.keys(prices).length === 0) {
      setTotalPrice(0);
    } else {
      const newTotalPrice = Object.values(prices).reduce(
        (sum, price) => sum + price,
        0
      );
      setTotalPrice(newTotalPrice);
    }
  }, [prices, cartData]);

  useFocusEffect(
    useCallback(() => {
      setUserData(true);
      return () => {
        //  // console.log("exit");
        updateCartInFirebase();
      };
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      if (user) {
        setLoading(true);
        setCartData(user.cart);

        const fetchPrices = async () => {
          const newPrices = {};
          for (const item of user.cart) {
            const productData = await fetchProductData(item.id);
            const variantKey = `${item.id}-${JSON.stringify(item.variants)}`;
            newPrices[variantKey] = item.count * productData.price;
          }
          setPrices(newPrices);
        };
        fetchPrices();
        setLoading(false);
      }
    }, [user])
  );

  const clearCart = () => {
    setCartData([]);
    setPrices({});
  };
  if (loading) {
    return <Loading />;
  }
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: Colors.bg,
        paddingHorizontal: 6,
        paddingTop: 20,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ fontFamily: "black", fontSize: 34 }}>Cart</Text>
        <TouchableOpacity onPress={clearCart}>
          <Text style={{ fontFamily: "regular", fontSize: 16 }}>Clear</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {cartData &&
          cartData.map((item, index) => (
            <CartItem
              key={index}
              item={item}
              setPrices={setPrices}
              cartData={cartData}
              setCartData={setCartData}
            />
          ))}
      </ScrollView>

      <View
        style={{
          backgroundColor: Colors.bg,
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingVertical: 12,
          paddingHorizontal: 6,
          borderTopColor: Colors.primary,
          borderTopWidth: 0.5,
        }}
      >
        <View style={{ display: "flex", flexDirection: "column" }}>
          <Text
            style={{
              fontFamily: "bold",
              fontSize: 20,
            }}
          >
            Total:
          </Text>
          <Text
            style={{
              fontFamily: "bold",
              fontSize: 20,
            }}
          >
            {user.currency} {totalPrice.toFixed(2)}
          </Text>
        </View>
        {cartData && cartData.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              // console.log("Cart Data", cartData);
              router.push({
                pathname: "checkout",
                params: { data: JSON.stringify(cartData) },
              });
            }}
            style={{
              backgroundColor: Colors.primary,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: 12,
              minWidth: 200,
              borderRadius: 4,
            }}
          >
            <Text style={{ color: Colors.bg, fontFamily: "semibold" }}>
              Checkout
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

export default Cart;

const CartItem = ({ item, cartData, setCartData, setPrices }) => {
  const [itemData, setItemData] = useState();
  const [count, setCount] = useState(item.count);

  const [variants, setvariants] = useState([]);

  useEffect(() => {
    fetchProductData(item.id).then((data) => {
      setItemData(data);
      setCount(item.count);
      setvariants(item.variants);
      const variantKey = getVariantKey(item);
      setPrices((prev) => ({
        ...prev,
        [variantKey]: item.count * data.price,
      }));
    });
  }, [item]);

  const getVariantKey = (item) => {
    const variantKey = `${item.id}-${JSON.stringify(item.variants)}`;
    return variantKey;
  };

  const updateCount = (newCount) => {
    setCount(newCount);
    const updatedCartData = cartData
      .map((cartItem) =>
        cartItem.id === item.id &&
        JSON.stringify(cartItem.variants) === JSON.stringify(item.variants)
          ? { ...cartItem, count: newCount }
          : cartItem
      )
      .filter((cartItem) => cartItem.count > 0);
    setCartData(updatedCartData);
    const variantKey = getVariantKey(item);
    setPrices((prev) => ({
      ...prev,
      [variantKey]: newCount * itemData.price,
    }));
  };

  const removeItem = () => {
    const updatedCartData = cartData.filter(
      (cartItem) =>
        !(
          cartItem.id === item.id &&
          JSON.stringify(cartItem.variants) === JSON.stringify(item.variants)
        )
    );
    setCartData(updatedCartData);
    const variantKey = getVariantKey(item);
    setPrices((prev) => {
      const { [variantKey]: removed, ...rest } = prev;
      // console.log("prices", rest);
      return rest;
    });
  };

  const router = useRouter();
  if (!itemData) {
    return (
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          padding: 4,
          borderWidth: 0.7,
          borderColor: Colors.primary,
          borderRadius: 8,
          gap: 8,
        }}
      />
    );
  }
  // console.log("DATA: ", itemData);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => {
        router.push(`/product/${item.id}`);
      }}
      style={{
        display: "flex",
        flexDirection: "row",
        padding: 4,
        borderWidth: 0.7,
        borderColor: Colors.primary,
        borderRadius: 8,
        gap: 8,
      }}
    >
      <Image
        source={{ uri: itemData.imageUrls[0] }}
        style={{
          backgroundColor: Colors.primary,
          height: 200,
          width: "100%",
          borderRadius: 8,
          flex: 0.35,
        }}
      />
      <View
        style={{
          paddingVertical: 4,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          flex: 0.65,
        }}
      >
        <View
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Text
            style={{
              fontFamily: "bold",
              fontSize: 18,
              flex: 0.65,
            }}
            numberOfLines={2}
          >
            {itemData && itemData.name}
          </Text>
          <Text
            style={{
              fontFamily: "bold",
              fontSize: 16,
              flex: 0.4,
              textAlign: "right",
            }}
          >
            {itemData.currency} {itemData && itemData.price.toFixed(2)}
          </Text>
        </View>
        <Text style={{ fontFamily: "regular", fontSize: 17 }}>
          {itemData && itemData.brand}
        </Text>
        <View
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          {variants &&
            Object.entries(variants).map(([key, value]) => {
              //  // console.log(key);
              return (
                <Text
                  key={`${key}`}
                  style={{
                    fontFamily: "extraLight",
                    fontSize: 14,
                  }}
                >
                  {key}: {value}
                </Text>
              );
            })}
        </View>

        <View
          style={{
            display: "flex",
            flexDirection: "row",
            gap: 3,
            alignItems: "center",
            marginTop: 20,
          }}
        >
          <TouchableOpacity onPress={() => updateCount(count + 1)}>
            <Feather name="plus" size={20} color="black" />
          </TouchableOpacity>
          <TextInput
            value={count.toString()}
            keyboardType="numeric"
            style={{
              borderColor: Colors.primary,
              borderWidth: 1,
              borderRadius: 5,
              justifyContent: "center",
              alignItems: "center",
              paddingLeft: 16,
              width: 40,
              height: 40,
              marginHorizontal: 5,
            }}
            onChangeText={(text) => {
              const newCount = text ? parseInt(text) : 0;
              updateCount(newCount);
            }}
          />
          <TouchableOpacity onPress={() => updateCount(count - 1)}>
            <Feather name="minus" size={20} color="black" />
          </TouchableOpacity>
        </View>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-end",
          }}
        >
          <Feather
            name="trash-2"
            size={24}
            color={Colors.primary}
            onPress={removeItem}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};
