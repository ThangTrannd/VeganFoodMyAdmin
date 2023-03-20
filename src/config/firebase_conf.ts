// Import the functions you need from the SDKs you need
import {getAnalytics} from "firebase/analytics";
import admin from "firebase-admin";
import {initializeApp} from "firebase/app"
import {firebase_admin_config} from "./datn-ltmt9-firebase-adminsdk-l7go0-8d735f1205";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
    apiKey: "AIzaSyAlsx93lNAw1Z65Ij5FvporsUIdCb5HspI",
    authDomain: "datn-ltmt9.firebaseapp.com",
    projectId: "datn-ltmt9",
    storageBucket: "datn-ltmt9.appspot.com",
    messagingSenderId: "388744100447",
    appId: "1:388744100447:web:e75a86071a9518111d79ea",
    measurementId: "G-LT86NRRKE8",

};

export const firebaseAdminApp = admin.initializeApp({
    credential: admin.credential.cert(firebase_admin_config)
})
export const firebaseApp = initializeApp(firebaseConfig)


// Initialize Firebase
// export const app = initializeApp(firebaseConfig);
