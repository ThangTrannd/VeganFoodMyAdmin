"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationRoute = exports.API = exports.productCategoryRoute = exports.adminLoginLogRoute = exports.logoutRoute = exports.loginPostRoute = exports.loginRoute = exports.homeRoute = void 0;
const HomeRoute_1 = require("./HomeRoute");
Object.defineProperty(exports, "homeRoute", { enumerable: true, get: function () { return HomeRoute_1.homeRoute; } });
const AuthenticationRoute_1 = require("./AuthenticationRoute");
Object.defineProperty(exports, "loginPostRoute", { enumerable: true, get: function () { return AuthenticationRoute_1.loginPostRoute; } });
Object.defineProperty(exports, "loginRoute", { enumerable: true, get: function () { return AuthenticationRoute_1.loginRoute; } });
Object.defineProperty(exports, "logoutRoute", { enumerable: true, get: function () { return AuthenticationRoute_1.logoutRoute; } });
const AdminLoginLogRoute_1 = require("./AdminLoginLogRoute");
Object.defineProperty(exports, "adminLoginLogRoute", { enumerable: true, get: function () { return AdminLoginLogRoute_1.adminLoginLogRoute; } });
const ProductCategoryRoute_1 = require("./ProductCategoryRoute");
Object.defineProperty(exports, "productCategoryRoute", { enumerable: true, get: function () { return ProductCategoryRoute_1.productCategoryRoute; } });
const API_1 = require("./API");
Object.defineProperty(exports, "API", { enumerable: true, get: function () { return API_1.API; } });
const NotificationRoute_1 = require("./NotificationRoute");
Object.defineProperty(exports, "notificationRoute", { enumerable: true, get: function () { return NotificationRoute_1.notificationRoute; } });
