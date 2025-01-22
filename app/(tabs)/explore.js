import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  TouchableOpacity,
  Dimensions,
  FlatList,
  PanResponder,
  ImageBackground,
  StyleSheet,
  ToastAndroid,
  RefreshControl,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { CustomText as Text } from "@/components/CustomText";
import { Colors } from "@/constants/Colors";
import { getRecommendationData } from "@/helpers/product";
const { height } = Dimensions.get("window");
import { useUser } from "@/firebase/UserContext";
import { addTowishList, removeFromWishlist } from "@/helpers/users";
import { MaterialIcons } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import Loading from "@/components/Loading";

export default function explore() {
  const { user, setUserData } = useUser();

  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const [exploreData, setExploreData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allDataLoaded, setAllDataLoaded] = useState(false);
  const INITIAL_BATCH_SIZE = 10;
  const BATCH_SIZE = 5;
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastLoadedIndex, setLastLoadedIndex] = useState(0);
  const allDataRef = useRef([]);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setAllDataLoaded(false);
    setLastLoadedIndex(0);
    fetchInitialData().finally(() => setRefreshing(false));
  }, [user, fetchInitialData]);
  const fetchInitialData = useCallback(async () => {
    const startTime = Date.now();
    // console.log("fetchInitialData started");

    // try {
    const interests =
      user.interests && user.interests.length > 0 ? user.interests : [];

    // console.log(`Interests determined in ${Date.now() - startTime}ms`);

    const recommendationStartTime = Date.now();
    const data = await getRecommendationData(interests);
    // console.log("unfil ", data);
    // const data = dataUnfiltered.filter((item) =>
    //   [user.country, "other"].includes(item.coutry),
    // );
    // console.log(
    //   `getRecommendationData took ${Date.now() - recommendationStartTime}ms`
    // );
    // console.log(data);
    allDataRef.current = data;

    if (data && Array.isArray(data)) {
      const sliceStartTime = Date.now();
      const initialBatch = data.slice(0, INITIAL_BATCH_SIZE);
      // console.log(
      //   `Slicing initial batch took ${Date.now() - sliceStartTime}ms`
      // );

      const mappingStartTime = Date.now();
      const detailedDataPromises = initialBatch.map(fetchProductData);
      // console.log(
      //   `Mapping fetchProductData took ${Date.now() - mappingStartTime}ms`
      // );

      const promiseAllStartTime = Date.now();
      const detailedData = await Promise.all(detailedDataPromises);
      // console.log(
      //   `Promise.all for detailed data took ${
      //     Date.now() - promiseAllStartTime
      //   }ms`
      // );
      // console.log(detailedData);
      const setStateStartTime = Date.now();
      setExploreData(detailedData);
      setLastLoadedIndex(INITIAL_BATCH_SIZE);
      // console.log(`Setting state took ${Date.now() - setStateStartTime}ms`);
    }
    // } catch (error) {
    //   console.error("Error fetching initial data:", error);
    // }

    // console.log(
    //   `Total fetchInitialData execution time: ${Date.now() - startTime}ms`
    // );
    // console.log();
  }, [user, fetchProductData]);

  const loadMoreData = useCallback(async () => {
    if (loadingMore || allDataLoaded) return;

    setLoadingMore(true);
    try {
      const nextBatch = allDataRef.current.slice(
        lastLoadedIndex,
        lastLoadedIndex + BATCH_SIZE,
      );
      if (nextBatch.length === 0) {
        setAllDataLoaded(true);
        return;
      }

      const detailedDataPromises = nextBatch.map(fetchProductData);
      const newData = await Promise.all(detailedDataPromises);

      setExploreData((prevData) => [...prevData, ...newData]);
      setLastLoadedIndex((prevIndex) => prevIndex + BATCH_SIZE);
    } catch (error) {
      console.error("Error loading more data:", error);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, allDataLoaded, lastLoadedIndex, fetchProductData]);

  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchInitialData().finally(() => setLoading(false));
    }
  }, [user, fetchInitialData]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dx) > 20;
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dx < -50) {
        // // Swipe right to left
        // flatListRef.current.scrollToIndex({
        //   index: currentIndex,
        //   animated: true,
        // });
        router.push(`/seller/${exploreData[currentIndex].seller}`);
      }
    },
  });

  const renderItem = ({ item, index }) => {
    // console.log(item);
    return (
      <View
        style={{
          width: "100%",
          height: height,
          justifyContent: "start",
          alignItems: "center",
          backgroundColor: Colors.bg,
        }}
        key={index}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            router.push(`/product/${item.id}`);
          }}
          style={{
            width: "100%",
            height: "100%",
            // borderRadius: 24,
            backgroundColor: Colors.secondary,
            overflow: "hidden",
          }}
          asChild
        >
          <ImageBackground
            source={{
              uri: item.imageUrls[0],
            }}
            style={{
              width: "100%",
              height: "100%",
              overflow: "hidden",
              justifyContent: "flex-end",
              backgroundColor: Colors.bg,
              // Ensure image doesn't overflow its container
            }}
            resizeMode="cover"
          >
            <View
              style={{
                ...StyleSheet.absoluteFillObject, // Cover the entire parent container
                backgroundColor: "rgba(0, 0, 0, 0.25)", // Semi-transparent grey overlay
              }}
            />
            <View
              style={{
                bottom: 50,
                paddingHorizontal: 20,
                zIndex: 99,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 10,
                width: "100%",
              }}
            >
              <View
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: "90%",
                }}
              >
                <Text
                  style={{
                    fontSize: 36,
                    color: Colors.bg,
                    fontFamily: "black",
                  }}
                >
                  {item.name}
                </Text>
                <Text
                  style={{
                    fontSize: 26,
                    color: Colors.bg,
                    fontFamily: "semibold",
                  }}
                >
                  {item.brand}
                </Text>
                <Text
                  style={{
                    fontSize: 26,
                    color: Colors.bg,
                    fontFamily: "bold",
                  }}
                >
                  {item.currency} {item.price.toFixed(2)}
                </Text>

                <Text
                  style={{
                    fontSize: 16,
                    color: Colors.bg,
                    fontFamily: "extraLight",
                  }}
                  numberOfLines={2}
                >
                  {item.shortDescription} asdsa dasd asd sdas dasd asdasd asdfsf
                  fs dfdf dsf ds fdfdsfdsfsdfdsfd fsdfdsfdsfdsf dsfdss adass
                  dasdasd adsd asdsad asdsas
                </Text>
              </View>

              <View
                style={{
                  display: "flex",
                  flexDirection: "column",

                  gap: 10,
                  alignItems: "center",
                }}
              >
                {user && user.wishlist && user.wishlist.includes(item.id) ? (
                  <TouchableOpacity
                    onPress={async () => {
                      try {
                        await removeFromWishlist(user.uid, item.id);

                        setUserData(true);
                        ToastAndroid.show(
                          "Successfully removed to wishlist",
                          ToastAndroid.SHORT,
                        );
                        // You can add some user feedback here, like a toast notification
                        // //  // console.log("Product added to cart");
                      } catch (error) {
                        ToastAndroid.show(
                          "Couldnt Add product to wishlist",
                          ToastAndroid.SHORT,
                        );
                        console.error("Error!", error);
                        // Handle the error, maybe show an error message to the user
                      }
                    }}
                  >
                    <MaterialIcons
                      name="bookmark"
                      size={26}
                      color={Colors.bg}
                    />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={async () => {
                      try {
                        await addTowishList(user.uid, item.id);

                        setUserData(true);
                        ToastAndroid.show(
                          "Successfully added to wishlist",
                          ToastAndroid.SHORT,
                        );
                        // You can add some user feedback here, like a toast notification
                        // //  // console.log("Product added to cart");
                      } catch (error) {
                        ToastAndroid.show(
                          "Couldnt Add product to wishlist",
                          ToastAndroid.SHORT,
                        );
                        console.error("Error!", error);
                        // Handle the error, maybe show an error message to the user
                      }
                    }}
                  >
                    <MaterialIcons
                      name="bookmark-outline"
                      size={26}
                      color={Colors.bg}
                    />
                  </TouchableOpacity>
                )}
                <View
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    alignItems: "center",
                  }}
                >
                  <AntDesign name="star" size={20} color={Colors.bg} />
                  {item && item.rating && (
                    <Text
                      style={{
                        fontFamily: "regular",
                        size: 12,
                        color: Colors.bg,
                      }}
                    >
                      {item.rating[0].toFixed(1)}
                    </Text>
                  )}
                </View>

                <View
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    alignItems: "center",
                  }}
                >
                  <FontAwesome name="dollar" size={20} color={Colors.bg} />
                  {item && item.rating && (
                    <Text
                      style={{
                        fontFamily: "regular",
                        size: 12,
                        color: Colors.bg,
                      }}
                    >
                      {item.rating[0].toFixed(1)}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </ImageBackground>
        </TouchableOpacity>
      </View>
    );
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;
  // useEffect(() => {
  // }, [currentIndex]);
  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <FlatList
        ref={flatListRef}
        data={exploreData}
        renderItem={renderItem}
        keyExtractor={(_, index) => index.toString()}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={height}
        snapToAlignment="start"
        horizontal={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        decelerationRate={1}
        disableIntervalMomentum={true}
        initialNumToRender={INITIAL_BATCH_SIZE}
        onEndReached={loadMoreData}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() =>
          loadingMore ? (
            <View style={{ padding: 10, alignItems: "center" }}>
              <Text style={{ fontFamily: "extraLight" }}>Loading more...</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View
            style={{
              flex: 1,
              width: "100%",
              height: height,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: Colors.bg,
            }}
          >
            <Text>Check Home page for personalized data</Text>
          </View>
        }
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
      />
      {!allDataLoaded && (
        <View
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              fontFamily: "extraLight",
            }}
          >
            Loading more...
          </Text>
        </View>
      )}
    </>
  );
}
