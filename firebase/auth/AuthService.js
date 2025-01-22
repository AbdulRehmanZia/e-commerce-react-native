// AuthService.js
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInAnonymously,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

GoogleSignin.configure({
  webClientId:
    "234287144943-kf0979nu4qlssdtvb9u0ag6kstnufv7o.apps.googleusercontent.com",
  offlineAccess: true,
});
export const signUp = async (email, password) => {
  try {
    await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error("Error signing up:", error);
  }
};

export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error) {
    console.error("Error logging in:", error);
    return error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    await GoogleSignin.revokeAccess();
  } catch (error) {
    // //  // console.log("Error logging out:", error);
  }
};

export const googleSignin = async () => {
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    // Get the user's ID token
    const { idToken } = await GoogleSignin.signIn({
      prompt: "select_account",
    });

    // Create a Google credential with the token
    const googleCredential = GoogleAuthProvider.credential(idToken);

    const userCredential = await signInWithCredential(auth, googleCredential);

    // Extract the user information
    const user = userCredential.user;

    // //  // console.log("User UID:", user.uid);

    return user.uid;
  } catch (error) {
    console.error("Error during Google sign-in:", error);
    return error;
  }
};

export const guestLogin = async () => {
  try {
    const userCredential = await signInAnonymously(auth);
    const user = userCredential.user;

    // Update the display name
    await updateProfile(user, {
      displayName: user.uid,
    });
    return user;
  } catch (error) {
    console.error("Error logging in:", error);
  }
};
