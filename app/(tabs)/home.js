import {
  View,
  TextInput,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  ToastAndroid,
  ImageBackground,
  FlatList,
} from "react-native";
import { Colors } from "@/constants/Colors";
import React, { useEffect, useState, lazy } from "react";
import { Feather } from "@expo/vector-icons";
import { CustomText as Text } from "@/components/CustomText";
import { queryDoc } from "@/firebase/FirestoreService";
import HomeItemTile from "@/components/HomeItemTile";
import { useRouter } from "expo-router";
import CategoriesButton from "@/components/CategoryTile";
import Loading from "@/components/Loading";

const HEADERAD1 = require("@/assets/images/ad3.jpg");
const { height } = Dimensions.get("window");
// const elec = require("@/assets/images/icons/elec.png");

import {
  Laptop,
  Computer,
  Smartphone,
  Shirt,
  ShoppingBag,
  Watch,
  Headphones,
  Dumbbell,
  Scissors,
  Baby,
} from "lucide-react-native";
// import Slider from "../../components/Slider";
import WomenClothes from "@/assets/icons/woman-head.svg";
import Lipstick from "@/assets/icons/lipstick.svg";
import ManCloth from "@/assets/icons/employee-man-alt.svg";

import { useUser } from "@/firebase/UserContext";
import { getRecommendationData } from "@/helpers/product";
const index = () => {
  const router = useRouter();

  const { user, setUserData } = useUser();
  const [searchQuery, setSearchQuery] = useState();
  const [productPromotionsTop, setProductPromotionsTop] = useState();
  const [productPromotionsMid, setProductPromotionsMid] = useState();
  const [productPromotionsBottom, setProductPromotionsBottom] = useState();
  const [loading, setLoading] = useState(true);
  const [feed, setFeed] = useState();

  const categories = [
    { name: "Electronics", icon: Laptop },
    { name: "Computer Accessories", icon: Computer },
    { name: "Men", icon: ManCloth },
    { name: "Women", icon: WomenClothes },
    { name: "Kids", icon: Baby },
    { name: "Laptops", icon: Laptop },
    { name: "Computers", icon: Computer },
    { name: "Mobiles", icon: Smartphone },
    { name: "Accessories", icon: Headphones },
    { name: "Makeup", icon: Lipstick },
    { name: "Perfumes", icon: ShoppingBag },
    { name: "Fitness", icon: Dumbbell },
    { name: "Grooming", icon: Scissors },
    { name: "Watches", icon: Watch },
  ];

  // INIT EFFECT
  useEffect(() => {
    async function init() {
      setLoading(true);
      await fetchProductPromotions();
      await fetchRecommendedProducts();
      setLoading(false);
    }
    if (user) init();
  }, [user]);

  // console.log(productPromotionsTop);
  // console.log(productPromotionsMid);
  // console.log(productPromotionsBottom);

  async function fetchRecommendedProducts() {
    const interests =
      user.interest && user.interest.length > 0 ? user.interest : [];
    const data = await getRecommendationData(interests);
    // const data = dataUnfiltered.filter((item) => {
    //   // console.log(item);
    //   return [user.country, "other"].includes(item.coutry);
    // });
    // const feed_temp = [data.slice(0, 20), data.slice(20, 40), data.slice(40)];
    // console.log(feed_temp);
    // console.log(data);
    setFeed([data.slice(0, 10), data.slice(10, 20), data.slice(20)]);
  }
  // console.log(feed);
  async function fetchProductPromotions() {
    const data = await queryDoc("promotions", "products");
    setProductPromotionsTop(
      data["top"]
        ? data["top"]
            .filter(
              (item) =>
                new Date(item.expiry) <= new Date() &&
                [user.country, "other"].includes(item.coutry),
            )
            .sort(() => Math.random() - 0.5)
            .map((item) => item.id)
        : [],
    );
    setProductPromotionsBottom(
      data["bottom"]
        ? data["bottom"]
            .filter(
              (item) =>
                new Date(item.expiry) <= new Date() &&
                [user.country, "other"].includes(item.coutry),
            )
            .sort(() => Math.random() - 0.5)
            .map((item) => item.id)
        : [],
    );
    setProductPromotionsMid(
      data["middle"]
        ? data["middle"]
            .filter(
              (item) =>
                new Date(item.expiry) <= new Date() &&
                [user.country, "other"].includes(item.coutry),
            )
            .sort(() => Math.random() - 0.5)
            .map((item) => item.id)
        : [],
    );
  }

  const handleSearch = () => {
    router.push({
      pathname: "search",
      params: { query: searchQuery, filter: {} },
    });
    ToastAndroid.show(`Searched: ${searchQuery}`, ToastAndroid.SHORT);
  };

  const renderColumns = (products) => {
    const columns = [];
    const itemsPerColumn = 2; // Number of items per column

    for (let i = 0; i < products.length; i += itemsPerColumn) {
      const columnItems = products.slice(i, i + itemsPerColumn);
      columns.push(
        <View
          key={i}
          style={{
            flexDirection: "column",
          }}
        >
          {columnItems.map((item, index) => (
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
              }}
              key={`${item}${index}`}
            >
              <HomeItemTile id={item} />
            </View>
            // <CategoriesButton
            //   name="Electronics"
            //   icon={elec}
            //   text={"Electronics"}
            // />
          ))}
        </View>,
      );
    }

    return columns;
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <ScrollView
      style={{
        backgroundColor: Colors.bg,
        flex: 1,
        height: "100%",
        width: "100%",
      }}
      contentContainerStyle={{
        flexGrow: 1,
        alignItems: "center",
        paddingBottom: 120,
      }}
    >
      <ImageBackground
        source={HEADERAD1} // Replace with your image path
        style={{
          width: "100%",
          height: height * 0.3,
          backgroundColor: Colors.secondary,
        }}
        imageStyle={{
          opacity: 0.5, // Adjust for desired intensity
          mixBlendMode: "luminosity", // This creates the black and white effect
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: "column",
            alignItems: "center",

            backgroundColor: "rgba(0,0,0,0.3)", // Adds a slight dark overlay
          }}
        >
          <View
            style={{
              width: "60%",
              marginTop: 60,
              borderRadius: 999,
              backgroundColor: Colors.bg,
              paddingVertical: 1,
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 10,
              borderColor: "black",
              borderWidth: 2,
              overflow: "hidden",
            }}
          >
            <TextInput
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={{
                fontSize: 14,
                color: Colors.text,
                width: "86%",
              }}
              cursorColor={Colors.secondary}
              selectionColor={Colors.secondary}
              placeholder="Search..."
              placeholderTextColor={Colors.text}
              onSubmitEditing={handleSearch}
            />
            <TouchableOpacity onPress={handleSearch}>
              <Feather name="search" size={24} color={Colors.secondary} />
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>

      <ScrollView
        horizontal={true}
        style={{
          display: "flex",
          flexDirection: "row",
          marginTop: 18,
        }}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ marginStart: 4, gap: 10 }}
      >
        {categories.map((item, index) => (
          <CategoriesButton
            key={index}
            Icon={item.icon}
            text={item.name}
            name={item.name}
          />
        ))}
      </ScrollView>
      {productPromotionsTop && productPromotionsTop.length > 0 && (
        <>
          <View
            style={{
              marginTop: 20,
              backgroundColor: Colors.secondary,
              paddingVertical: 8,
              // paddingHorizontal: 10,
              minWidth: 150,
              maxWidth: 150,
              borderRadius: 7,
              marginBottom: 12,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontFamily: "regular",
                color: Colors.bg,
                fontSize: 18,
                fontFamily: "regular",
              }}
            >
              Promotions
            </Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View
              style={{
                flexDirection: "row",
              }}
            >
              {productPromotionsTop &&
                productPromotionsTop.map((item, index) => (
                  // <View key={item}>
                  <HomeItemTile key={index} id={item} />
                  // </View>
                ))}
            </View>
          </ScrollView>
        </>
      )}
      {feed && feed[0] && feed[0].length ? (
        <>
          <View
            style={{
              marginTop: 20,
              backgroundColor: Colors.secondary,
              paddingVertical: 8,
              // paddingHorizontal: 10,
              minWidth: 150,
              maxWidth: 150,
              borderRadius: 7,
              marginBottom: 12,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontFamily: "regular",
                color: Colors.bg,
                fontSize: 18,
                fontFamily: "regular",
              }}
            >
              Picked For you
            </Text>
          </View>

          <ScrollView
            contentContainerStyle={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
              // padding: 10, // Adjust padding as needed
            }}
            showsVerticalScrollIndicator={false}
          >
            {feed[0] &&
              feed[0].map((item, index) => (
                <HomeItemTile id={item} key={index} />
              ))}
          </ScrollView>
        </>
      ) : null}

      {productPromotionsMid && productPromotionsMid.length > 0 && (
        <>
          <View
            style={{
              marginTop: 20,
              backgroundColor: Colors.secondary,
              paddingVertical: 8,
              // paddingHorizontal: 10,
              minWidth: 150,
              maxWidth: 150,
              borderRadius: 7,
              marginBottom: 12,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontFamily: "regular",
                color: Colors.bg,
                fontSize: 18,
                fontFamily: "regular",
              }}
            >
              Promotions
            </Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View
              style={{
                flexDirection: "row",
              }}
            >
              {productPromotionsMid &&
                productPromotionsMid.map((item, index) => (
                  // <View key={item}>
                  <HomeItemTile key={index} id={item} />
                  // </View>
                ))}
            </View>
          </ScrollView>
        </>
      )}

      {feed && feed[1] && feed[1].length ? (
        <>
          <View
            style={{
              marginTop: 20,
              backgroundColor: Colors.secondary,
              paddingVertical: 8,
              // paddingHorizontal: 10,
              minWidth: 150,
              maxWidth: 150,
              borderRadius: 7,
              marginBottom: 12,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontFamily: "regular",
                color: Colors.bg,
                fontSize: 18,
                fontFamily: "regular",
              }}
            >
              Picked For you
            </Text>
          </View>
          <ScrollView
            contentContainerStyle={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
              // padding: 10, // Adjust padding as needed
            }}
            showsVerticalScrollIndicator={false}
          >
            {feed[1] &&
              feed[1].map((item, index) => (
                <HomeItemTile id={item} key={index} />
              ))}
          </ScrollView>
        </>
      ) : null}

      {productPromotionsBottom && productPromotionsBottom.length > 0 && (
        <>
          <View
            style={{
              marginTop: 20,
              backgroundColor: Colors.secondary,
              paddingVertical: 8,
              // paddingHorizontal: 10,
              minWidth: 150,
              maxWidth: 150,
              borderRadius: 7,
              marginBottom: 12,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontFamily: "regular",
                color: Colors.bg,
                fontSize: 18,
                fontFamily: "regular",
              }}
            >
              Promotions
            </Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View
              style={{
                flexDirection: "row",
              }}
            >
              {productPromotionsBottom &&
                productPromotionsBottom.map((item, index) => (
                  // <View key={item}>
                  <HomeItemTile key={index} id={item} />
                  // </View>
                ))}
            </View>
          </ScrollView>
        </>
      )}
      {feed && feed[2] && feed[2].length ? (
        <>
          <View
            style={{
              marginTop: 20,
              backgroundColor: Colors.secondary,
              paddingVertical: 8,
              // paddingHorizontal: 10,
              minWidth: 150,
              maxWidth: 150,
              borderRadius: 7,
              marginBottom: 12,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontFamily: "regular",
                color: Colors.bg,
                fontSize: 18,
                fontFamily: "regular",
              }}
            >
              Picked For you
            </Text>
          </View>
          <ScrollView
            contentContainerStyle={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
              // padding: 10, // Adjust padding as needed
            }}
            showsVerticalScrollIndicator={false}
          >
            {feed[2] &&
              feed[2].map((item, index) => (
                <HomeItemTile id={item} key={index} />
              ))}
          </ScrollView>
        </>
      ) : null}
    </ScrollView>
  );
};

export default index;
