"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotificationForAllUser = exports.sendNotification = exports.notificationRoute = void 0;
const FCM = require("fcm-node");
const dotenv_1 = __importDefault(require("dotenv"));
const pg_1 = require("pg");
const posgre_1 = require("../config/posgre");
const Notification_1 = require("../postgre/Notification");
const storage_1 = require("firebase/storage");
dotenv_1.default.config({
    path: "process.env"
});
function notificationRoute(app, upload) {
    app.get("/notification", (req, res) => {
        (0, Notification_1.getAllNotifications)().then(r => {
            console.log(r.result);
            res.render("notification", { notifications: r.result });
        });
    });
    app.post("/notification/add", upload.single("image"), (req, res) => {
        if (!req.file) {
            res.end("Bạn chưa chọn file");
        }
        const { title, message, type } = req.body;
        console.log(req.body);
        const storage = (0, storage_1.getStorage)();
        const metadata = {
            contentType: "image/jpeg"
        };
        const fileName = encodeURIComponent(req.file.originalname);
        const storageRef = (0, storage_1.ref)(storage, "/images" + fileName);
        const uploadTask = (0, storage_1.uploadBytesResumable)(storageRef, req.file.buffer, metadata);
        uploadTask.on("state_changed", (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
            switch (snapshot.state) {
                case 'paused':
                    console.log('Upload is paused');
                    break;
                case 'running':
                    console.log('Upload is running');
                    break;
            }
        }, (error) => {
            console.log(error);
        }, () => {
            (0, storage_1.getDownloadURL)(uploadTask.snapshot.ref).then(r => {
                (0, Notification_1.addNotification)(title, message, type, r).then(() => {
                    sendNotificationForAllUser(title, message);
                    res.redirect("/notification");
                });
            });
        });
    });
    app.post("/notification/delete", (req, res) => {
        (0, Notification_1.deleteNotification)(req.body.id).then(r => {
            res.redirect("/notification");
        });
    });
}
exports.notificationRoute = notificationRoute;
async function sendNotification(title, message, token_device) {
    let fcm = new FCM(process.env.FCM_SERVER_KEY);
    let sendBody = {
        notification: {
            title: title,
            body: message
        },
        to: token_device
    };
    fcm.send(sendBody, (error, response) => {
        if (error)
            console.log(error);
        console.log(response);
    });
}
exports.sendNotification = sendNotification;
async function sendNotificationForAllUser(title, message) {
    const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
    let queryResult = await connection.query(`select tokendevice
                                              from "User"
                                              where tokendevice is not null`);
    for (let item of queryResult.rows) {
        await sendNotification(title, message, item.tokendevice);
    }
}
exports.sendNotificationForAllUser = sendNotificationForAllUser;
