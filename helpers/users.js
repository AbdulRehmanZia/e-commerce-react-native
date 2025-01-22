import { db } from "@/firebase/firebase";
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
} from "firebase/firestore";

export async function addTowishList(userId, productId) {
  const docRef = doc(db, "users", userId);
  await updateDoc(docRef, {
    wishlist: arrayUnion(productId),
  });
}

export async function removeFromWishlist(userId, productId) {
  const docRef = doc(db, "users", userId);
  await updateDoc(docRef, {
    wishlist: arrayRemove(productId),
  });
}
export async function addToCart(userId, productId, amount = 1, variants) {
  const docRef = doc(db, "users", userId);
  const docSnap = await getDoc(docRef);
  const cart = docSnap.data().cart;

  const existingItem = cart.find(
    (item) =>
      item.id === productId &&
      JSON.stringify(item.variants) === JSON.stringify(variants),
  );

  if (existingItem) {
    throw new Error("Item with same variants already added to cart");
  } else {
    await updateDoc(docRef, {
      cart: arrayUnion({ id: productId, count: amount, variants: variants }),
    });
  }
}

export async function addToInterest(user, interest) {
  const docRef = doc(db, "users", user.uid);

  // Normalize interests to an array of unique, non-empty strings
  const interestsToAdd = Array.from(
    new Set(
      (Array.isArray(interest) ? interest : [interest])
        .flatMap((item) =>
          typeof item === "string" ? item.split(/\s+/) : item,
        )
        .filter(Boolean), // Remove falsy values
    ),
  );

  if (interestsToAdd.length === 0) {
    // No valid interests to add
    return false;
  }

  // Get current interests directly from the passed user object
  const currentInterests = user.interests || [];

  // Find interests that are not already in the user's current interests
  // const newInterests = interestsToAdd.filter(
  //   (item) => !currentInterests.includes(item),
  // );

  if (interestsToAdd.length > 0) {
    // Update the document with new interests
    await updateDoc(docRef, {
      interests: arrayUnion(...interestsToAdd),
    });
    return true;
  }

  // No new interests to add
  return false;
}

export function removeToCart(userId, productId, amount = 0) {}
