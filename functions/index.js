const functions = require("firebase-functions");
const admin = require("firebase-admin");
const stripe = require("stripe")(functions.config().stripe.secret_key);

admin.initializeApp();

exports.createPaymentIntent = functions.https.onCall(async (data, context) => {
  // Ensure the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated to create a payment intent.",
    );
  }

  const { amount, currency } = data;

  try {
    // Get or create a customer
    let customer;
    const customerSnapshot = await admin
      .firestore()
      .collection("customers")
      .doc(context.auth.uid)
      .get();

    if (customerSnapshot.exists) {
      customer = customerSnapshot.data().stripeCustomerId;
    } else {
      const newCustomer = await stripe.customers.create({
        metadata: {
          firebaseUID: context.auth.uid,
        },
      });
      customer = newCustomer.id;
      await admin
        .firestore()
        .collection("customers")
        .doc(context.auth.uid)
        .set({
          stripeCustomerId: customer,
        });
    }

    // Create a PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      customer,
    });

    // Create an Ephemeral Key
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer },
      { apiVersion: "2020-08-27" },
    );

    return {
      clientSecret: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customer,
    };
  } catch (error) {
    console.error("Error:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});
