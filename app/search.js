import React, { useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  ToastAndroid,
  TextInput,
  FlatList,
  Dimensions,
  StyleSheet,
  Modal,
  ScrollView,
} from "react-native";
import { CustomText as Text } from "@/components/CustomText";
import { Colors } from "@/constants/Colors";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { getDataPaginated } from "@/helpers/product";
import SearchItem from "../components/SearchItem";
import fetchBrandData from "@/helpers/brand";
import Loading from "@/components/Loading";
import { addToInterest } from "@/helpers/users";
const { width } = Dimensions.get("screen");
import { useUser } from "@/firebase/UserContext";

const FilterModal = ({
  isVisible,
  onClose,
  onApplyFilters,
  searchResults,
  currentFilters,
}) => {
  const [priceRange, setPriceRange] = useState(
    currentFilters.priceRange || { min: "0", max: "100000" },
  );
  const [selectedCategory, setSelectedCategory] = useState(
    currentFilters.category || "",
  );
  const [selectedBrand, setSelectedBrand] = useState("");
  const [minRating, setMinRating] = useState("");

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const fetchUniqueBrands = async (searchResults) => {
    try {
      const brandPromises = searchResults.map(async (item) => {
        // const brandData = await fetchBrandData(item.brand);
        return item.brand;
      });
      //
      // const brands = await Promise.all(brandPromises);
      //
      const uniqueBrands = [...new Set(brands)];

      return uniqueBrands;
    } catch (error) {
      console.error("Error fetching brand data:", error);
    }
  };

  const extractUniqueCategories = (searchResults) => {
    try {
      const categories = searchResults.flatMap((item) => {
        if (Array.isArray(item.category)) {
          return item.category;
        } else if (
          typeof item.category === "object" &&
          item.category !== null
        ) {
          return item.category.name;
        }
        return item.category;
      });

      const uniqueCategories = [...new Set(categories)].filter(
        (category) =>
          category !== undefined && category !== null && category !== "",
      );

      return uniqueCategories;
    } catch (error) {
      console.error("Error extracting categories:", error);
    }
  };

  useEffect(() => {
    const loadBrands = async () => {
      const brands = await fetchUniqueBrands(searchResults);
      setBrands(brands);
    };
    loadBrands();
    const uniqueCategories = extractUniqueCategories(searchResults);
    setCategories(uniqueCategories);
  }, [searchResults]);

  const handleApplyFilters = () => {
    const filters = {
      priceRange: {
        min: priceRange.min ? parseFloat(priceRange.min) : undefined,
        max: priceRange.max ? parseFloat(priceRange.max) : undefined,
      },
      category: selectedCategory,
      brand: selectedBrand,
      minRating: minRating ? parseFloat(minRating) : undefined,
    };
    onApplyFilters(filters);
    onClose();
  };

  const handleClearFilters = () => {
    setPriceRange({ min: "", max: "" });
    setSelectedCategory("");
    setSelectedBrand("");
    setMinRating("");
    handleApplyFilters();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <ScrollView>
            <Text style={styles.sectionTitle}>Price Range</Text>
            <View style={styles.priceInputContainer}>
              <TextInput
                style={styles.priceInput}
                placeholder="Min"
                value={priceRange.min}
                onChangeText={(text) =>
                  setPriceRange({ ...priceRange, min: text })
                }
                keyboardType="numeric"
              />
              <Text> - </Text>
              <TextInput
                style={styles.priceInput}
                placeholder="Max"
                value={priceRange.max}
                onChangeText={(text) =>
                  setPriceRange({ ...priceRange, max: text })
                }
                keyboardType="numeric"
              />
            </View>

            <Text style={styles.sectionTitle}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories.map((category, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.filterButton,
                    selectedCategory === category &&
                      styles.selectedFilterButton,
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text
                    style={
                      selectedCategory === category
                        ? styles.selectedFilterText
                        : styles.filterText
                    }
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.sectionTitle}>Brand</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {brands.map((brand, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.filterButton,
                    selectedBrand === brand && styles.selectedFilterButton,
                  ]}
                  onPress={() => setSelectedBrand(brand)}
                >
                  <Text
                    style={
                      selectedBrand === brand
                        ? styles.selectedFilterText
                        : styles.filterText
                    }
                  >
                    {brand}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.sectionTitle}>Minimum Rating</Text>
            <TextInput
              style={styles.ratingInput}
              placeholder="Minimum Rating (1-5)"
              value={minRating}
              onChangeText={setMinRating}
              keyboardType="numeric"
            />

            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleApplyFilters}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                borderColor: Colors.primary,
                borderWidth: 1,
                borderRadius: 5,
                padding: 10,
                alignItems: "center",
                marginTop: 10,
              }}
              onPress={handleClearFilters}
            >
              <Text
                style={{
                  color: Colors.text,
                  fontWeight: "bold",
                }}
              >
                Clear Filters
              </Text>
            </TouchableOpacity>
          </ScrollView>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <MaterialIcons name="close" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const Search = () => {
  const router = useRouter();
  const { user, setUserData } = useUser();
  const { query, category } = useLocalSearchParams();
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState(query || "");
  const [searchResults, setSearchResults] = useState([]);
  const [filters, setFilters] = useState(
    category ? { category: category } : {},
  );
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  const applyFilters = (items, filters) => {
    return items.filter((item) => {
      if (
        searchQuery &&
        searchQuery.trim() !== "" &&
        !item.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      if (filters.priceRange) {
        const { min, max } = filters.priceRange;
        if (
          (min !== undefined && item.price < min) ||
          (max !== undefined && item.price > max)
        ) {
          return false;
        }
      }

      if (filters.category && item.category !== filters.category) {
        return false;
      }

      if (filters.brand && item.brand !== filters.brand) {
        return false;
      }

      if (filters.minRating && item.rating < filters.minRating) {
        return false;
      }

      return true;
    });
  };

  useEffect(() => {
    async function init() {
      await performSearch(searchQuery);
    }

    if (searchQuery || Object.keys(filters).length > 0) {
      init();
    } else {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    async function addInterest() {
      if (searchQuery && searchQuery.trim() !== "") {
        await addToInterest(user, searchQuery);
        setUserData(true);
      }
    }
    if (searchResults && user) {
      addInterest();
    }
  }, [searchResults]);

  const performSearch = async (query, isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoading(true);
      } else if (!isLoadMore && !initialLoading) {
        setFilterLoading(true);
      }

      const {
        data,
        lastDoc: newLastDoc,
        hasMore,
      } = await getDataPaginated(
        "products",
        10,
        isLoadMore ? lastDoc : null,
        1,
      );

      const filteredData = await applyFilters(data, filters);

      setSearchResults((prevResults) =>
        isLoadMore ? [...prevResults, ...filteredData] : filteredData,
      );
      setLastDoc(newLastDoc);
      setHasMore(hasMore);
    } catch (error) {
      console.error("Error performing search: ", error);
      ToastAndroid.show("Error performing search", ToastAndroid.SHORT);
    } finally {
      setLoading(false);
      setInitialLoading(false);
      setFilterLoading(false);
    }
  };

  const handleSearch = () => {
    performSearch(searchQuery);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      performSearch(searchQuery, true);
    }
  };

  const renderItem = ({ item }) => <SearchItem itemData={item} />;

  const ListFooter = () => {
    if (!hasMore) return null;
    return (
      <TouchableOpacity
        onPress={handleLoadMore}
        style={styles.loadMoreButton}
        disabled={loading}
      >
        {loading ? (
          <Loading />
        ) : (
          <Text style={styles.loadMoreText}>Load more</Text>
        )}
      </TouchableOpacity>
    );
  };

  if (initialLoading) {
    return <Loading />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <View style={styles.searchInputContainer}>
          <TextInput
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchInput}
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
        <TouchableOpacity
          activeOpacity={0.7}
          style={{
            padding: 6,
          }}
          onPress={() => setIsFilterModalVisible(true)}
        >
          <MaterialIcons name="filter-alt" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {filterLoading ? (
        <View style={styles.centerLoader}>
          <Loading />
        </View>
      ) : (
        <FlatList
          data={searchResults}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={styles.noResultsText}>No results found</Text>
          }
          numColumns={2}
          style={styles.resultsList}
          contentContainerStyle={styles.resultsContainer}
          ListFooterComponent={ListFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
        />
      )}

      <FilterModal
        isVisible={isFilterModalVisible}
        onClose={() => setIsFilterModalVisible(false)}
        onApplyFilters={(newFilters) => {
          // console.log(newFilters);
          setFilters(newFilters);
          performSearch(searchQuery);
        }}
        searchResults={searchResults}
        currentFilters={filters}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bg,
    flex: 1,
  },

  centerLoader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 0.4,
    borderBottomColor: Colors.secondary,
  },
  backButton: {
    borderRadius: 99,
    padding: 3,
  },
  searchInputContainer: {
    width: "60%",
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
  },
  searchInput: {
    fontSize: 14,
    color: Colors.text,
    width: "86%",
  },
  filterButton: {
    borderRadius: 99,
    padding: 3,
  },
  resultsList: {
    marginTop: 10,
  },
  resultsContainer: {
    justifyContent: "space-around",
    paddingHorizontal: 10,
    alignItems: "flex-start",
    alignSelf: "center",
    display: "flex",
  },
  loadMoreButton: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 6,
    paddingVertical: 10,
    borderRadius: 5,
    width: width - 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  loadMoreText: {
    color: Colors.bg,
  },
  noResultsText: {
    textAlign: "center",
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: Colors.bg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 5,
  },
  priceInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    width: "100%",
  },
  priceInput: {
    borderWidth: 1,
    borderColor: Colors.secondary,
    borderRadius: 5,
    padding: 5,
    width: "48%",
  },
  filterButton: {
    backgroundColor: Colors.bg,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    marginBottom: 10,
  },
  selectedFilterButton: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    fontFamily: "regular",
    color: Colors.text,
  },
  selectedFilterText: {
    fontFamily: "regular",
    color: Colors.bg,
  },
  ratingInput: {
    borderWidth: 1,
    borderColor: Colors.secondary,
    borderRadius: 5,
    padding: 5,
    marginBottom: 10,
  },
  applyButton: {
    backgroundColor: Colors.primary,
    borderRadius: 5,
    padding: 10,
    alignItems: "center",
    marginTop: 10,
  },
  applyButtonText: {
    color: Colors.bg,
    fontWeight: "bold",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
  },
});

export default Search;
