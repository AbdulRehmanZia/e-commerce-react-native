import { queryDoc } from "@/firebase/FirestoreService";
import { cacheService } from "@/CacheService";
export default fetchBrandData = async (brandId) => {
  try {
    // const cachedBrand = await cacheService.get(brandId, "seller");
    // // console.log(`Cache brand ${cachedBrand}`);
    // if (cachedBrand) {
    //   // console.log("return cache");
    //   return cachedBrand;
    // }

    const brandData = await queryDoc("seller", brandId);
    if (!brandData) {
      // console.log("Brand not found");
      return null;
    }

    await cacheService.set(brandId, brandData, "seller");
    return brandData;
  } catch (error) {
    console.error("Error fetching brand data:", error);
    return null;
  }
};
