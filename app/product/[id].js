import React, { useEffect, useState, useRef } from "react";
import {
  View,
  ScrollView,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ToastAndroid,
  Pressable,
} from "react-native";
import { CustomText as Text } from "@/components/CustomText";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import fetchProductData from "@/helpers/product";
import { Colors } from "@/constants/Colors";
import { AntDesign } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { useUser } from "@/firebase/UserContext";
import {
  addTowishList,
  removeFromWishlist,
  addToCart,
  addToInterest,
} from "@/helpers/users";
const { width: SCREEN_WIDTH } = Dimensions.get("window");
import Loading from "@/components/Loading";

import { db } from "@/firebase/firebase";
import { doc, getDoc } from "firebase/firestore";

const Product = () => {
  const { user, setUserData } = useUser();
  const { id } = useLocalSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const scrollViewRef = useRef(null);
  const [variant, setvariant] = useState({});
  const router = useRouter();
  // FETCH DATA
  async function fetchData() {
    try {
      const prodData = await fetchProductData(id);
      setData(prodData);
      let isUpdated;

      const initialvariants = {};
      prodData.variants.forEach((v) => {
        initialvariants[v.name] = v.vals[0];
      });
      setvariant(initialvariants);
      setLoading(false);

      // console.log("Add prod");
      await addToInterest(user, prodData.name).then((update) => {
        isUpdated = update;
      });
      // console.log("Add name");
      await addToInterest(user, prodData.keywords).then((update) => {
        if (!isUpdated) {
          isUpdated = update;
        }
      });

      // console.log("Add key");
      setUserData(isUpdated);
    } catch (error) {
      console.error("Error fetching product data:", error);
    }
  }

  // INIT
  useEffect(() => {
    async function init() {
      setLoading(true);

      await fetchData();
    }
    if (user && id) {
      init();
    }
  }, [id, user]);

  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / SCREEN_WIDTH);
    setCurrentImageIndex(index);
  };

  const handleAddToCart = async () => {
    setLoading(true);
    try {
      await addToCart(user.uid, data.id, 1, variant);
      setUserData(true);
      ToastAndroid.show("Successfully added to cart", ToastAndroid.SHORT);
      // You can add some user feedback here, like a toast notification
      // //  // console.log("Product added to cart");
    } catch (error) {
      console.error("Failed to add product to cart", error);
      ToastAndroid.show("Couldnt Add product to cart", ToastAndroid.SHORT);
      // Handle the error, maybe show an error message to the user
    }
    setLoading(false);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: Colors.bg,
      }}
    >
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          paddingHorizontal: 6,
          paddingVertical: 5,
          backgroundColor: Colors.bg,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            router.back();
          }}
          style={{ padding: 4, borderRadius: 99 }}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 6, paddingBottom: 80 }}
      >
        <View style={{ marginBottom: 20 }}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {data.imageUrls.map((url, index) => (
              <Image
                key={index}
                source={{ uri: url }}
                style={{
                  width: SCREEN_WIDTH - 30, // Adjust based on your padding
                  height: 400,
                  resizeMode: "cover",
                  // backgroundColor: Colors.primary,
                }}
                resizeMode="contain"
              />
            ))}
          </ScrollView>
        </View>

        <View
          style={{
            backgroundColor: Colors.bg,
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
            <Text
              style={{
                fontFamily: "extrabold",
                fontSize: 30,
              }}
            >
              {data.name}
            </Text>

            {user && user.wishlist && user.wishlist.includes(data.id) ? (
              <TouchableOpacity
                style={{
                  borderRadius: 99,
                  padding: 8,
                }}
                onPress={() => {
                  // // //  // console.log(item.id);
                  removeFromWishlist(user.uid, data.id);
                  setUserData(true);
                }}
              >
                <AntDesign name="heart" size={24} color={Colors.primary} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={{
                  borderRadius: 99,
                  padding: 8,
                }}
                onPress={() => {
                  // // //  // console.log(item.id);
                  addTowishList(user.uid, data.id);
                  setUserData(true);
                }}
              >
                <AntDesign name="hearto" size={24} color={Colors.primary} />
              </TouchableOpacity>
            )}
          </View>
          <Text
            style={{
              fontFamily: "regular",
              fontSize: 20,
            }}
          >
            {data.brand}
          </Text>
          <Text
            style={{
              fontFamily: "black",
              fontSize: 20,
            }}
          >
            {data.currency} {data.price}
          </Text>
          <Text
            style={{
              color: Colors.secondary,
              fontFamily: "black",
              fontSize: 18,
              marginTop: 30,
              opacity: 0.5,
            }}
          >
            Description
          </Text>
          <Text
            style={{
              color: Colors.secondary,
              fontFamily: "light",
              fontSize: 18,
              marginTop: 5,
              opacity: 0.5,
            }}
          >
            {data.shortDescription}
          </Text>
          {/* <variant
            variant={{ name: "size", val: ["small", "large"] }}
            setvariant={setvariant}
            variants={variant}
          /> */}
          {data.variants.map((item, index) => {
            return (
              <Variant
                key={index}
                variant={item}
                setvariant={setvariant}
                variants={variant}
              />
            );
          })}
          <Specs specs={data.specs} />
          <Shipping
            shippingType={data.deliveryTime}
            cost={data.shipping_cost}
            cur={data.currency}
          />
          <ReturnPolicy policy={data.returns} />
          <SellerTile id={data.sellerId} />
          <Reviews reviews={data.reviews ? data.reviews : []} />
        </View>
      </ScrollView>
      <View
        style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          paddingVertical: 5,
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 6,
          paddingBottom: 10,
          backgroundColor: Colors.bg,
        }}
      >
        <TouchableOpacity
          style={{
            borderWidth: 1,
            borderColor: Colors.primary,
            paddingHorizontal: 6,
            paddingVertical: 10,
            borderRadius: 8,
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-evenly",
            width: "100%",
            alignItems: "center",
          }}
          onPress={handleAddToCart}
        >
          <Text
            style={{
              textAlign: "center",
              fontFamily: "semibold",
              fontSize: 18,
              color: Colors.primary,
            }}
          >
            Add to Cart
          </Text>
        </TouchableOpacity>
        {/* <TouchableOpacity
          style={{
            backgroundColor: Colors.primary,
            paddingHorizontal: 6,
            paddingVertical: 10,
            width: "49%",
            borderRadius: 8,
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-evenly",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              textAlign: "center",
              fontFamily: "semibold",
              fontSize: 18,
              color: Colors.bg,
            }}
          >
            CheckOut
          </Text>
        </TouchableOpacity> */}
      </View>
    </SafeAreaView>
  );
};

export default Product;

const Shipping = ({ shippingType, cost, cur }) => {
  const [state, setState] = useState(false);
  return (
    <View
      style={{
        width: "100%",
        borderWidth: 0.5,
        borderColor: Colors.primary,
        minHeight: 50,
        borderRadius: 20,
        paddingHorizontal: 20,
        marginTop: 10,
      }}
    >
      <TouchableOpacity
        onPress={() => {
          setState((prev) => !prev);
        }}
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          height: 50,
        }}
      >
        <Text
          style={{
            fontFamily: "light",
            fontSize: 18,
          }}
        >
          Shipping
        </Text>

        <MaterialIcons
          name={state ? "keyboard-arrow-up" : "keyboard-arrow-down"}
          size={24}
          color="black"
        />
      </TouchableOpacity>
      {state && (
        <View
          class="flex flex-col gap-2"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            marginBottom: 4,

            paddingVertical: 15,
            borderTopColor: Colors.secondary + "4d",
            borderBottomColor: Colors.secondary + "4d",
            borderTopWidth: 1,
            width: "100%",
          }}
        >
          <Text
            style={{
              fontFamily: "light",
              fontSize: 18,
            }}
          >
            Shipping Time: {shippingType}
          </Text>

          <Text
            style={{
              fontFamily: "light",
              fontSize: 18,
            }}
          >
            Shipping Cost: {cur} {cost}
          </Text>
        </View>
      )}
    </View>
  );
};

// <div
//   className={`w-full rounded-md  hover:bg-secondary-600 hover:cursor-pointer ${isExpanded ? "flex" : "hidden md:flex"} duration-300 p-2 flex-row items-center justify-start gap-3`}
// >
//   <div className="w-8 h-8 rounded-full bg-primary-500">
//     {user.photoURL ? (
//       <img src={user.photoURL} />
//     ) : (
//       <Avatar
//         size={"100%"}
//         name={user.displayName}
//         variant="pixel"
//         colors={[
//           "#181825",
//           "#45475a",
//           "#ffffff",
//           "#11111b",
//           "#050507",
//           "#0D0E12",
//           "#CCCCCC",
//           "#07070B",
//         ]}
//       />
//     )}
//   </div>
//   {isExpanded && (
//     <div>
//       <p className="text-sm font-semiBold">{user.displayName}</p>
//       <p className="text-sm font-thin">{user.email}</p>
//     </div>
//   )}
// </div>

import { auth } from "@/firebase/firebase";
import fetchBrandData from "@/helpers/brand";
import { Star } from "lucide-react-native";
const SellerTile = ({ id }) => {
  const router = useRouter();
  const [state, setState] = useState(false);
  const [user, setUser] = useState();

  async function getSeller(idx) {
    const data = await fetchBrandData(idx);
    // console.log(data);
    setUser(data);
  }

  useEffect(() => {
    if (id) {
      getSeller(id);
    }
  }, [id]);

  // Helper to convert hex to RGB for opacity

  return (
    <View
      style={{
        width: "100%",
        borderWidth: 0.5,
        borderColor: Colors.primary,
        minHeight: 50,
        borderRadius: 20,
        paddingHorizontal: 20,
        marginTop: 10,
      }}
    >
      <TouchableOpacity
        onPress={() => setState((prev) => !prev)}
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          height: 50,
        }}
      >
        <Text
          style={{
            fontFamily: "light",
            fontSize: 18,
          }}
        >
          Store Page
        </Text>
        <MaterialIcons
          name={state ? "keyboard-arrow-up" : "keyboard-arrow-down"}
          size={24}
          color="black"
        />
      </TouchableOpacity>
      {state && user && (
        <Pressable
          onPress={() => {
            router.push(`/seller/${id}`);
          }}
          style={({ pressed }) => ({
            width: "100%",
            flexDirection: "row",
            alignItems: "center",
            padding: 8,
            borderRadius: 6,
            gap: 12,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 99999,
              backgroundColor: Colors.bg,
              overflow: "hidden",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {user?.photoURL ? (
              <Image
                source={{ uri: user.photoURL }}
                style={{
                  width: "100%",
                  height: "100%",
                }}
                // defaultSource={require("@/assets/default-avatar.png")}
              />
            ) : (
              <Image
                source={require("@/assets/images/placeholder-store.png")}
                style={{
                  width: "100%",
                  height: "100%",
                }}
                // defaultSource={require("@/assets/default-avatar.png")}
              />
            )}
          </View>

          <View>
            <Text
              style={{
                fontSize: 16,
                fontFamily: "thin",
              }}
            >
              {user?.name || "Store"}
            </Text>
          </View>
        </Pressable>
      )}
    </View>
  );
};

const ReturnPolicy = ({ policy }) => {
  const [state, setState] = useState(false);

  return (
    <View
      style={{
        width: "100%",
        borderWidth: 0.5,
        borderColor: Colors.primary,
        minHeight: 50,
        borderRadius: 20,
        paddingHorizontal: 20,
        marginTop: 10,
      }}
    >
      <TouchableOpacity
        onPress={() => setState((prev) => !prev)}
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          height: 50,
        }}
      >
        <Text
          style={{
            fontFamily: "light",
            fontSize: 18,
          }}
        >
          Return Policy
        </Text>
        <MaterialIcons
          name={state ? "keyboard-arrow-up" : "keyboard-arrow-down"}
          size={24}
          color="black"
        />
      </TouchableOpacity>
      {state && (
        <View
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            width: "100%",
          }}
        >
          <View
            style={{
              paddingVertical: 15,
              borderTopColor: Colors.secondary + "4d",
              borderBottomColor: Colors.secondary + "4d",
              borderTopWidth: 1,
              width: "100%",
            }}
          >
            <Text
              style={{
                fontFamily: "light",
                fontSize: 18,
              }}
            >
              {policy}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const Reviews = ({ reviews }) => {
  const [state, setState] = useState(false);

  return (
    <View
      style={{
        width: "100%",
        borderWidth: 0.5,
        borderColor: Colors.primary,
        minHeight: 50,
        borderRadius: 20,
        paddingHorizontal: 20,
        marginTop: 10,
      }}
    >
      <TouchableOpacity
        onPress={() => setState((prev) => !prev)}
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          height: 50,
        }}
      >
        <Text
          style={{
            fontFamily: "light",
            fontSize: 18,
          }}
        >
          Reviews{"  "}
          {reviews.reduce((acc, item) => acc + item.rating, 0)}{" "}
          <Star size={12} fill={Colors.primary} color={Colors.primary} /> (
          {reviews.length})
        </Text>
        <MaterialIcons
          name={state ? "keyboard-arrow-up" : "keyboard-arrow-down"}
          size={24}
          color="black"
        />
      </TouchableOpacity>
      {state && (
        <View
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            width: "100%",
          }}
        >
          {reviews.map((item, index) => (
            <View
              key={index}
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-start",

                paddingVertical: 15,
                borderTopColor: Colors.secondary + "4d",
                borderBottomColor: Colors.secondary + "4d",
                borderTopWidth: 1,
                width: "100%",
              }}
            >
              <View style={{}}>
                <Text
                  style={{
                    fontFamily: "semibold",
                    fontSize: 14,
                  }}
                >
                  {item.userName}:
                </Text>

                <Text
                  style={{
                    fontFamily: "light",
                    fontSize: 18,
                    marginTop: 2,
                  }}
                  numberOfLines={3}
                >
                  {item.comment}
                </Text>
              </View>
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: 2,
                  alignItems: "center",
                }}
              >
                <Text>{item.rating}</Text>
                <Star size={14} color={Colors.primary} />
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const Specs = ({ specs }) => {
  const [state, setState] = useState(false);

  return (
    <View
      style={{
        width: "100%",
        borderWidth: 0.5,
        borderColor: Colors.primary,
        minHeight: 50,
        borderRadius: 20,
        paddingHorizontal: 20,
        marginTop: 10,
      }}
    >
      <TouchableOpacity
        onPress={() => setState((prev) => !prev)}
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          height: 50,
        }}
      >
        <Text
          style={{
            fontFamily: "light",
            fontSize: 18,
          }}
        >
          Specifications
        </Text>
        <MaterialIcons
          name={state ? "keyboard-arrow-up" : "keyboard-arrow-down"}
          size={24}
          color="black"
        />
      </TouchableOpacity>
      {state && (
        <View
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            width: "100%",
          }}
        >
          {specs.map((item, index) => (
            <View
              key={index}
              style={{
                paddingVertical: 15,
                borderTopColor: Colors.secondary + "4d",
                borderBottomColor: Colors.secondary + "4d",
                borderTopWidth: 1,
                width: "100%",
              }}
            >
              <Text
                style={{
                  fontFamily: "light",
                  fontSize: 18,
                }}
              >
                {item.name} : {item.value}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};
const Variant = ({ variant, setvariant, variants }) => {
  const updateVar = (varVal) => {
    setvariant((prev) => ({
      ...prev,
      [variant.name]: varVal,
    }));
  };

  const [state, setState] = useState(false);

  return (
    <View
      style={{
        width: "100%",
        borderWidth: 0.5,
        borderColor: Colors.primary,
        minHeight: 50,
        borderRadius: 20,
        paddingHorizontal: 20,
        marginTop: 10,
      }}
    >
      <TouchableOpacity
        onPress={() => setState((prev) => !prev)}
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          height: 50,
        }}
      >
        <Text
          style={{
            fontFamily: "light",
            fontSize: 18,
          }}
        >
          {variant.name}{" "}
          {variants[variant.name] && `: ${variants[variant.name]}`}
        </Text>
        <MaterialIcons
          name={state ? "keyboard-arrow-up" : "keyboard-arrow-down"}
          size={24}
          color="black"
        />
      </TouchableOpacity>
      {state && (
        <View
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            width: "100%",
          }}
        >
          {variant.vals.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={{
                paddingVertical: 15,
                borderTopColor: Colors.secondary + "4d",
                borderBottomColor: Colors.secondary + "4d",
                borderTopWidth: 1,
                width: "100%",
              }}
              onPress={() => {
                updateVar(item);
                setState(false);
              }}
            >
              <Text
                style={{
                  fontFamily:
                    variants[variant.name] === item ? "semibold" : "light",
                  fontSize: 18,
                }}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};
