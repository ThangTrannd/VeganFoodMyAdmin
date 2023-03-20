"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.firebaseApp = exports.firebaseAdminApp = exports.firebaseConfig = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const app_1 = require("firebase/app");
const datn_ltmt9_firebase_adminsdk_l7go0_8d735f1205_1 = require("./datn-ltmt9-firebase-adminsdk-l7go0-8d735f1205");
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
exports.firebaseConfig = {
    apiKey: "AIzaSyAlsx93lNAw1Z65Ij5FvporsUIdCb5HspI",
    authDomain: "datn-ltmt9.firebaseapp.com",
    projectId: "datn-ltmt9",
    storageBucket: "datn-ltmt9.appspot.com",
    messagingSenderId: "388744100447",
    appId: "1:388744100447:web:e75a86071a9518111d79ea",
    measurementId: "G-LT86NRRKE8",
};
exports.firebaseAdminApp = firebase_admin_1.default.initializeApp({
    credential: firebase_admin_1.default.credential.cert(datn_ltmt9_firebase_adminsdk_l7go0_8d735f1205_1.firebase_admin_config)
});
exports.firebaseApp = (0, app_1.initializeApp)(exports.firebaseConfig);
// Initialize Firebase
// export const app = initializeApp(firebaseConfig);
