import React from "react";
import { View, Button, Text } from "react-native";
import { db } from "@/firebase/firebase";
import { uploadFile } from "@/firebase/StorageService";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { logout } from "../../firebase/auth/AuthService";
import { useRouter } from "expo-router";
import { useUser } from "../../firebase/UserContext";

const TempImage = require("@/image.jpg");

const AddDummyData = () => {
  const { user, loading } = useUser();
  const router = useRouter();
  const addData = async () => {
    try {
      // Add a dummy brand
      const brandRef1 = await addDoc(collection(db, "brands"), {
        name: "Brand ABC",
        category: "Electronics",
        products: [],
      });
      const brandRef2 = await addDoc(collection(db, "brands"), {
        name: "Brand XYZ",
        category: "Electronics",
        products: [],
      });

      // Add a dummy product
      for (let index = 40; index < 41; index++) {
        const productRef = await addDoc(collection(db, "products"), {
          name: `Product ${index}`,
          category: ["Electronics", index % 2 == 0 ? "PQR" : "ABC"],
          productType: "Gadget",
          price: 299.99,
          shortDescription: "A short description of Product ABC.",
          deliveryTime: "3-5 business days",
          returns: "30 days return policy",
          rating: [4.1, 300],
          sold: 500,
          sale: 0,
          brand: index % 2 == 0 ? brandRef1.id : brandRef2.id,
          keywords: [`keyword ${index}`],
          variants: [
            { name: "size", vals: ["small", "large", "x-large"] },
            {
              name: "color",
              vals: ["red", "blue", "green"],
            },
          ],
          // variants: {
          //   size: ["small", "large", "x-large"],
          //   color: ["red", "blue", "green"],
          // },
        });

        // const imageFiles = [TempImage, TempImage, TempImage];
        // const imageUrls = await Promise.all(
        //   imageFiles.map(async (image, i) => {
        //     const filePath = `images/products/${productRef.id}/${i}.jpg`;
        //     // await uploadFile(image, filePath);
        //     return filePath;
        //   })
        // );
        await updateDoc(productRef, {
          // images: imageUrls,
          images: [
            "https://firebasestorage.googleapis.com/v0/b/sahyan-shop.appspot.com/o/images%2Fproducts%2FDj0pDUbrxhFyOhbnb3Jt%2Fimage.jpg?alt=media&token=6bde6a2e-cde3-497e-9836-eac937ad43eb",
            "https://firebasestorage.googleapis.com/v0/b/sahyan-shop.appspot.com/o/images%2Fproducts%2FDj0pDUbrxhFyOhbnb3Jt%2Fimage.jpg?alt=media&token=6bde6a2e-cde3-497e-9836-eac937ad43eb",
            "https://firebasestorage.googleapis.com/v0/b/sahyan-shop.appspot.com/o/images%2Fproducts%2FDj0pDUbrxhFyOhbnb3Jt%2Fimage.jpg?alt=media&token=6bde6a2e-cde3-497e-9836-eac937ad43eb",
          ],
        });

        // Update the brand with the product ID
        if (index % 2 == 0) {
          await updateDoc(brandRef1, {
            products: arrayUnion(productRef.id),
          });
        } else {
          await updateDoc(brandRef2, {
            products: arrayUnion(productRef.id),
          });
        }
      }

      // //  // console.log("Dummy data added successfully");
    } catch (error) {
      console.error("Error adding dummy data:", error);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Button title="Add Dummy Data" onPress={addData} />
      <Button
        title="Logut"
        onPress={async () => {
          await logout();
          router.replace("/login");
        }}
      />
      <Text>{user && user.displayName}</Text>
      {user &&
        user.wishlist &&
        user.wishlist.map((item) => <Text key={item}>{item}</Text>)}
    </View>
  );
};

export default AddDummyData;
