import { Image, ScrollView, TouchableOpacity, View } from "react-native";
import { CustomText as Text } from "@/components/CustomText";
import React, { useEffect, useState } from "react";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import fetchBrandData from "@/helpers/brand";
import Loading from "@/components/Loading";
import fetchProductData from "@/helpers/product";
import { Colors } from "@/constants/Colors";
import HomeItemTile from "@/components/HomeItemTile";
import { FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ErrorState = ({ message, onRetry }) => (
  <View style={styles.errorContainer}>
    <Text style={styles.errorText}>{message}</Text>
    {onRetry && (
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryText}>Try Again</Text>
      </TouchableOpacity>
    )}
    <Link href={"/"} style={{ fontSize: 16, marginTop: 10 }}>
      Go To Home
    </Link>
  </View>
);

const EmptyProducts = () => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyText}>No products available</Text>
  </View>
);

import { useUser } from "@/firebase/UserContext";
const Seller = () => {
  const { id } = useLocalSearchParams();
  // const router = useRouter();
  //
  const [sellerData, setSellerData] = useState();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  // const user =

  const fetchSellerData = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!id) {
        throw new Error("Invalid seller ID");
      }
      const data = await fetchBrandData(id);
      if (!data) {
        throw new Error("Seller not found");
      }
      setSellerData(data);
      if (data.products?.length > 0) {
        await loadMoreItems(data.products);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerData();
  }, [id]);

  const loadMoreItems = async (productIds) => {
    if (loadingMore || currentIndex >= (productIds?.length || 0)) return;

    try {
      setLoadingMore(true);
      const newItems = [];
      const endIndex = Math.min(currentIndex + 10, productIds.length);

      for (let i = currentIndex; i < endIndex; i++) {
        newItems.push(productIds[i]);
      }

      setProducts((prevData) => [...prevData, ...newItems]);
      setCurrentIndex(endIndex);
    } catch (err) {
      console.error("Error loading more products:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={error === "Invalid seller ID" ? null : fetchSellerData}
      />
    );
  }

  const renderHeader = () => (
    <>
      <View style={styles.header}>
        <View style={styles.avatar}>
          {sellerData?.photoURL ? (
            <Image
              source={{ uri: sellerData.photoURL }}
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
        <Text style={styles.name}>{sellerData?.name || "Unknown Seller"}</Text>
        <View style={styles.statsContainer}>
          <StatItem label="Sales" value={sellerData?.sales || "0"} />
          {/* <StatDivider />
          <StatItem label="Ratings" value={sellerData?.ratings || "0"} />
          <StatDivider />
          <StatItem label="Shipping" value={sellerData?.shipping || "0"} /> */}
        </View>
      </View>
    </>
  );

  const renderItem = ({ item, index }) => {
    if (index % 2 === 0) {
      const nextItem = products[index + 1];
      return (
        <View style={styles.row}>
          <HomeItemTile id={item} style={styles.tile} />
          {nextItem && <HomeItemTile id={nextItem} style={styles.tile} />}
        </View>
      );
    }
    return null;
  };

  const renderFooter = () => {
    if (loadingMore) {
      return (
        <View style={styles.footer}>
          <ActivityIndicator color={Colors.secondary} />
        </View>
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item}-${index}`}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!loading && <EmptyProducts />}
        ListFooterComponent={renderFooter}
        onEndReached={() => loadMoreItems(sellerData?.products)}
        onEndReachedThreshold={0.1}
        contentContainerStyle={[
          styles.listContainer,
          !products.length && styles.emptyListContainer,
        ]}
      />
    </SafeAreaView>
  );
};

const StatItem = ({ label, value }) => (
  <View style={styles.statItem}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const StatDivider = () => <View style={styles.statDivider} />;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  listContainer: {
    padding: 6,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  header: {
    alignItems: "center",
    marginBottom: 10,
    borderBottomWidth: 0.5,
    paddingBottom: 8,
    borderBottomColor: Colors.secondary + "80",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    // backgroundColor: Colors.secondary,
  },
  name: {
    fontFamily: "semibold",
    fontSize: 16,
    marginTop: 6,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "80%",
    marginTop: 10,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontFamily: "black",
    fontSize: 18,
  },
  statLabel: {
    fontFamily: "semibold",
  },
  statDivider: {
    height: "50%",
    width: 1,
    opacity: 0.2,
    backgroundColor: Colors.secondary,
  },
  banner: {
    width: "100%",
    height: 200,
    borderRadius: 6,
    backgroundColor: Colors.secondary,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  tile: {
    flex: 1,
    margin: 5,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    fontFamily: "medium",
  },
  retryButton: {
    padding: 10,
    backgroundColor: Colors.secondary,
    borderRadius: 8,
  },
  retryText: {
    color: Colors.bg,
    fontFamily: "medium",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.secondary,
    fontFamily: "medium",
  },
  footer: {
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Seller;
