import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Pressable,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import {
  Timestamp,
  getDoc,
  doc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import {
  Banknote,
  Package,
  PackageCheck,
  XSquare,
  Truck,
  Clock,
  Star,
} from "lucide-react-native";
import { useLocalSearchParams } from "expo-router";
import Loading from "@/components/Loading";
import { db } from "../../firebase/firebase";

import { Colors } from "@/constants/Colors";
async function getOrderDetails(id) {
  try {
    const orderSnap = await getDoc(doc(db, "orders", id));

    if (!orderSnap.exists()) {
      console.error("Order document does not exist");
      return null;
    }
    const orderData = orderSnap.data();
    return {
      id: orderSnap.id,
      ...orderData,
    };
  } catch (error) {
    console.error("Error getting order details:", error);
    return null;
  }
}

const OrderDetailsScreen = () => {
  const { id } = useLocalSearchParams();
  const [order, setOrder] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  useEffect(() => {
    async function getData() {
      getOrderDetails(id).then((data) => {
        // console.log(data);
        setOrder(data);
      });
    }
    if (id) {
      getData(id);
    }
  }, [id]);

  const handleCancelOrder = () => {
    Alert.alert("Cancel Order", "Are you sure you want to cancel this order?", [
      {
        text: "No",
        style: "cancel",
      },
      {
        text: "Yes",
        onPress: async () => {
          setOrder(null);
          const updatedOrders = {
            ...order,
            status: "cancelled",
            timeline: [
              ...order.timeline,
              {
                status: "cancelled",
                tagLine: "The order has been cancelled by customer",
                time: Timestamp.now(),
              },
            ],
          };

          await updateDoc(doc(db, "orders", order.id), {
            status: "cancelled",
            timeline: arrayUnion({
              status: "cancelled",
              tagLine: "The order has been cancelled by customer",
              time: Timestamp.now(),
            }),
          });
          setOrder(updatedOrders);
        },
      },
    ]);
  };

  const handleSubmitReview = async () => {
    try {
      const reviewData = {
        rating,
        comment: reviewText,
        // userId: order.customer.id,
        userName: order.customer.name,
        date: Timestamp.now(),
      };

      // Update the order with review information
      const updatedOrder = {
        ...order,
        reviewed: true,
        review: reviewData,
        timeline: [
          ...order.timeline,
          {
            status: "reviewed",
            tagLine: "Customer has submitted a review",
            time: Timestamp.now(),
          },
        ],
      };

      // Update order document
      await updateDoc(doc(db, "orders", order.id), {
        reviewed: true,
        review: reviewData,
        timeline: arrayUnion({
          status: "reviewed",
          tagLine: "Customer has submitted a review",
          time: Timestamp.now(),
        }),
      });

      // Update each product with the review
      for (const product of order.prods) {
        // console.log(product);
        const productRef = doc(db, "products", product.id);
        const d = await updateDoc(productRef, {
          reviews: arrayUnion({
            ...reviewData,
            orderId: order.id,
          }),
        });
        // console.log(d);
      }

      setOrder(updatedOrder);
      setShowReviewModal(false);
      Alert.alert("Success", "Thank you for your review!");
    } catch (error) {
      console.error("Error submitting review:", error);
      Alert.alert("Error", "Failed to submit review. Please try again.");
    }
  };

  const formatDate = (timestamp) => {
    return new Timestamp(timestamp.seconds, timestamp.nanoseconds)
      .toDate()
      .toLocaleString("en-us", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmed":
        return <Banknote color="white" size={24} />;
      case "processing":
        return <Package color="white" size={24} />;
      case "shipped":
        return <Truck color="white" size={24} />;
      case "delivered":
        return <PackageCheck color="white" size={24} />;
      case "cancelled":
        return <XSquare color="white" size={24} />;
      case "pending":
        return <Clock color="white" size={24} />;
      case "reviewed":
        return <Star color="white" size={24} />;
      default:
        return null;
    }
  };

  const renderActionButton = () => {
    if (
      (order.status === "delivered" || order.status === "finished") &&
      !order.reviewed
    ) {
      return (
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: Colors.primary }]}
          onPress={() => setShowReviewModal(true)}
        >
          <Text style={styles.actionButtonText}>Write Review</Text>
        </TouchableOpacity>
      );
    } else if (order.reviewed) {
      return (
        <View
          style={[styles.actionButton, { backgroundColor: Colors.secondary }]}
        >
          <Text style={styles.actionButtonText}>Review Submitted</Text>
        </View>
      );
    } else {
      return (
        <TouchableOpacity
          disabled={
            !["processing", "confirmed", "pending"].includes(order.status)
          }
          style={{
            backgroundColor: ["processing", "confirmed", "pending"].includes(
              order.status
            )
              ? "#ff4444"
              : "gray",
            padding: 12,
            borderRadius: 8,
            marginTop: 12,
            alignItems: "center",
          }}
          onPress={() => {
            // Handle cancel logic here
            handleCancelOrder();
          }}
        >
          <Text style={styles.cancelButtonText}>
            {order.status === "cancelled"
              ? "Cancelled"
              : ["processing", "confirmed", "pending"].includes(order.status)
              ? "Cancel Order"
              : "Cannot Cancel"}
          </Text>
        </TouchableOpacity>
      );
    }
  };
  if (order === null) {
    return <Loading />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Order Overview</Text>
        <Text style={styles.orderId}>{order.id}</Text>
        <Text style={styles.orderDate}>{formatDate(order.orderDate)}</Text>
        {renderActionButton()}
      </View>
      {/* Products Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Products</Text>
        {order.prods.map((item, index) => (
          <Pressable
            key={index}
            style={styles.productCard}
            onPress={() => {
              /* Handle navigation */
            }}
          >
            <Image
              source={{ uri: item.imageUrls[0] }}
              style={styles.productImage}
            />
            <View style={styles.productDetails}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productDescription} numberOfLines={2}>
                {item.shortDescription}
              </Text>
              {item.varaints &&
                Object.entries(item.varaints).map(([key, value]) => (
                  <Text key={key} style={styles.variantText}>
                    • {key}: {value}
                  </Text>
                ))}
              <View style={styles.quantityPrice}>
                <Text>Quantity: {item.count}</Text>
                <Text>Price: {item.price}</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </View>
      {/* Timeline Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Timeline</Text>
        <Text style={styles.sectionSubtitle}>Track order logs</Text>
        {order.timeline.map((item, index) => (
          <View key={index} style={styles.timelineItem}>
            <View style={styles.iconContainer}>
              {getStatusIcon(item.status)}
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineStatus}>{item.status}</Text>
              <Text style={styles.timelineTagline}>{item.tagLine}</Text>
              <Text style={styles.timelineDate}>{formatDate(item.time)}</Text>
            </View>
          </View>
        ))}
      </View>
      {/* Payment Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment</Text>
        <View style={styles.paymentCard}>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Type</Text>
            <Text style={styles.paymentValue}>{order.payment.type}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Transaction ID</Text>
            <Text style={styles.paymentValue}>
              {order.payment.transactionId}
            </Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Cost</Text>
            <Text style={styles.paymentValue}>{order.payment.amount}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Shipping Cost</Text>
            <Text style={styles.paymentValue}>{order.payment.shipping}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Discount</Text>
            <Text style={styles.paymentValue}>0</Text>
          </View>
          <View style={[styles.paymentRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{order.payment.total} PKR</Text>
          </View>
        </View>
      </View>
      {/* Customer Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Customer Details</Text>
        <View style={styles.customerCard}>
          <Text style={styles.customerSectionTitle}>Contact Info</Text>
          <View style={styles.customerInfo}>
            <Text style={styles.customerText}>Name: {order.customer.name}</Text>
            <Text style={styles.customerText}>
              Email: {order.customer.email}
            </Text>
            <Text style={styles.customerText}>
              Contact No.: {order.customer.phone}
            </Text>
          </View>
        </View>

        <View style={styles.customerCard}>
          <Text style={styles.customerSectionTitle}>Shipping Address</Text>
          <View style={styles.customerInfo}>
            <Text style={styles.customerText}>
              Street: {order.shippingAddress.address}
            </Text>
            <Text style={styles.customerText}>
              City: {order.shippingAddress.city}
            </Text>
            <Text style={styles.customerText}>
              Country: {order.shippingAddress.country}
            </Text>
          </View>
        </View>
      </View>
      <Modal
        visible={showReviewModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowReviewModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Write Your Review</Text>

            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Star
                    size={32}
                    color={star <= rating ? Colors.primary : "#D3D3D3"}
                    fill={star <= rating ? Colors.primary : "none"}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.reviewInput}
              multiline
              numberOfLines={4}
              placeholder="Write your review here..."
              value={reviewText}
              onChangeText={setReviewText}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#888" }]}
                onPress={() => setShowReviewModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: Colors.secondary },
                ]}
                onPress={handleSubmitReview}
              >
                <Text style={styles.modalButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 15,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  orderId: {
    fontSize: 16,
    marginTop: 8,
  },
  orderDate: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  cancelButton: {
    backgroundColor: "#ff4444",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  productCard: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    marginBottom: 12,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  productDetails: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
  },
  productDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  variantText: {
    fontSize: 14,
    color: "#444",
    marginTop: 2,
  },
  quantityPrice: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  timelineItem: {
    flexDirection: "row",
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: Colors.secondary,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  timelineContent: {
    flex: 1,
    marginLeft: 12,
  },
  timelineStatus: {
    fontSize: 16,
    fontWeight: "600",
  },
  timelineTagline: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  timelineDate: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },
  paymentCard: {
    backgroundColor: "#f8f8f8",
    padding: 16,
    borderRadius: 8,
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  paymentLabel: {
    fontSize: 14,
    color: "#666",
  },
  paymentValue: {
    fontSize: 14,
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  customerCard: {
    backgroundColor: "#f8f8f8",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  customerSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  customerInfo: {
    marginLeft: 12,
  },
  customerText: {
    fontSize: 14,
    color: "#444",
    marginBottom: 4,
  },

  actionButton: {
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    alignItems: "center",
  },
  actionButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  ratingContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
    gap: 8,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    textAlignVertical: "top",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default OrderDetailsScreen;
