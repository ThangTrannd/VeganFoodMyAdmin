import {Application, Request, Response} from "express";
import dotenv from "dotenv";
import {Pool} from "pg";
import {PostgreSQLConfig} from "../config/posgre";
import multer from "multer";
import {addNotification, deleteNotification, getAllNotifications} from "../postgre/Notification";
import {getDownloadURL, getStorage, ref, uploadBytesResumable} from "firebase/storage";

const FCM = require("fcm-node");

dotenv.config({
	path: "process.env"
});

export function notificationRoute(app: Application, upload: multer.Multer) {
	app.get("/notification", (req: Request, res: Response) => {
		getAllNotifications().then(r => {
			res.render("notification", {notifications: r.result});
		});
	});
	app.post("/notification/add", upload.single("image"), (req: Request, res: Response) => {
		if (!req.file) {
			res.end("Bạn chưa chọn file");
		}
		const {title, message, type} = req.body;
		const storage = getStorage();
		const metadata = {
			contentType: "image/jpeg"
		};
		const fileName = encodeURIComponent(req!.file!.originalname);
		const storageRef = ref(storage, "/images" + fileName);
		const uploadTask = uploadBytesResumable(storageRef, req!.file!.buffer, metadata);
		uploadTask.on("state_changed", (snapshot) => {
			const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
			switch (snapshot.state) {
			case "paused":
				console.log("Upload is paused");
				break;
			case "running":
				console.log("Upload is running");
				break;
			}
		}, (error) => {
			console.log(error);
		}, () => {
			getDownloadURL(uploadTask.snapshot.ref).then(r => {
				addNotification(title, message, type, r).then(() => {
					sendNotificationForAllUser(title, message);
					res.redirect("/notification");
				});
			});
		});
	});
	app.post("/notification/delete", (req: Request, res: Response) => {
		deleteNotification(req.body.id).then(r => {
			res.redirect("/notification");
		});
	});
}


export async function sendNotification(title: string, message: string, token_device: string) {
	const fcm = new FCM(process.env.FCM_SERVER_KEY);
	const sendBody = {
		notification: {
			title: title,
			body: message
		},
		to: token_device
	};
	fcm.send(sendBody, (error: any, response: any) => {
		if (error)
			console.log(error);
		console.log(response);
	});
}

export async function sendNotificationForAllUser(title: string, message: string) {
	const connection = await new Pool(PostgreSQLConfig);
	const queryResult = await connection.query(`select tokendevice
                                              from "User"
                                              where tokendevice is not null`);
	for (const item of queryResult.rows) {
		await sendNotification(title, message, item.tokendevice);
	}
}
