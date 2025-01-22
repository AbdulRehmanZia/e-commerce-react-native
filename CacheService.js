import AsyncStorage from "@react-native-async-storage/async-storage";

const BRAND_EXPIRY = 10 * 60 * 1000; // 10 minutes in milliseconds
const PRODUCT_EXPIRY = 10 * 60 * 1000; // 10 minutes in milliseconds
const USER_EXPIRY = 10 * 60 * 1000; // 10 minutes in milliseconds

// const BRAND_EXPIRY = 0; // 10 minutes in milliseconds
// const PRODUCT_EXPIRY = 0; // 10 minutes in milliseconds
// const USER_EXPIRY = 0; // 10 minutes in milliseconds

class CacheService {
  constructor() {
    this.memoryCache = {
      seller: new Map(),
      products: new Map(),
      users: new Map(), // Added users cache
    };
  }

  async get(key, type) {
    // Check memory cache first
    const memoryItem = this.memoryCache[type].get(key);
    if (memoryItem && Date.now() < memoryItem.expiry) {
      return memoryItem.value;
    }

    // If not in memory, check AsyncStorage
    const storedItem = await AsyncStorage.getItem(`${type}_${key}`);
    if (storedItem) {
      const { value, expiry } = JSON.parse(storedItem);
      if (Date.now() < expiry) {
        // Update memory cache
        this.memoryCache[type].set(key, { value, expiry });
        return value;
      }
    }

    // If not found or expired, return null
    return null;
  }

  async set(key, value, type) {
    const expiry =
      Date.now() +
      (type === "seller"
        ? BRAND_EXPIRY
        : type === "products"
          ? PRODUCT_EXPIRY
          : USER_EXPIRY);

    // Update memory cache
    this.memoryCache[type].set(key, { value, expiry });

    // Update AsyncStorage
    await AsyncStorage.setItem(
      `${type}_${key}`,
      JSON.stringify({ value, expiry }),
    );
  }

  async invalidate(key, type) {
    // Remove from memory cache
    this.memoryCache[type].delete(key);

    // Remove from AsyncStorage
    await AsyncStorage.removeItem(`${type}_${key}`);
  }

  async clearAll() {
    // Clear memory cache
    this.memoryCache.seller.clear();
    this.memoryCache.products.clear();

    // Clear AsyncStorage
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(
      (key) => key.startsWith("seller_") || key.startsWith("products_"),
    );
    await AsyncStorage.multiRemove(cacheKeys);
  }
}

export const cacheService = new CacheService();
