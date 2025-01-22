import React, { useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Dimensions,
} from "react-native";
import { CustomText as Text } from "@/components/CustomText";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { useUser } from "@/firebase/UserContext";
import { doc, updateDoc } from "firebase/firestore";
import { db, auth } from "@/firebase/firebase";
import { updateProfile } from "firebase/auth";
import { ArrowLeft, Save } from "lucide-react-native";
import { useRouter } from "expo-router";

import { Dropdown } from "react-native-element-dropdown";

const { width } = Dimensions.get("window");
const countryData = [
  { label: "Pakistan", value: "pakistan" },
  { label: "India", value: "india" },
  { label: "Bangladesh", value: "bangladesh" },
];

const InputField = ({
  label,
  value,
  onChangeText,
  keyboardType = "default",
}) => {
  const [textValue, setTextValue] = useState(value);

  // Add this useEffect to sync the internal state with parent value
  useEffect(() => {
    setTextValue(value);
  }, [value]);

  return (
    <View style={{ marginBottom: 20 }}>
      <Text
        style={{
          fontFamily: "Montserrat_600SemiBold",
          fontSize: 16,
          marginBottom: 8,
          color: Colors.primary,
        }}
      >
        {label}
      </Text>
      <TextInput
        value={textValue}
        onChangeText={setTextValue}
        style={{
          borderWidth: 1,
          borderColor: Colors.secondary,
          borderRadius: 8,
          padding: 12,
          fontSize: 16,
          fontFamily: "Montserrat_400Regular",
          backgroundColor: Colors.bg,
        }}
        onEndEditing={() => {
          onChangeText(textValue);
        }}
        keyboardType={keyboardType}
      />
    </View>
  );
};

export default function EditProfilePage() {
  const { user } = useUser();
  const router = useRouter();

  const [formData, setFormData] = useState({
    address: user?.address || "",
    city: user?.city || "",
    country: user?.country || "",
    currency: user?.currency || "PKR",
    phoneNumber: user?.phoneNumber?.toString() || "",
  });
  useEffect(() => {
    if (user) {
      setFormData({
        address: user?.address || "",
        city: user?.city || "",
        country: user?.country || "",
        currency: user?.currency || "PKR",
        phoneNumber: user?.phoneNumber?.toString() || "",
      });
    }
  }, [user]);

  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      // Validate form data
      if (
        !formData.address ||
        !formData.city ||
        !formData.country ||
        !formData.phoneNumber
      ) {
        Alert.alert("Error", "All fields are required");
        return;
      }
      // Update Firestore document
      await updateDoc(doc(db, "users", user.uid), {
        address: formData.address,
        city: formData.city,
        country: formData.country,
        currency: formData.currency.toLowerCase(),
        phoneNumber: parseInt(formData.phoneNumber),
      });

      // Update auth profile if needed
      await updateProfile(auth.currentUser, {
        phoneNumber: formData.phoneNumber,
      });

      Alert.alert("Success", "Profile updated successfully");
      router.back();
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: Colors.secondary,
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text
          style={{
            marginLeft: 16,
            fontSize: 20,
            fontFamily: "Montserrat_700Bold",
          }}
        >
          Edit Profile
        </Text>
      </View>

      <ScrollView style={{ padding: 16 }}>
        <InputField
          label="Address"
          value={formData.address}
          onChangeText={(text) => setFormData({ ...formData, address: text })}
        />

        <InputField
          label="City"
          value={formData.city}
          onChangeText={(text) => setFormData({ ...formData, city: text })}
        />

        {/* <InputField
          label="Country"
          value={formData.country}
          onChangeText={(text) => setFormData({ ...formData, country: text })}
        /> */}

        <Dropdown
          style={{
            fontFamily: "extraLight",
            fontSize: 16,
            height: 45,
            width: "100%",
            borderColor: Colors.secondary,
            borderWidth: 1,
            marginBottom: 12,
            // maxWidth: 260,
            borderRadius: 10,
            paddingHorizontal: 8,
          }}
          fontFamily="extraLight"
          containerStyle={{
            fontSize: 16,

            width: "100%",
            borderColor: Colors.secondary,
            borderWidth: 1,
            marginBottom: 12,
            maxWidth: width - 30,

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
          value={formData.country}
          onChange={(item) => {
            setFormData({ ...formData, country: item.value });
          }}
        />
        <InputField
          label="Currency"
          value={formData.currency}
          onChangeText={(text) => setFormData({ ...formData, currency: text })}
        />

        <InputField
          label="Phone Number"
          value={formData.phoneNumber}
          onChangeText={(text) =>
            setFormData({ ...formData, phoneNumber: text })
          }
          keyboardType="phone-pad"
        />
      </ScrollView>

      <View style={{ padding: 16 }}>
        <TouchableOpacity
          style={{
            backgroundColor: loading ? Colors.secondary : Colors.primary,
            padding: 16,
            borderRadius: 8,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={handleUpdate}
          disabled={loading}
        >
          <Save size={20} color={Colors.bg} style={{ marginRight: 8 }} />
          <Text
            style={{
              color: Colors.bg,
              fontSize: 16,
              fontFamily: "Montserrat_600SemiBold",
            }}
          >
            {loading ? "Updating..." : "Save Changes"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
