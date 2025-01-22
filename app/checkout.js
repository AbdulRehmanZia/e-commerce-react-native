import React, { useEffect, useState } from "react";
import { Colors } from "@/constants/Colors";
import {
  View,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { CustomText as Text } from "@/components/CustomText";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "@/firebase/UserContext";
import { Pencil, CreditCard, Truck } from "lucide-react-native";
import { updateProfile } from "firebase/auth";
import { updateDoc, doc, Timestamp, arrayUnion } from "firebase/firestore";
import { db, auth } from "@/firebase/firebase";
import { useLocalSearchParams, useRouter } from "expo-router";
import fetchProductData from "@/helpers/product";
import { addData } from "@/firebase/FirestoreService";
import { useStripe } from "@stripe/stripe-react-native";
import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase/firebase";

const CheckoutItemTile = ({ item }) => {
  // const router = useRouter();
  // console.log(item);
  if (item) {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        // onPress={() => {
        //   router.push(`/product/${item.id}`);
        // }}
        style={{
          flexDirection: "row",
          padding: 8,
          borderWidth: 1,
          borderColor: Colors.primary,
          borderRadius: 8,
          marginBottom: 12,
        }}
      >
        <View
          style={{
            backgroundColor: Colors.primary,
            height: 200,
            borderRadius: 8,
            flex: 0.5,
          }}
        >
          <Image
            style={{
              objectFit: "cover",
              height: "100%",
              borderRadius: 8,
            }}
            source={{ uri: item.imageUrls[0] }}
          />
        </View>

        <View
          style={{ flex: 0.7, marginLeft: 12, justifyContent: "space-between" }}
        >
          <View>
            <Text
              style={{
                fontFamily: "Montserrat_700Bold",
                fontSize: 16,
                marginBottom: 4,
              }}
              numberOfLines={2}
            >
              {item.name}
            </Text>
            <Text
              style={{
                fontFamily: "Montserrat_400Regular",
                fontSize: 14,
                marginBottom: 4,
              }}
            >
              {item.brand}
            </Text>
          </View>

          <View>
            {item.variants &&
              Object.entries(item.variants).map(([key, value]) => (
                <Text
                  key={key}
                  style={{
                    fontFamily: "Montserrat_200ExtraLight",
                    fontSize: 12,
                    marginBottom: 2,
                  }}
                >
                  {key}: {value}
                </Text>
              ))}
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <Text style={{ fontFamily: "Montserrat_400Regular", fontSize: 14 }}>
              Quantity: {item.count}
            </Text>
            <Text
              style={{
                fontFamily: "Montserrat_600SemiBold",
                fontSize: 14,
                textAlign: "right",
              }}
            >
              {item.currency} {(item.price * item.count).toFixed(2)} {"\n"}{" "}
              shipping {item.currency} {item.shipping_cost}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
};

const ShippingAddressComponent = ({ initialData, onUpdate }) => {
  const [userData, setUserData] = useState(initialData);
  const [isModalVisible, setModalVisible] = useState(false);
  const [editedData, setEditedData] = useState(initialData);
  useEffect(() => {
    if (
      !initialData.displayName ||
      !initialData.address ||
      !initialData.phoneNumber ||
      !initialData.city ||
      !initialData.country
    ) {
      setModalVisible(true);
    }
  }, []);

  const handleEdit = () => {
    setEditedData(userData);
    setModalVisible(true);
  };

  const handleSave = () => {
    if (
      editedData.displayName &&
      editedData.address &&
      editedData.phoneNumber &&
      editedData.city &&
      editedData.country
    ) {
      setUserData(editedData);
      onUpdate(editedData);
      setModalVisible(false);
    } else {
      alert("Please fill in all fields");
    }
  };

  return (
    <View
      style={{
        backgroundColor: Colors.bg,
        padding: 20,
        borderRadius: 10,
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <View style={{ marginBottom: 15 }}>
        <Text
          style={{
            fontSize: 18,
            fontFamily: "Montserrat_700Bold",
            marginBottom: 10,
          }}
        >
          Shipping Address
        </Text>
        <Text style={{ fontSize: 16, marginBottom: 5 }}>
          {userData.displayName || "Name not provided"}
        </Text>
        <Text style={{ fontSize: 16, marginBottom: 5 }}>
          {userData.address || "Address not provided"}
        </Text>
        <Text style={{ fontSize: 16, marginBottom: 5 }}>
          {userData.phoneNumber || "Phone number not provided"}
        </Text>

        <Text style={{ fontSize: 16, marginBottom: 5 }}>
          {userData.city || "City not provided"}
        </Text>

        <Text style={{ fontSize: 16, marginBottom: 5 }}>
          {userData.country || "Country not provided"}
        </Text>
      </View>
      <TouchableOpacity
        style={{
          backgroundColor: Colors.primary,
          padding: 10,
          borderRadius: 99,
          alignItems: "center",
        }}
        onPress={handleEdit}
      >
        <Pencil size={24} fill={Colors.bg} />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <View
            style={{
              backgroundColor: Colors.bg,
              padding: 20,
              borderRadius: 10,
              width: "80%",
            }}
          >
            <Text
              style={{ fontSize: 18, fontWeight: "bold", marginBottom: 15 }}
            >
              Edit Shipping Address
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: Colors.secondary,
                borderRadius: 5,
                padding: 10,
                marginBottom: 10,
              }}
              value={editedData.displayName}
              onChangeText={(text) =>
                setEditedData({ ...editedData, displayName: text })
              }
              placeholder="Name"
            />
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: Colors.secondary,
                borderRadius: 5,
                padding: 10,
                marginBottom: 10,
              }}
              value={editedData.address}
              onChangeText={(text) =>
                setEditedData({ ...editedData, address: text })
              }
              placeholder="Address"
              multiline
            />

            <TextInput
              style={{
                borderWidth: 1,
                borderColor: Colors.secondary,
                borderRadius: 5,
                padding: 10,
                marginBottom: 10,
              }}
              value={editedData.city}
              onChangeText={(text) =>
                setEditedData({ ...editedData, city: text })
              }
              placeholder="City"
            />

            <TextInput
              style={{
                borderWidth: 1,
                borderColor: Colors.secondary,
                borderRadius: 5,
                padding: 10,
                marginBottom: 10,
              }}
              value={editedData.country}
              onChangeText={(text) =>
                setEditedData({ ...editedData, country: text })
              }
              placeholder="Country"
            />
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: Colors.secondary,
                borderRadius: 5,
                padding: 10,
                marginBottom: 10,
              }}
              value={`${editedData.phoneNumber}`}
              onChangeText={(text) =>
                setEditedData({ ...editedData, phoneNumber: text })
              }
              placeholder="Phone Number"
              keyboardType="phone-pad"
            />
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 15,
              }}
            >
              <TouchableOpacity
                style={{
                  padding: 10,
                  borderRadius: 5,
                  width: "45%",
                  alignItems: "center",
                }}
                onPress={() => setModalVisible(false)}
                disabled={
                  !userData.displayName ||
                  !userData.address ||
                  !userData.phoneNumber
                }
              >
                <Text
                  style={{
                    color:
                      !userData.displayName ||
                      !userData.address ||
                      !userData.phoneNumber
                        ? Colors.secondary
                        : Colors.primary,
                    fontSize: 16,
                    fontWeight: "bold",
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  padding: 10,
                  borderRadius: 5,
                  width: "45%",
                  alignItems: "center",
                  backgroundColor: Colors.primary,
                }}
                onPress={handleSave}
              >
                <Text
                  style={{ color: Colors.bg, fontSize: 16, fontWeight: "bold" }}
                >
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const SellerGroup = ({ sellerName, items, total }) => {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text
        style={{
          fontFamily: "Montserrat_700Bold",
          fontSize: 18,
          marginBottom: 10,
        }}
      >
        {sellerName}
      </Text>
      {items.map((item, index) => (
        <CheckoutItemTile item={item} key={index} />
      ))}
      <Text
        style={{
          fontFamily: "Montserrat_600SemiBold",
          fontSize: 16,
          textAlign: "right",
          marginTop: 10,
        }}
      >
        Subtotal: {items[0].currency} {total.toFixed(2)}
      </Text>
    </View>
  );
};

const PaymentSelectionModal = ({
  visible,
  onClose,
  onSelectPayment,
  loading,
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
      >
        <View
          style={{
            backgroundColor: Colors.bg,
            padding: 20,
            borderRadius: 10,
            width: "80%",
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontFamily: "Montserrat_700Bold",
              marginBottom: 20,
            }}
          >
            Select Payment Method
          </Text>

          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 15,
              borderWidth: 1,
              borderColor: Colors.primary,
              borderRadius: 8,
              marginBottom: 10,
            }}
            onPress={() => onSelectPayment("COD")}
            disabled={loading}
          >
            <Truck size={24} color={Colors.primary} />
            <Text
              style={{
                marginLeft: 10,
                fontSize: 16,
                fontFamily: "Montserrat_600SemiBold",
              }}
            >
              Cash on Delivery
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 15,
              borderWidth: 1,
              borderColor: Colors.primary,
              borderRadius: 8,
            }}
            onPress={() => onSelectPayment("CARD")}
            disabled={loading}
          >
            <CreditCard size={24} color={Colors.primary} />
            <Text
              style={{
                marginLeft: 10,
                fontSize: 16,
                fontFamily: "Montserrat_600SemiBold",
              }}
            >
              Pay with Card
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default function CheckoutPage() {
  const { user } = useUser();
  const [groupedItems, setGroupedItems] = useState({});
  const [totalCost, setTotalCost] = useState(0);
  const [loading, setLoading] = useState(true);
  const { data } = useLocalSearchParams();
  const [shippingData, setShippingData] = useState();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const router = useRouter();
  const [paymentSheetEnabled, setPaymentSheetEnabled] = useState(false);
  const [selectedPaymentType, setSelectedPaymentType] = useState(null);

  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  const tid = `TRX${timestamp}${random}`;

  const handlePayment = async () => {
    if (!selectedPaymentType) {
      Alert.alert("Payment Method Required", "Please select a payment method.");
      return;
    }

    if (selectedPaymentType === "CARD") {
      await openPaymentSheet();
    } else {
      await checkOutCOD();
    }
  };

  useEffect(() => {
    async function fetchAndProcessData() {
      if (data) {
        const parsedData = JSON.parse(data);
        const grouped = {};
        let total = 0;

        for (const item of parsedData) {
          const productData = await fetchProductData(item.id);
          const fullItem = {
            ...productData,
            ...item,
            price: productData.price,
          };

          if (!grouped[fullItem.seller]) {
            grouped[fullItem.seller] = {
              items: [],
              total: 0,
              cost: 0,
              shipping: 0,
              cut: 0,
            };
          }
          grouped[fullItem.seller].items.push(fullItem);
          const itemTotal =
            fullItem.price * fullItem.count + fullItem.shipping_cost;
          const delivery = fullItem.shipping_cost;
          const cost = fullItem.price * fullItem.count;
          grouped[fullItem.seller].total += itemTotal;
          grouped[fullItem.seller].cost += cost;
          grouped[fullItem.seller].shipping += delivery;
          total += itemTotal;
        }
        // console.log(grouped);

        setGroupedItems(grouped);
        setTotalCost(total);
        setLoading(false);
      }
    }

    fetchAndProcessData();
  }, [data]);

  useEffect(() => {
    if (user) {
      setShippingData({
        city: user.city,
        country: user.country,
        address: user.address,
      });
    }
  }, [user]);

  useEffect(() => {
    if (!loading) {
      initializePaymentSheet();
    }
  }, [loading]);

  const initializePaymentSheet = async () => {
    try {
      const createPaymentIntent = httpsCallable(
        functions,
        "createPaymentIntent"
      );
      const response = await createPaymentIntent({
        amount: Math.round(totalCost * 100), // Convert to cents and ensure it's an integer
        currency: user.currency, // or your preferred currency
      });

      const { clientSecret, ephemeralKey, customer } = response.data;

      const { error } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        customerEphemeralKeySecret: ephemeralKey,
        customerId: customer,
        merchantDisplayName: "Sahyan Shopping",
      });

      if (error) {
        console.error("Error initializing payment sheet1:", error);
      } else {
        setPaymentSheetEnabled(true);
      }
    } catch (error) {
      console.error("Error initializing payment sheet:", error);
    }
  };

  const openPaymentSheet = async () => {
    if (!paymentSheetEnabled) {
      Alert.alert(
        "Payment not ready",
        "Please wait while we set up your payment."
      );
      return;
    }

    try {
      const { error } = await presentPaymentSheet();

      if (error) {
        Alert.alert(`Error code: ${error.code}`, error.message);
        return;
      }

      // Payment successful, now process the order
      await checkOutCard();
      Alert.alert("Success", "Your payment is confirmed!");
      router.replace("/");
    } catch (error) {
      console.error("Payment processing error:", error);
      Alert.alert("Error", "There was a problem processing your payment.");
    }
  };

  async function checkOutCard() {
    setPaymentSheetEnabled(true);
    // Process each seller's group of items
    await Promise.all(
      Object.entries(groupedItems).map(async (item) => {
        const orderData = {
          customer: {
            email: user.email,
            name: user.displayName,
            phone: user.phoneNumber,
          },
          orderDate: Timestamp.now(),
          prods: item[1].items,
          shippingAddress: shippingData,
          status: "confirmed",
          timeline: [
            {
              status: "confirmed",
              tagLine: "Payment has been verified and order is confirmed",
              time: Timestamp.now(),
            },

            {
              status: "pending",
              tagLine: "Waiting for payment approval",
              time: Timestamp.now(),
            },
          ],
          payment: {
            transactionId: tid,
            cut: item[1].total * 0.03,
            amount: item[1].cost,
            shipping: item[1].shipping,
            total: item[1].total,
            type: selectedPaymentType,
            status: "paid",
          },
        };

        try {
          // Add order to orders collection
          const orderId = await addData("orders", orderData);

          // Update seller's orders array
          await updateDoc(doc(db, "seller", item[1].items[0].sellerId), {
            orders: arrayUnion(orderId),
          });

          // Update user's orders array
          await updateDoc(doc(db, "users", user.uid), {
            orders: arrayUnion(orderId),
          });
        } catch (error) {
          console.error("Error processing order:", error);
          throw error; // Rethrow to be caught by the parent try-catch
        }
      })
    ).then(async () => {
      // Clear the user's cart after successful payment and order processing
      await updateDoc(doc(db, "users", user.uid), { cart: [] });
    });
  }
  async function checkOutCOD() {
    setPaymentSheetEnabled(true);
    Object.entries(groupedItems).map(async (item) => {
      // console.log(item);
      orderData = {
        customer: {
          email: user.email,
          name: user.displayName,
          phone: user.phoneNumber,
        },
        orderDate: Timestamp.now(),
        prods: item[1].items,
        shippingAddress: shippingData,
        status: "confirmed",
        timeline: [
          {
            status: "confirmed",
            tagLine: "Payment has been verified and order is confirmed",
            time: Timestamp.now(),
          },

          {
            status: "pending",
            tagLine: "Waiting for payment approval",
            time: Timestamp.now(),
          },
        ],
        payment: {
          transactionId: tid,
          cut: item[1].total * 0.03,
          amount: item[1].cost,
          shipping: item[1].shipping,
          total: item[1].total,
          type: selectedPaymentType,
        },
      };

      const orderId = await addData("orders", orderData);
      await updateDoc(doc(db, "seller", item[1].items[0].sellerId), {
        orders: arrayUnion(orderId),
      });
      await updateDoc(doc(db, "users", user.uid), {
        orders: arrayUnion(orderId),
      });
    });
    await updateDoc(doc(db, "users", user.uid), { cart: [] });
    router.replace("/");
  }

  if (loading || !user) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: Colors.bg,
        paddingHorizontal: 6,
        paddingTop: 20,
      }}
    >
      <ScrollView>
        <ShippingAddressComponent
          initialData={user}
          onUpdate={(data) => {
            setShippingData(data);
            updateProfile(auth.currentUser, {
              displayName: data.displayName,
              phoneNumber: data.phoneNumber,
            })
              .then(async () => {
                await updateDoc(doc(db, "users", user.uid), {
                  address: data.address,
                  phoneNumber: parseInt(data.phoneNumber),
                  city: data.city,
                  country: data.country,
                });
              })
              .catch((error) => {
                console.error(error);
              });
          }}
        />

        {Object.entries(groupedItems).map(([seller, { items, total }]) => (
          <SellerGroup
            key={seller}
            sellerName={seller}
            items={items}
            total={total}
          />
        ))}

        <View style={{ padding: 20, marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 18,
              fontFamily: "Montserrat_700Bold",
              marginBottom: 15,
            }}
          >
            Select Payment Method
          </Text>

          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 15,
              borderWidth: 1,
              borderColor:
                selectedPaymentType === "COD"
                  ? Colors.primary
                  : Colors.secondary,
              borderRadius: 8,
              marginBottom: 10,
              backgroundColor:
                selectedPaymentType === "COD"
                  ? `${Colors.primary}20`
                  : Colors.bg,
            }}
            onPress={() => setSelectedPaymentType("COD")}
            disabled={loading}
          >
            <Truck size={24} color={Colors.primary} />
            <Text
              style={{
                marginLeft: 10,
                fontSize: 16,
                fontFamily: "Montserrat_600SemiBold",
              }}
            >
              Cash on Delivery
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 15,
              borderWidth: 1,
              borderColor:
                selectedPaymentType === "CARD"
                  ? Colors.primary
                  : Colors.secondary,
              borderRadius: 8,
              backgroundColor:
                selectedPaymentType === "CARD"
                  ? `${Colors.primary}20`
                  : Colors.bg,
            }}
            onPress={() => setSelectedPaymentType("CARD")}
            disabled={loading}
          >
            <CreditCard size={24} color={Colors.primary} />
            <Text
              style={{
                marginLeft: 10,
                fontSize: 16,
                fontFamily: "Montserrat_600SemiBold",
              }}
            >
              Pay with Card
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View
        style={{
          backgroundColor: Colors.bg,
          padding: 20,
          borderTopWidth: 1,
          borderTopColor: Colors.primary,
        }}
      >
        <Text
          style={{
            fontFamily: "bold",
            fontSize: 20,
            textAlign: "right",
          }}
        >
          Total: {user.currency} {totalCost.toFixed(2)}
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: selectedPaymentType
              ? Colors.primary
              : Colors.secondary,
            padding: 15,
            borderRadius: 8,
            alignItems: "center",
            marginTop: 10,
          }}
          onPress={handlePayment}
          disabled={!selectedPaymentType}
        >
          <Text
            style={{
              color: Colors.bg,
              fontFamily: "Montserrat_600SemiBold",
              fontSize: 16,
            }}
          >
            {selectedPaymentType === "CARD" ? "Pay Now" : "Place Order"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
