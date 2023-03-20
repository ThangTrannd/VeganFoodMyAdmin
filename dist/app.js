"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
const express_ejs_layouts_1 = __importDefault(require("express-ejs-layouts"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_session_1 = __importDefault(require("express-session"));
const dotenv_1 = __importDefault(require("dotenv"));
const posgre_1 = require("./config/posgre");
const cors_1 = __importDefault(require("cors"));
const routes_1 = require("./routes");
const request_ip_1 = __importDefault(require("request-ip"));
const pg_1 = require("pg");
const fs = __importStar(require("fs"));
const firebase_conf_1 = require("./config/firebase_conf");
const multer_1 = __importDefault(require("multer"));
const ProductRoute_1 = require("./routes/ProductRoute");
const DiscountRoute_1 = require("./routes/DiscountRoute");
const OrderRoutes_1 = require("./routes/OrderRoutes");
const UsersRoute_1 = require("./routes/UsersRoute");
const InventoryRoute_1 = require("./routes/InventoryRoute");
exports.app = (0, express_1.default)();
const credentials = {
    key: fs.readFileSync('./key.pem'),
    cert: fs.readFileSync('./cert.pem')
};
dotenv_1.default.config({
    path: "process.env"
});
// muter upload
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage()
});
const publicDirectoryPath = path_1.default.join(__dirname, "./public");
exports.app.use(express_1.default.static(publicDirectoryPath));
exports.app.use((0, cors_1.default)({
    origin: '*'
}));
// Setting the port
const port = process.env.HTTP_PORT;
// EJS setup
exports.app.use(express_ejs_layouts_1.default);
// Setting the root path for views directory
exports.app.set('views', path_1.default.join(__dirname, 'views'));
// Setting the view engine
exports.app.set('view engine', 'ejs');
/*Create application sessions */
exports.app.use((0, express_session_1.default)({
    // @ts-ignore
    secret: process.env.SESSION_SECRET_KEY,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
    resave: true,
}));
exports.app.use(express_1.default.json());
exports.app.use(express_1.default.urlencoded({ extended: true }));
exports.app.use((0, cookie_parser_1.default)());
exports.app.use(request_ip_1.default.mw());
exports.app.get("/empty", (req, res) => {
    res.render("empty_main");
});
var session;
/*Login route*/
(0, routes_1.loginRoute)(exports.app);
/* Home route */
(0, routes_1.homeRoute)(exports.app);
/*Login  POST route */
(0, routes_1.loginPostRoute)(exports.app, session);
/* Logout route */
(0, routes_1.logoutRoute)(exports.app);
/* Login logs route */
(0, routes_1.adminLoginLogRoute)(exports.app);
/* Product categories route */
(0, routes_1.productCategoryRoute)(exports.app, upload);
/* Product route */
(0, ProductRoute_1.productRoute)(exports.app, upload);
/* Discount route */
(0, DiscountRoute_1.discountRoute)(exports.app, upload);
/* API Route */
(0, routes_1.API)(exports.app);
/*Notification route*/
(0, routes_1.notificationRoute)(exports.app, upload);
/*Order routes*/
(0, OrderRoutes_1.orderRoutes)(exports.app);
/*Users routes*/
(0, UsersRoute_1.usersRoute)(exports.app);
/*Inventory routes*/
(0, InventoryRoute_1.inventoryRoute)(exports.app);
/* 404 page */
exports.app.use((req, res) => {
    res.status(404).render('404');
});
let client, _firebaseApp = firebase_conf_1.firebaseApp, _firebaseAdminApp = firebase_conf_1.firebaseAdminApp;
async function handleDisconnect() {
    client = new pg_1.Client(posgre_1.PostgreSQLConfig);
    await client.connect((error) => {
        console.log(error);
    });
    console.log("Connected");
    client.end();
    client.on('error', (error) => {
        console.log("Database error : ", error);
        if (error) {
            handleDisconnect();
        }
        else {
            throw error;
        }
    });
}
handleDisconnect().then();
const server = http_1.default.createServer(exports.app);
const httpsServer = https_1.default.createServer(credentials, exports.app);
server.listen(port, () => {
    console.log("Running on port " + port);
});
httpsServer.listen(3443, () => {
    console.log("HTTPS Server running on 3443");
});
