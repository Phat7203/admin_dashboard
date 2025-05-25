import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCPw4_SZc0gdWPxTpApjid0SrbbdRFnsRA",
  authDomain: "shoppingapp-a20a4.firebaseapp.com",
  projectId: "shoppingapp-a20a4",
  storageBucket: "shoppingapp-a20a4.appspot.com",
  messagingSenderId: "290796953622",
  appId: "1:290796953622:web:19baaa4f754afa99a6d537",
  measurementId: "G-GS65ZJ605C",
  databaseURL: "https://shoppingapp-a20a4-default-rtdb.asia-southeast1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };