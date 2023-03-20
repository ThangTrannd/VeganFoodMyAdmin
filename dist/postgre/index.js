"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createResult = exports.createException = exports.getAllStatistical = exports.getLovedItems = exports.getCartItems = exports.deleteShoppingSession = exports.removeItemFromCart = exports.createShoppingSession = exports.addItemToCart = exports.addUserMomoPayment = exports.getUserIdByUsername = exports.updateUserMomoPayment = exports.updateUserPassword = exports.getProducts = exports.getProduct = exports.updateProduct = exports.addProduct = exports.getUserLoginInfo = exports.updateUserInfo = exports.updateUserAddress = exports.deleteUser = exports.getUser = exports.getUsers = exports.createUser = exports.getDiscount = exports.getProductCategory = exports.updateDiscount = exports.deleteDiscount = exports.getDiscounts = exports.createDiscount = exports.deleteProductCategory = exports.updateProductCategory = exports.getProductCategories = exports.addProductCategory = exports.isAdminLogin = void 0;
const Admin_1 = require("./Admin");
Object.defineProperty(exports, "isAdminLogin", { enumerable: true, get: function () { return Admin_1.isAdminLogin; } });
const ProductCategory_1 = require("./ProductCategory");
Object.defineProperty(exports, "addProductCategory", { enumerable: true, get: function () { return ProductCategory_1.addProductCategory; } });
Object.defineProperty(exports, "deleteProductCategory", { enumerable: true, get: function () { return ProductCategory_1.deleteProductCategory; } });
Object.defineProperty(exports, "updateProductCategory", { enumerable: true, get: function () { return ProductCategory_1.updateProductCategory; } });
Object.defineProperty(exports, "getProductCategories", { enumerable: true, get: function () { return ProductCategory_1.getProductCategories; } });
Object.defineProperty(exports, "getProductCategory", { enumerable: true, get: function () { return ProductCategory_1.getProductCategory; } });
const Discount_1 = require("./Discount");
Object.defineProperty(exports, "createDiscount", { enumerable: true, get: function () { return Discount_1.createDiscount; } });
Object.defineProperty(exports, "deleteDiscount", { enumerable: true, get: function () { return Discount_1.deleteDiscount; } });
Object.defineProperty(exports, "getDiscount", { enumerable: true, get: function () { return Discount_1.getDiscount; } });
Object.defineProperty(exports, "getDiscounts", { enumerable: true, get: function () { return Discount_1.getDiscounts; } });
Object.defineProperty(exports, "updateDiscount", { enumerable: true, get: function () { return Discount_1.updateDiscount; } });
const User_1 = require("./User");
Object.defineProperty(exports, "createUser", { enumerable: true, get: function () { return User_1.createUser; } });
Object.defineProperty(exports, "deleteUser", { enumerable: true, get: function () { return User_1.deleteUser; } });
Object.defineProperty(exports, "getUser", { enumerable: true, get: function () { return User_1.getUser; } });
Object.defineProperty(exports, "getUserLoginInfo", { enumerable: true, get: function () { return User_1.getUserLoginInfo; } });
Object.defineProperty(exports, "getUsers", { enumerable: true, get: function () { return User_1.getUsers; } });
Object.defineProperty(exports, "updateUserInfo", { enumerable: true, get: function () { return User_1.updateUserInfo; } });
Object.defineProperty(exports, "updateUserAddress", { enumerable: true, get: function () { return User_1.updateUserAddress; } });
Object.defineProperty(exports, "updateUserPassword", { enumerable: true, get: function () { return User_1.updateUserPassword; } });
Object.defineProperty(exports, "getUserIdByUsername", { enumerable: true, get: function () { return User_1.getUserIdByUsername; } });
Object.defineProperty(exports, "updateUserMomoPayment", { enumerable: true, get: function () { return User_1.updateUserMomoPayment; } });
Object.defineProperty(exports, "addUserMomoPayment", { enumerable: true, get: function () { return User_1.addUserMomoPayment; } });
const Product_1 = require("./Product");
Object.defineProperty(exports, "addProduct", { enumerable: true, get: function () { return Product_1.addProduct; } });
Object.defineProperty(exports, "getProducts", { enumerable: true, get: function () { return Product_1.getProducts; } });
Object.defineProperty(exports, "getProduct", { enumerable: true, get: function () { return Product_1.getProduct; } });
Object.defineProperty(exports, "updateProduct", { enumerable: true, get: function () { return Product_1.updateProduct; } });
const ShoppingSession_1 = require("./ShoppingSession");
Object.defineProperty(exports, "createShoppingSession", { enumerable: true, get: function () { return ShoppingSession_1.createShoppingSession; } });
Object.defineProperty(exports, "deleteShoppingSession", { enumerable: true, get: function () { return ShoppingSession_1.deleteShoppingSession; } });
const CartItem_1 = require("./CartItem");
Object.defineProperty(exports, "addItemToCart", { enumerable: true, get: function () { return CartItem_1.addItemToCart; } });
Object.defineProperty(exports, "removeItemFromCart", { enumerable: true, get: function () { return CartItem_1.removeItemFromCart; } });
Object.defineProperty(exports, "getCartItems", { enumerable: true, get: function () { return CartItem_1.getCartItems; } });
const LovedProducts_1 = require("./LovedProducts");
Object.defineProperty(exports, "getLovedItems", { enumerable: true, get: function () { return LovedProducts_1.getLovedItems; } });
const Statistical_1 = require("./Statistical");
Object.defineProperty(exports, "getAllStatistical", { enumerable: true, get: function () { return Statistical_1.getAllStatistical; } });
function createException(e) {
    return {
        isSuccess: false,
        errorMessage: "Lỗi server: " + e,
        result: null
    };
}
exports.createException = createException;
function createResult(result) {
    return {
        isSuccess: true,
        errorMessage: null,
        result: result
    };
}
exports.createResult = createResult;
