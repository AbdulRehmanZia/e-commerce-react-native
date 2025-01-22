// FirestoreService.js
import { db } from "@/firebase/firebase";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  setDoc,
  query,
  where,
  limit,
} from "firebase/firestore";

export const addData = async (collectionName, data) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), data);
    // //  // console.log("Document written with ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error adding document: ", error);
  }
};
export const addDataByID = async (
  collectionName,
  docId,
  data,
  update = true
) => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    // //  // console.log(update);
    if (!update && docSnap.exists()) {
      // //  // console.log("Exists");
      return null;
    }
    await setDoc(docRef, data, { merge: true });
    // await db.collection(collectionName).doc(docId).set(data);
    // //  // console.log("Document successfully written/updated with ID: ", docRef.id);
  } catch (error) {
    console.error("Error adding/updating document: ", error);
  }
};

export const getData = async (collectionName) => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const dataArray = [];

    querySnapshot.forEach((doc) => {
      dataArray.push({ id: doc.id, ...doc.data() });
    });

    return dataArray;
  } catch (error) {
    console.error("Error getting documents: ", error);
    return [];
  }
};
export const getIDData = async (collectionName, queryParams = []) => {
  try {
    let q;

    // If queryParams are provided, build the query
    if (queryParams.length > 0) {
      const conditions = queryParams.map((param) => {
        const { field, operator, value } = param;
        return where(field, operator, value);
      });
      q = query(collection(db, collectionName), ...conditions);
    } else {
      // If no queryParams, get all documents in the collection
      q = collection(db, collectionName);
    }

    const querySnapshot = await getDocs(q);
    const dataArray = [];

    querySnapshot.forEach((doc) => {
      dataArray.push(doc.id);
    });

    return dataArray;
  } catch (error) {
    console.error("Error getting documents: ", error);
    return [];
  }
};

export const queryDoc = async (collectionName, docId) => {
  // try {

  const docRef = doc(db, collectionName, docId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    // //  // console.log({ id: docSnap.id, ...docSnap.data() });
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    // //  // console.log("No such document!");
    return null;
  }
  // } catch (error) {
  //   // //  // console.log({ collectionName, docId });
  //   console.error("Error getting document:", error);
  //   return null;
  // }
};

export const deleteData = async (collection, id) => {
  try {
    await deleteDoc(doc(db, collection, id));
    // //  // console.log("Document successfully deleted!");
  } catch (error) {
    console.error("Error removing document: ", error);
  }
};
