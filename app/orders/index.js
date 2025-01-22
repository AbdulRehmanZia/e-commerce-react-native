import React, { useState, useEffect } from "react";
import { View, FlatList, TouchableOpacity, Alert } from "react-native";
import { format } from "date-fns";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import {
  Timestamp,
  arrayUnion,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { useUser } from "../../firebase/UserContext";
import { CustomText as Text } from "@/components/CustomText";
import { CheckCheck, CircleX, Clock, Truck } from "lucide-react-native";
import { useRouter } from "expo-router";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const { user, setUserData } = useUser();
  const router = useRouter();
  useEffect(() => {
    const fetchOrders = async () => {
      const fetchedOrders = await Promise.all(
        user.orders.map(async (item) => {
          return getDoc(doc(db, "orders", item)).then((s) => {
            const d = s.data();
            d.orderDate = Timestamp.fromMillis(
              d.orderDate.seconds * 1000 + d.orderDate.nanoseconds / 1e6,
            ).toDate();
            return { id: s.id, ...d };
          });
        }),
      );

      setOrders(fetchedOrders);
    };
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const renderOrderItem = ({ item }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => router.push(`orders/${item.id}`)}
        style={{
          backgroundColor: "white",
          borderRadius: 8,
          padding: 12,
          marginBottom: 10,
          flexDirection: "column",
          justifyContent: "space-between",
          borderColor: "#A9A9A9",
          borderWidth: 0.45,
          gap: 4,
        }}
      >
        <View style={{ flex: 1 }}>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              borderBottomColor: "#a9a9a9",
              borderBottomWidth: 0.5,
              borderStyle: "dashed",
              marginBottom: 6,
            }}
          >
            <Text
              style={{
                marginBottom: 10,
                fontSize: 14,
                fontFamily: "light",
                color: "#A9A9A9",
              }}
            >
              Order ID: <Text style={{ fontFamily: "medium" }}>{item.id}</Text>
            </Text>
            <Text
              style={{
                marginBottom: 5,
                fontSize: 14,
                fontFamily: "medium",
                color: "#A9A9A9",
              }}
            >
              {format(item.orderDate, "MMM dd, yyyy")}
            </Text>
          </View>
          <Text
            style={{
              marginTop: 6,
              marginBottom: 5,
              fontSize: 16,
              fontFamily: "semibold",
            }}
          >
            {item && item.prods[0].name}
          </Text>
          <Text
            style={{
              marginBottom: 5,
              fontSize: 14,
              fontFamily: "light",
              color: "#a9a9a9",
              marginBottom: 6,
            }}
          >
            Total:
            <Text style={{ color: Colors.primary, fontFamily: "semibold" }}>
              {" "}
              {item.prods[0].currency} {item.payment.total.toFixed(2)}
            </Text>
            {"  "}
            Qty:{" "}
            <Text style={{ color: Colors.primary, fontFamily: "semibold" }}>
              {item.prods.map((prod) => {
                let qty = 0;
                qty += prod.count;
                return qty;
              })}
            </Text>
          </Text>
        </View>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            // disabled={["processing", "confirmed", "pending"].includes(
            //   item.status,
            // )}
            onPress={() => router.push(`orders/${item.id}`)}
            style={{
              borderColor: Colors.primary,
              borderWidth: 0.4,
              paddingHorizontal: 18,
              paddingVertical: 8,
              borderRadius: 100,
            }}
          >
            <Text
              style={{
                color: Colors.primary,
                fontWeight: "light",
              }}
            >
              View Details
            </Text>
          </TouchableOpacity>
          <View
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              gap: 4,
            }}
          >
            {item.status === "pending" ? (
              <Clock size={20} style={{ color: "#0066FF" }} />
            ) : item.status === "confirmed" ? (
              <CheckCheck size={20} style={{ color: "#0066FF" }} />
            ) : item.status === "shipped" ? (
              <Truck size={20} style={{ color: "#0066FF" }} />
            ) : item.status === "cancelled" ? (
              <CircleX size={20} style={{ color: "#FF3333" }} />
            ) : (
              <></>
            )}
            <Text
              style={{
                fontFamily: "medium",
                color:
                  item.status === "pending"
                    ? "#0066FF"
                    : item.status === "confirmed"
                      ? "#00CC66"
                      : item.status === "cancelled"
                        ? "#FF3333"
                        : Colors.primary,
              }}
            >
              {item.status}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: Colors.bg,
        padding: 10,
      }}
    >
      <Text
        style={{
          fontSize: 22,
          fontWeight: "bold",
          marginBottom: 15,
          textAlign: "center",
        }}
      >
        My Orders
      </Text>
      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text
            style={{
              textAlign: "center",
              marginTop: 50,
              fontSize: 16,
              color: "gray",
            }}
          >
            No active orders
          </Text>
        }
      />
    </SafeAreaView>
  );
};

export default OrdersPage;
