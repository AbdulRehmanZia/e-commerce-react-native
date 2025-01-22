import React, { useState, useEffect } from "react";
import {
  View,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
} from "react-native";
import { CustomText as Text } from "@/components/CustomText";
import { Colors } from "@/constants/Colors";
import { MaterialIcons } from "@expo/vector-icons";
import fetchBrandData from "@/helpers/brand";

const FilterModal = ({ isVisible, onClose, onApplyFilters, searchResults }) => {
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [minRating, setMinRating] = useState("");

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    // Extract unique categories and brands from searchResults
    const uniqueCategories = [
      ...new Set(searchResults.map((item) => item.category)),
    ];
    const uniqueBrands = [
      ...new Set(
        searchResults.map(async (item) => {
          // const brandData = await fetchBrandData(item.brand);
          return item.brand;
        })
      ),
    ];
    setCategories(uniqueCategories);
    setBrands(uniqueBrands);
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
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
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
              {brands.map((brand) => (
                <TouchableOpacity
                  key={brand}
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
          </ScrollView>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <MaterialIcons name="close" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
  },
  priceInput: {
    borderWidth: 1,
    borderColor: Colors.secondary,
    borderRadius: 5,
    padding: 5,
    width: 100,
  },
  filterButton: {
    backgroundColor: Colors.bg,
    borderWidth: 1,
    borderColor: Colors.secondary,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginRight: 10,
    marginBottom: 10,
  },
  selectedFilterButton: {
    backgroundColor: Colors.secondary,
  },
  filterText: {
    color: Colors.text,
  },
  selectedFilterText: {
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
    backgroundColor: Colors.secondary,
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

export default FilterModal;
