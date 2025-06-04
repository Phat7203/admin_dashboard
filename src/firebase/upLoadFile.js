import { Storage} from "./firebase"
import { getDownloadURL, ref, uploadBytes } from "firebase/storage"

const uploadFileToStorage = async (image, path) => {
        try {
          const blob = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onload = function () {
              resolve(xhr.response);
            };
            xhr.onerror = function (e) {
              console.log(e);
              reject(new TypeError("Network request failed"));
            };
            xhr.responseType = "blob";
            xhr.open("GET", image, true);
            xhr.send(null);
          });
          const storageRef = ref(Storage, `${path}/image-${Date.now()}`);
          const snapshot = await uploadBytes(storageRef, blob);
          console.log("Upload successfully!");
          const url = await getDownloadURL(snapshot.ref);
          console.log("Get URL successfully");
          return url;
        } catch (error) {
          console.log(error);
        }
    };

export default uploadFileToStorage

