import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image,
  Dimensions,
  ToastAndroid,
} from "react-native";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { Link, useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";
import LOGO from "@/assets/images/logo.jpeg";
import BACKGROUND_IMAGE from "@/assets/images/login_bg.png";
import { Ionicons, AntDesign } from "@expo/vector-icons";
import { googleSignin } from "@/firebase/auth/AuthService";
import { addDataByID } from "../firebase/FirestoreService";
import { CustomText as Text } from "@/components/CustomText";
import { Dropdown } from "react-native-element-dropdown";
const { height } = Dimensions.get("window");

// const userSchema = {
//   cart: [],
//   wishlist: [],
//   history: [],
//   intrests: [],
// };
const countryData = [
  { label: "Pakistan", value: "pakistan" },
  { label: "India", value: "india" },
  { label: "Bangladesh", value: "bangladesh" },
];

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [country, setCountry] = useState(null);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignup = async () => {
    if (!email || !password || !username) {
      setError("All fields are required");
      return;
    }

    const auth = getAuth();
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: username,
      });
      await addDataByID(`users`, user.uid, {
        cart: [],
        wishlist: [],
        history: [],
        interests: [],
        country: country,
      });

      router.replace("/explore");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSignup = async () => {
    // Implement Google signup logic here
    const user = await googleSignin();
    const response = await axios.get("http://ip-api.com/json/");
    try {
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

  return (
    <ImageBackground
      source={BACKGROUND_IMAGE}
      style={{ flex: 1, height: "100%", resizeMode: "contain" }}
    >
      <View style={styles.container}>
        <View style={styles.formContainer}>
          <Image
            source={LOGO}
            style={{ width: "100%", resizeMode: "contain", height: 150 }}
          />
          {error ? (
            <Text style={{ color: "red", marginVertical: 8 }}>{error}</Text>
          ) : null}
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Dropdown
            style={styles.input}
            fontFamily="extraLight"
            containerStyle={{
              fontSize: 16,

              width: "100%",
              borderColor: "gray",
              borderWidth: 1,
              marginBottom: 12,
              maxWidth: 260,
              borderRadius: 10,
              overflow: "hidden",
              // paddingHorizontal: 8,
            }}
            placeholderStyle={{
              fontFamily: "extraLight",
              fontSize: 16,
            }}
            data={countryData}
            labelField="label"
            valueField="value"
            placeholder="Select Country"
            value={country}
            onChange={(item) => {
              setCountry(item.value);
            }}
          />

          <TouchableOpacity onPress={handleSignup} style={styles.signupButton}>
            <Text style={styles.signupButtonText}>Sign Up</Text>
          </TouchableOpacity>
          <Link href="/login" style={styles.loginLink}>
            Already have an account? Login
          </Link>
        </View>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.socialButtonsContainer}>
          <TouchableOpacity
            onPress={handleGoogleSignup}
            style={styles.googleButton}
          >
            <Ionicons name="logo-google" size={18} color={Colors.bg} />
            <Text style={styles.googleButtonText}>SignUp With Google</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
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
    height: height * 0.8,
  },
  formContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 0,
    gap: 5,
  },
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
  signupButton: {
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
  },
  signupButtonText: {
    textAlign: "center",
    fontFamily: "regular",
    fontSize: 20,
    color: Colors.primary,
  },
  loginLink: {
    fontFamily: "extraLight",
    fontSize: 15,
    marginTop: 4,
  },
  divider: {
    display: "flex",
    gap: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 40,
    width: "100%",
  },
  dividerLine: {
    width: "45%",
    height: 1,
    backgroundColor: Colors.secondary,
    opacity: 0.5,
  },
  dividerText: {
    fontFamily: "extraLight",
    fontSize: 12,
  },
  socialButtonsContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  googleButton: {
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
  },
  googleButtonText: {
    textAlign: "center",
    fontFamily: "semibold",
    fontSize: 17,
    color: Colors.bg,
  },
});
