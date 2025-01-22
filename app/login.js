// screens/LoginScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  ToastAndroid,
  ImageBackground,
  Dimensions,
} from "react-native";
import { login, googleSignin } from "@/firebase/auth/AuthService"; // Ensure the import path is correct
import { CustomText as Text } from "@/components/CustomText";
import { Link, useRouter } from "expo-router";
import { guestLogin } from "../firebase/auth/AuthService";
import { Colors } from "@/constants/Colors";
import LOGO from "@/assets/images/logo.jpeg";
import BACKGROUND_IMAGE from "@/assets/images/login_bg.png";
import Loading from "@/components/Loading";
import { addDataByID } from "../firebase/FirestoreService";

import { Ionicons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import axios from "axios";
const { height } = Dimensions.get("screen");

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // console.log("INIT LOGINT");
    setLoading(false);
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    login(email, password).then(async (res) => {
      try {
        await addDataByID(
          "users",
          res.uid,
          {
            cart: [],
            wishlist: [],
            history: [],
            interests: [],
          },
          false,
        );
        router.replace("/explore");
      } catch (error) {
        setError(res.message);
      } finally {
        // setLoading(false);
      }
    });

    // Navigate to the main screen after login
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const user = await googleSignin();

    try {
      const response = await axios.get("http://ip-api.com/json/");
      // //  // console.log(user);
      await addDataByID(
        `users`,
        user,
        {
          cart: [],
          wishlist: [],
          history: [],
          interests: [],
          country: response.data.countryCode.toLowerCase(),
        },
        false,
      );
      router.replace("/explore");
    } catch (err) {
      // //  // console.log(err);
      ToastAndroid.show(err.message, ToastAndroid.SHORT);
    }
  };

  const handleGuestLogin = async () => {
    const response = await axios.get("http://ip-api.com/json/");
    setLoading(true);
    try {
      const id = await guestLogin();
      // console.log(id);
      await addDataByID(
        `users`,
        id.uid,
        {
          cart: [],
          wishlist: [],
          history: [],
          interests: [],
          country: response.data.countryCode.toLowerCase(),
        },
        false,
      );
      // Navigate to the main screen after login
      router.replace("/explore");
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <ImageBackground
      source={BACKGROUND_IMAGE}
      style={{ flex: 1, height: "100%", resizeMode: "contain" }}
    >
      <View
        style={{
          justifyContent: "center",
          padding: 16,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          backgroundColor: Colors.bg,
          padding: 20,
          bottom: 0,
          position: "absolute",
          width: "100%",
          borderTopRightRadius: 80,
          height: height * 0.7,
        }}
      >
        <View
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 0,
            gap: 5,
          }}
        >
          {/* <Image
            source={LOGO}
            style={{ width: "100%", resizeMode: "contain", height: 150 }}
          /> */}
          <Text
            style={{
              marginBottom: 20,
              fontFamily: "black",
              fontSize: 34,
            }}
          >
            Login
          </Text>
          {error ? (
            <Text style={{ color: "red", marginVertical: 8 }}>{error}</Text>
          ) : null}
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            onPress={async () => {
              // setLoading(true);
              await handleLogin();
              // setLoading(false);
            }}
            style={{
              borderWidth: 1,
              borderColor: Colors.primary,
              paddingHorizontal: 6,
              minWidth: 260,
              maxWidth: 260,
              paddingVertical: 10,
              borderRadius: 8,
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-evenly",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontFamily: "semibold",
                fontSize: 20,
                color: Colors.primary,
              }}
            >
              Login
            </Text>
          </TouchableOpacity>
          <Link
            href={"/signup"}
            style={{
              fontFamily: "extraLight",
              fontSize: 15,
              marginTop: 4,
            }}
          >
            Create account
          </Link>
        </View>

        <View
          style={{
            display: "flex",
            gap: 4,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginVertical: 40,
          }}
        >
          <View
            style={{
              width: "45%",
              height: 1,
              backgroundColor: Colors.secondary,
              opacity: 0.5,
            }}
          />
          <Text style={{ fontFamily: "extraLight", fontSize: 12 }}>OR</Text>
          <View
            style={{
              width: "45%",
              height: 1,
              opacity: 0.5,
              backgroundColor: Colors.secondary,
            }}
          />
        </View>

        <View
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: 4,
          }}
        >
          <TouchableOpacity
            onPress={async () => {
              // setLoading(true);
              await handleGoogleLogin();
              // setLoading(false);
            }}
            style={{
              backgroundColor: Colors.primary,
              paddingHorizontal: 6,
              minWidth: 260,
              maxWidth: 260,
              paddingVertical: 10,
              borderRadius: 8,
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-evenly",
              alignItems: "center",
            }}
          >
            <Ionicons name="logo-google" size={18} color={Colors.bg} />
            <Text
              style={{
                textAlign: "center",
                fontFamily: "semibold",
                fontSize: 18,

                color: Colors.bg,
              }}
            >
              Login With Google
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              // setLoading(true);
              handleGuestLogin();
              // setLoading(false);
            }}
            style={{
              backgroundColor: Colors.secondary,
              paddingHorizontal: 6,
              minWidth: 260,
              paddingVertical: 10,
              borderRadius: 8,
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-evenly",
              alignItems: "center",
            }}
          >
            <AntDesign name="user" size={18} color={Colors.bg} />
            <Text
              style={{
                textAlign: "center",
                fontFamily: "semibold",
                fontSize: 18,
                color: Colors.bg,
              }}
            >
              Login as Guest
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  input: {
    fontFamily: "extraLight",
    fontSize: 16,
    height: 45,
    width: "100%",
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 12,
    maxWidth: 260,
    borderRadius: 10,
    paddingHorizontal: 8,
  },
  error: {},
});
