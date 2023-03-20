import express, {Application, Request, Response} from "express";
import path from "path";
import http from "http";
import https from 'https'
import expressLayouts from 'express-ejs-layouts';
import cookie_parser from 'cookie-parser'
import sessions from 'express-session'
import dotenv from 'dotenv'
import {PostgreSQLConfig} from "./config/posgre";
import cors from "cors"
import {
    adminLoginLogRoute,
    API,
    homeRoute,
    loginPostRoute,
    loginRoute,
    logoutRoute, notificationRoute,
    productCategoryRoute
} from "./routes";
import requestIp from 'request-ip'
import {Client} from 'pg';
import * as fs from "fs";
import {firebaseAdminApp, firebaseApp} from "./config/firebase_conf";
import multer from "multer";
import {productRoute} from "./routes/ProductRoute";
import {discountRoute} from "./routes/DiscountRoute";
import {
    adminGetItemsInOrder,
    getItemsInOrder,
    getOrderDetail,
    getOrders,
    getUserCurrentOrder, getUserOrders, reOrder
} from "./postgre/OrderDetails";
import {getMonthlyChart} from "./postgre/Statistical";
import {orderRoutes} from "./routes/OrderRoutes";
import {sendNotification, sendNotificationForAllUser} from "./routes/NotificationRoute";
import {sendResetPasswordEmail, userResetPassword} from "./routes/AuthenticationRoute";
import {usersRoute} from "./routes/UsersRoute";
import {checkActiveStatus} from "./postgre/User";
import {inventoryRoute} from "./routes/InventoryRoute";

export const app: Application = express();
const credentials = {
    key: fs.readFileSync('./key.pem'),
    cert: fs.readFileSync('./cert.pem')
}

dotenv.config({
    path: "process.env"
})

// muter upload
const upload = multer({
    storage: multer.memoryStorage()
})


const publicDirectoryPath = path.join(__dirname, "./public");
app.use(express.static(publicDirectoryPath));

app.use(cors({
    origin: '*'
}))

// Setting the port
const port = process.env.HTTP_PORT;

// EJS setup
app.use(expressLayouts);

// Setting the root path for views directory
app.set('views', path.join(__dirname, 'views'));

// Setting the view engine
app.set('view engine', 'ejs');


/*Create application sessions */
app.use(sessions({
    // @ts-ignore
    secret: process.env.SESSION_SECRET_KEY,
    saveUninitialized: true,
    cookie: {maxAge: 1000 * 60 * 60 * 24},
    resave: true,
}))


app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookie_parser())
app.use(requestIp.mw())

app.get("/empty", (req: Request, res: Response) => {
    res.render("empty_main")
})

var session: any;

/*Login route*/
loginRoute(app)

/* Home route */
homeRoute(app)

/*Login  POST route */
loginPostRoute(app, session)

/* Logout route */
logoutRoute(app)

/* Login logs route */
adminLoginLogRoute(app)

/* Product categories route */
productCategoryRoute(app, upload)

/* Product route */
productRoute(app, upload)

/* Discount route */
discountRoute(app, upload)

/* API Route */
API(app)

/*Notification route*/
notificationRoute(app, upload)

/*Order routes*/
orderRoutes(app)

/*Users routes*/
usersRoute(app)

/*Inventory routes*/
inventoryRoute(app)

/* 404 page */
app.use((req, res) => {
    res.status(404).render('404')
})


let client, _firebaseApp = firebaseApp, _firebaseAdminApp = firebaseAdminApp;


async function handleDisconnect() {
    client = new Client(PostgreSQLConfig)
    await client.connect((error) => {
        console.log(error)
    })
    console.log("Connected")
    client.end()

    client.on('error', (error: any) => {
        console.log("Database error : ", error);
        if (error) {
            handleDisconnect()
        } else {
            throw error
        }
    })
}



handleDisconnect().then()

const server: http.Server = http.createServer(app);
const httpsServer = https.createServer(credentials, app);
server.listen(port, () => {
    console.log("Running on port " + port)
});
httpsServer.listen(3443, () => {
    console.log("HTTPS Server running on 3443")
})


