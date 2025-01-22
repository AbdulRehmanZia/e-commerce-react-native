// DataService.js
import { queryDoc, getIDData } from "@/firebase/FirestoreService";
import { getFileUrl } from "@/firebase/StorageService";
import fetchBrandData from "./brand";
import { cacheService } from "@/CacheService";

import { db, auth } from "@/firebase/firebase";
import {
  collection,
  getDocs,
  query,
  limit,
  startAfter,
  orderBy,
  where,
  or,
  and,
} from "firebase/firestore";

import { useUser } from "@/firebase/UserContext";
export default fetchProductData = async (productId) => {
  const cachedProduct = await cacheService.get(productId, "products");
  // // //  // console.log(`Cache ${cachedProduct}`);
  if (cachedProduct) {
    // // //  // console.log("return cache");
    return cachedProduct;
  }

  const productData = await queryDoc("products", productId);
  if (!productData) {
    // //  // console.log("Product not found");
    return null;
  }

  // Fetch brand data
  if (productData.seller) {
    productData.sellerId = productData.seller;
    const brandData = await fetchBrandData(productData.seller);
    // console.log(brandData);
    productData.seller = brandData.name;
    productData.country = brandData.country;
  }

  // Fetch image URLs
  if (productData.images && Array.isArray(productData.images)) {
    const imagePromises = productData.images.map(
      (imagePath) => getFileUrl(imagePath),
      //"https://firebasestorage.googleapis.com/v0/b/sahyan-shop.appspot.com/o/images%2Fproducts%2FDj0pDUbrxhFyOhbnb3Jt%2Fimage.jpg?alt=media&token=6bde6a2e-cde3-497e-9836-eac937ad43eb"
    );
    productData.imageUrls = await Promise.all(imagePromises);
  }
  await cacheService.set(productId, productData, "products");
  // console.log(productData);
  return productData;
};

export const getDataPaginated = async (
  collectionName,
  pageSize = 20,
  lastDoc = null,
) => {
  try {
    const baseQuery = collection(db, collectionName);
    const orderedQuery = query(baseQuery, orderBy("name"));

    let pageQuery;
    if (lastDoc) {
      pageQuery = query(orderedQuery, startAfter(lastDoc), limit(pageSize));
    } else {
      pageQuery = query(orderedQuery, limit(pageSize));
    }

    const snapshot = await getDocs(pageQuery);
    const data = await Promise.all(
      snapshot.docs.map(async (doc) => await fetchProductData(doc.id)),
    );

    const newLastDoc = snapshot.docs[snapshot.docs.length - 1];
    const hasMore = data.length === pageSize;

    return {
      data,
      lastDoc: newLastDoc,
      hasMore,
    };
  } catch (error) {
    console.error("Error getting documents: ", error);
    return { data: [], lastDoc: null, hasMore: false };
  }
};

export const getRecommendationData = async (userInterests) => {
  // Take only the last 20 interests and remove duplicates
  const limitedInterests = Array.from(new Set(userInterests)).slice(-20);

  const u = auth.currentUser;
  const user = await queryDoc("users", u.uid);
  // Fetch the first 50 products from Firebase
  const productsQuery = query(
    collection(db, "products"),
    // and(
    //   or(where("country", "==", user.country), where("country", "==", "other")),
    // ),
    limit(50),
  );
  const productsSnapshot = await getDocs(productsQuery);

  // Convert the snapshot to an array of product objects
  const productsPromise = productsSnapshot.docs.map(
    async (doc) => await fetchProductData(doc.id),
  );
  const products = await Promise.all(productsPromise);

  // If there are no interests, return all products
  // console.log(limitedInterests);
  // console.log(products);
  let filteredProducts = limitedInterests.length
    ? products.filter((product) => {
        return limitedInterests.some(
          (interest) =>
            (product.category && product.category.includes(interest)) ||
            (product.keywords && product.keywords.includes(interest)) ||
            (product.name &&
              product.name.toLowerCase().includes(interest.toLowerCase())) ||
            (product.shortDescription &&
              product.shortDescription
                .toLowerCase()
                .includes(interest.toLowerCase())),
        );
      })
    : products;

  // Sort the filtered products by relevance (if there are interests)
  if (limitedInterests.length) {
    filteredProducts.sort((a, b) => {
      const scoreA = calculateRelevanceScore(a, limitedInterests);
      const scoreB = calculateRelevanceScore(b, limitedInterests);
      return scoreB - scoreA;
    });
  }
  filteredProducts.push(...products);
  // console.log("temp: ", filteredProducts);
  // console.log(products);
  // Return the top 100 product IDs (or all if less than 100)
  return Array.from(new Set(filteredProducts))
    .slice(0, 100)
    .map((product) => product.id);
};

// Helper function to calculate relevance score
const calculateRelevanceScore = (product, interests) => {
  let score = 0;
  interests.forEach((interest) => {
    if (product.category && product.category.includes(interest)) score++;
    if (product.keywords && product.keywords.includes(interest)) score++;
    if (
      product.name &&
      product.name.toLowerCase().includes(interest.toLowerCase())
    )
      score++;
    if (
      product.shortDescription &&
      product.shortDescription.toLowerCase().includes(interest.toLowerCase())
    )
      score++;
  });
  return score;
};
// export const getDataPaginatedParallel = async (
//   collectionName,
//   pageSize = 20,
//   lastDoc = null,
//   parallelQueries = 3
// ) => {
//   try {
//     const baseQuery = collection(db, collectionName);
//     const orderedQuery = query(baseQuery, orderBy("name")); // Assuming 'createdAt' field exists

//     const createPageQuery = (startDoc) => {
//       return startDoc
//         ? query(orderedQuery, startAfter(startDoc), limit(pageSize))
//         : query(orderedQuery, limit(pageSize));
//     };

//     const fetchPage = async (startDoc) => {
//       const pageQuery = createPageQuery(startDoc);
//       const snapshot = await getDocs(pageQuery);
//       return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
//     };

//     let allData = [];
//     let lastDocument = lastDoc;

//     for (let i = 0; i < parallelQueries; i++) {
//       // //  // console.log(i);
//       const pageData = await fetchPage(lastDocument);
//       // //  // console.log(pageData);
//       allData = [...allData, ...pageData];

//       if (pageData.length < pageSize) {
//         break; // No more data to fetch
//       }

//       lastDocument = pageData[pageData.length - 1];
//     }

//     // Fetch additional data for each product

//     const productPromises = allData.map((product) => fetchProductData(product));
//     allData = await Promise.all(productPromises);

//     return {
//       data: allData,
//       lastDoc: lastDocument,
//       hasMore: allData.length === pageSize * parallelQueries,
//     };
//   } catch (error) {
//     console.error("Error getting documents: ", error);
//     return { data: [], lastDoc: null, hasMore: false };
//   }
// };
