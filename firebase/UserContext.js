import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "./firebase"; // Import your initialized auth instance
import { Text } from "react-native";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { queryDoc } from "./FirestoreService";
import Loading from "@/components/Loading";
import { cacheService } from "@/CacheService";

const UserContext = createContext();

export const useUser = () => {
  const { authUser } = useContext(UserContext);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [update, setUpdate] = useState(false);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      let userDoc;
      if (update) {
        // console.log("UPDATE");
        userDoc = await queryDoc("users", authUser.uid);
        if (userDoc) {
          setUserData({
            ...authUser,
            ...userDoc,
            interests: new Set(userDoc.interests),
          });
          await cacheService.set(authUser.uid, userDoc, "users"); // Cache the user data
        } else {
          setUserData(authUser);
        }
      } else {
        // console.log("CACHE");
        userDoc = await cacheService.get(authUser.uid, "users");
        if (userDoc) {
          setUserData({ ...authUser, ...userDoc });
        } else {
          userDoc = await queryDoc("users", authUser.uid);
          if (userDoc) {
            setUserData({
              ...authUser,
              ...userDoc,
              interests: new Set(userDoc.interests),
            });
            await cacheService.set(authUser.uid, userDoc, "users"); // Cache the user data
          } else {
            setUserData(authUser);
          }
        }
      }
    } catch (error) {
      // console.log("Error fetching user data:", error);
    } finally {
      setLoading(false);
      setUpdate(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    // //  // console.log("....");
  }, [update]);

  return { user: userData, loading, setUserData: setUpdate };
};

export const UserProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoading(true);
      setAuthUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <UserContext.Provider value={{ authUser, loading }}>
      {loading ? <Loading /> : children}
    </UserContext.Provider>
  );
};
