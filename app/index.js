import React, { useEffect, useState } from "react";
import { Linking, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "@/firebase/firebase";
import { useUser } from "@/firebase/UserContext";

import "expo-router/entry";
export default function Index() {
  // const [user, setUser] = useState(null);
  const router = useRouter();
  const { user, loading } = useUser();
  // console.log("index");

  useEffect(() => {
    const handleDeepLink = ({ url }) => {
      // Parse the URL to get the ID
      const match = url.match(/seller\/(\d+)/);
      // console.log("DL");
      if (match) {
        const id = match[1];
        // console.log(id);
        router.push(`/seller/${id}`);
      }
    };

    // Handle deep links when app is already open
    Linking.addEventListener("url", handleDeepLink);

    // Handle deep links when app is opened from closed state
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });
  }, []);

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace("/explore");
      } else {
        router.replace("/login");
      }
    }
  }, [user, loading]);

  return <View />;
}
