// StorageService.js
import { storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const uploadFile = async (file, savePath) => {
  const storageRef = ref(storage, `${savePath}`);
  try {
    // console.log(file);
    await uploadBytes(storageRef, file);

    const url = await getDownloadURL(storageRef);
    return url;
  } catch (error) {
    console.error("Error uploading file: ", error);
  }
};

export const getFileUrl = async (path) => {
  try {
    const fileRef = ref(storage, path);
    const url = await getDownloadURL(fileRef);
    // console.log("File URL: ", url);
    return url;
  } catch (error) {
    console.error("Error getting file URL: ", error);
  }
};

export const deleteFile = async (path) => {
  try {
    const fileRef = ref(storage, path);
    await deleteObject(fileRef);
    // //  // console.log("File successfully deleted!");
  } catch (error) {
    console.error("Error deleting file: ", error);
  }
};
