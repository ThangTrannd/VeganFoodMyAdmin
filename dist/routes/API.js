"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.API = void 0;
const postgre_1 = require("../postgre");
const User_1 = require("../postgre/User");
const Product_1 = require("../postgre/Product");
const CartItem_1 = require("../postgre/CartItem");
const ShoppingSession_1 = require("../postgre/ShoppingSession");
const OrderDetails_1 = require("../postgre/OrderDetails");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const LovedProducts_1 = require("../postgre/LovedProducts");
const Statistical_1 = require("../postgre/Statistical");
const Notification_1 = require("../postgre/Notification");
const AuthenticationRoute_1 = require("./AuthenticationRoute");
dotenv_1.default.config({
    path: "process.env"
});
function API(app) {
    app.post("/api/product_categories", async (req, res) => {
        (0, postgre_1.getProductCategories)().then(r => {
            res.json(r);
        }).catch(e => {
            res.json((0, postgre_1.createException)(e));
        });
    });
    // TODO: Should we need this?
    // Update: We need this
    app.post("/api/users", (req, res) => {
        const result = (0, postgre_1.getUsers)();
        result.then(r => {
            res.json(r);
        }).catch(e => {
            res.json((0, postgre_1.createException)(e));
        });
    });
    app.post("/api/user_info", async (req, res) => {
        const { token } = req.body;
        if (!validateToken(token)) {
            res.json(returnInvalidToken());
            return;
        }
        (0, postgre_1.getUser)(token).then(r => {
            res.json(r);
        }).catch(e => {
            res.json((0, postgre_1.createException)(e));
        });
    });
    app.post("/api/update_user_info", (req, res) => {
        const { token, name, username, email, phoneNumber } = req.body;
        for (let item of [token, name, username, email, phoneNumber]) {
            if (item == undefined) {
                res.json((0, postgre_1.createException)("Du lieu nhap vao khong dung"));
                return;
            }
        }
        if (!validateToken(token)) {
            res.json(returnInvalidToken());
            return;
        }
        const { id } = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        (0, postgre_1.updateUserInfo)(id, {
            id: null,
            username: username,
            name: name,
            email: email,
            phoneNumber: phoneNumber,
            password: null,
            modifiedAt: null,
            createAt: null
        }).then(r => {
            res.json(r);
        }).catch(e => {
            res.json((0, postgre_1.createException)(e));
        });
    });
    app.post("/api/update_user_password", (req, res) => {
        const { token, oldPassword, newPassword } = req.body;
        if (!validateToken(token)) {
            res.json(returnInvalidToken());
            return;
        }
        const { id } = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        (0, postgre_1.updateUserPassword)(id, oldPassword, newPassword).then(r => {
            res.json(r);
        }).catch(e => {
            res.json((0, postgre_1.createException)(e));
        });
    });
    app.post("/api/update_user_address", (req, res) => {
        const { token, address, phoneNumber } = req.body;
        if (!validateToken(token)) {
            res.json(returnInvalidToken());
            return;
        }
        const { id } = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        (0, postgre_1.updateUserAddress)(id, {
            id: null,
            address: address,
            phoneNumber: phoneNumber,
            userId: null
        }).then(r => {
            res.json(r);
        }).catch(e => {
            res.json((0, postgre_1.createException)(e));
        });
    });
    // TODO: Should we need this?
    app.post("/api/user_id", async (req, res) => {
        const { username, token } = req.body;
        (0, User_1.getUserIdByUsername)(username, token).then(r => {
            res.json(r);
        }).catch(e => {
            res.json((0, postgre_1.createException)(e));
        });
    });
    app.post("/api/user_address", (req, res) => {
        const { token } = req.body;
        if (!validateToken(token)) {
            res.json(returnInvalidToken());
            return;
        }
        const { id } = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        (0, User_1.getUserAddress)(id).then(r => {
            res.json(r);
        }).catch(e => {
            res.json((0, postgre_1.createException)(e));
        });
    });
    app.post("/api/user/current-order", (req, res) => {
        const { token } = req.body;
        if (!validateToken(token)) {
            res.json(returnInvalidToken());
            return;
        }
        const { id } = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        (0, OrderDetails_1.getUserCurrentOrder)(id).then(r => {
            res.json(r);
        }).catch(e => {
            res.json((0, postgre_1.createException)(e));
        });
    });
    app.post("/api/product_category", (req, res) => {
        const { id } = req.body;
        console.log("This is test " + 101);
        console.log(req.body);
        (0, postgre_1.getProductCategory)(Number(id)).then(r => {
            res.json(r);
        }).catch(e => {
            res.json((0, postgre_1.createException)(e));
        });
    });
    app.post("/api/discounts", async (req, res) => {
        (0, postgre_1.getDiscounts)().then(r => {
            res.json(r);
        }).catch(e => {
            res.json((0, postgre_1.createException)(e));
        });
    });
    app.get("/api/discount", (req, res) => {
        const { id } = req.body;
        (0, postgre_1.getDiscount)(id).then(r => {
            res.json(r);
        }).catch(e => {
            res.json((0, postgre_1.createException)(e));
        });
    });
    app.post('/api/login', async (req, res) => {
        const { username, password, type, token_device } = req.body;
        (0, postgre_1.getUserLoginInfo)(username, password, type, token_device).then(r => {
            res.json(r);
        }).catch(e => {
            res.json((0, postgre_1.createException)(e));
        });
    });
    app.post('/api/signup', async (req, res) => {
        const { username, password, email, phoneNumber, name } = req.body;
        if (username == undefined || username.toString() == "") {
            res.json((0, postgre_1.createException)("Chua nhap ten nguoi dung!"));
            return;
        }
        if (password == undefined || password.toString() == "") {
            res.json((0, postgre_1.createException)("Chua nhap mat khau!"));
            return;
        }
        if (email == undefined || email.toString() == "") {
            res.json((0, postgre_1.createException)("Chua nhap email!"));
            return;
        }
        if (phoneNumber == undefined || phoneNumber.toString() == "") {
            res.json((0, postgre_1.createException)("Chua nhap so dien thoai!"));
            return;
        }
        if (name == undefined || name.toString() == "") {
            res.json((0, postgre_1.createException)("Chua nhap ten!"));
            return;
        }
        (0, postgre_1.createUser)({
            username: username,
            password: password,
            email: email,
            phoneNumber: phoneNumber,
            name: name,
            id: null,
            createAt: null,
            modifiedAt: null
        }).then(r => {
            res.json(r);
        }).catch(e => {
            res.json((0, postgre_1.createException)(e));
        });
    });
    app.post("/api/products", (req, res) => {
        (0, postgre_1.getProducts)().then(r => {
            res.json(r);
        }).catch(e => {
            res.json((0, postgre_1.createException)(e));
        });
    });
    app.post("/api/product", (req, res) => {
        const { id } = req.body;
        (0, postgre_1.getProduct)(id).then(r => {
            res.json(r);
        }).catch(e => {
            res.json((0, postgre_1.createException)(e));
        });
    });
    app.post("/api/get_products_by_category", (req, res) => {
        const { categoryId } = req.body;
        (0, Product_1.getProductsByCategoryId)(categoryId).then(r => {
            res.json(r);
        }).catch(e => {
            res.json((0, postgre_1.createException)(e));
        });
    });
    app.post("/api/shopping_session/get_session_id", (req, res) => {
        const { token } = req.body;
        if (!validateToken(token)) {
            res.json(returnInvalidToken());
            return;
        }
        const { id } = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        (0, ShoppingSession_1.getUserSessionId)(id).then(r => {
            res.json(r);
        }).catch(e => {
            res.json((0, postgre_1.createException)(e));
        });
    });
    app.post("/api/shopping_session/create_session", (req, res) => {
        const { token } = req.body;
        if (!validateToken(token)) {
            res.json(returnInvalidToken());
            return;
        }
        const { id } = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        (0, postgre_1.createShoppingSession)(id).then(r => {
            res.json(r);
        }).catch(e => {
            res.json((0, postgre_1.createException)(e));
        });
    });
    app.post("/api/shopping_session/delete_session", (req, res) => {
        const { token, sessionId } = req.body;
        if (!validateToken(token)) {
            res.json(returnInvalidToken());
            return;
        }
        const userId = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET).id;
        (0, postgre_1.deleteShoppingSession)(userId, sessionId).then(r => {
            res.json(r);
        }).catch(e => {
            res.json((0, postgre_1.createException)(e));
        });
    });
    app.post("/api/shopping_session/get_cart_info", (req, res) => {
        const { token, sessionId } = req.body;
        if (!validateToken(token)) {
            res.json(returnInvalidToken());
            return;
        }
        const { id } = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        (0, ShoppingSession_1.getCartInfo)(id, sessionId).then(r => {
            res.json(r);
        }).catch(e => {
            res.json((0, postgre_1.createException)(e));
        });
    });
    app.post("/api/shopping_session/add_item", (req, res) => {
        const { token, sessionId, productId, quantity, size, note } = req.body;
        if (!validateToken(token)) {
            res.json(returnInvalidToken());
            return;
        }
        const userId = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET).id;
        (0, postgre_1.addItemToCart)(userId, sessionId, productId, quantity, size, note).then(r => {
            res.json(r);
        }).catch(e => {
            res.json((0, postgre_1.createException)(e));
        });
    });
    app.post("/api/shopping_session/delete_item", (req, res) => {
        const { token, itemId, sessionId } = req.body;
        if (!validateToken(token)) {
            res.json(returnInvalidToken());
            return;
        }
        if (token == undefined) {
            res.end("Provide token!");
            return;
        }
        (0, postgre_1.removeItemFromCart)(itemId, sessionId).then(r => {
            res.json(r);
        }).catch(e => {
            res.json((0, postgre_1.createException)(e));
        });
    });
    app.post("/api/shopping_session/items", (req, res) => {
        console.log(req.body);
        const { token, sessionId } = req.body;
        console.log(token);
        console.log(sessionId);
        if (!validateToken(token)) {
            res.json(returnInvalidToken());
            return;
        }
        const userId = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET).id;
        (0, postgre_1.getCartItems)(userId, sessionId).then(r => {
            res.json(r);
        }).catch(e => {
            res.json((0, postgre_1.createException)(e));
        });
    });
    // I don't even know what did I write XD
    app.post("/api/shopping_session/update_item", (req, res) => {
        const { token, sessionId, productId, quantity, size, note } = req.body;
        if (!validateToken(token)) {
            res.json(returnInvalidToken());
            return;
        }
        const userId = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET).id;
        (0, CartItem_1.updateCartItem)(userId, sessionId, productId, quantity, size, note).then(r => {
            res.json(r);
        }).catch(e => {
            res.json((0, postgre_1.createException)(e));
        });
    });
    app.post("/api/order/confirm_order", (req, res) => {
        const { token, sessionId, provider, phoneNumber, address, note } = req.body;
        if (!validateToken(token)) {
            res.json(returnInvalidToken());
            return;
        }
        const userId = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET).id;
        (0, OrderDetails_1.confirmOrder)(userId, sessionId, provider, phoneNumber, address, note).then(r => {
            res.json(r);
        }).catch(e => {
            res.json((0, postgre_1.createException)(e));
        });
    });
    app.post("/api/order/re_order", (req, res) => {
        const { token, orderId, note } = req.body;
        if (!validateToken(token)) {
            res.json(returnInvalidToken());
            return;
        }
        const userId = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET).id;
        (0, OrderDetails_1.reOrder)(userId, orderId, note).then(r => {
            res.json(r);
        }).catch(e => {
            res.end(e.toString());
        });
    });
    app.post("/api/order/get_user_orders", (req, res) => {
        const { token } = req.body;
        if (!validateToken(token)) {
            res.json(returnInvalidToken());
            return;
        }
        const userId = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET).id;
        (0, OrderDetails_1.getUserOrders)(userId).then(r => {
            res.json(r);
        }).catch(e => {
            res.json((0, postgre_1.createException)(e));
        });
    });
    app.post("/api/order/get_completed_orders", (req, res) => {
        const { token } = req.body;
        if (!validateToken(token)) {
            res.json(returnInvalidToken());
            return;
        }
        const userId = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET).id;
        (0, OrderDetails_1.getUserCompletedOrders)(userId).then(r => {
            res.json(r);
        }).catch(e => {
            res.json((0, postgre_1.createException)(e));
        });
    });
    app.post("/api/order/get_order_detail", (req, res) => {
        const { token, orderId } = req.body;
        if (!validateToken(token)) {
            res.json(returnInvalidToken());
            return;
        }
        const userId = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET).id;
        (0, OrderDetails_1.getOrderDetail)(userId, orderId).then(r => {
            res.json(r);
        }).catch(e => {
            res.json((0, postgre_1.createException)(e));
        });
    });
    app.post("/api/order/cancel_order", (req, res) => {
        const { token, orderId } = req.body;
        if (!validateToken(token)) {
            res.json(returnInvalidToken());
            return;
        }
        const userId = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET).id;
        (0, OrderDetails_1.userCancelOrder)(userId, orderId).then(r => {
            res.json(r);
        }).catch(e => {
            res.json((0, postgre_1.createException)(e));
        });
    });
    app.post("/api/order/get_items", (req, res) => {
        const { token, orderId } = req.body;
        if (!validateToken(token)) {
            res.json(returnInvalidToken());
            return;
        }
        const userId = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET).id;
        (0, OrderDetails_1.getItemsInOrder)(orderId, userId).then(r => {
            res.json(r);
        }).catch(e => {
            res.json((0, postgre_1.createException)(e));
        });
    });
    // FAV Items
    app.post("/api/fav/items", (req, res) => {
        const { token } = req.body;
        if (!validateToken(token)) {
            res.json(returnInvalidToken());
            return;
        }
        let user;
        try {
            user = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        }
        catch (e) {
            res.json((0, postgre_1.createException)("Token không hợp lệ!"));
            return;
        }
        (0, postgre_1.getLovedItems)(user.id).then(r => {
            res.json(r);
        }).catch(e => {
            res.json((0, postgre_1.createException)(e));
        });
    });
    app.post("/api/fav/add", (req, res) => {
        const { token, productId } = req.body;
        if (!validateToken(token)) {
            res.json(returnInvalidToken());
            return;
        }
        const userId = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET).id;
        (0, LovedProducts_1.addLovedItem)(userId, productId).then(r => {
            res.json(r);
        }).catch(e => {
            res.json((0, postgre_1.createException)(e));
        });
    });
    app.post("/api/user/send_reset_email", (req, res) => {
        const { email } = req.body;
        (0, AuthenticationRoute_1.sendResetPasswordEmail)(email).then(r => {
            res.json(r);
        }).catch(e => {
            res.end(e.toString());
            throw e;
        });
    });
    app.get("/api/user/reset_password/", (req, res) => {
        let token = req.query.token;
        if (!validateToken(token)) {
            res.end("INVALID TOKEN");
        }
        // im so fucking lazy :>
        const email = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        console.log(email);
        (0, AuthenticationRoute_1.userResetPassword)(email.email).then(r => {
            console.log(r);
            res.end("Mật khẩu đã được đặt về mặc định là 'password' (không có dấu nháy đơn)!");
        }).catch(e => {
            res.end("Lỗi không thể đặt lại mật khẩu: " + e.toString());
        });
    });
    app.post("/api/user/active_status", (req, res) => {
        const { token, productId } = req.body;
        if (!validateToken(token)) {
            res.json(returnInvalidToken());
            return;
        }
        const userId = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET).id;
        (0, User_1.checkActiveStatus)(userId).then(r => {
            res.json(r);
        }).catch(e => {
            res.end(e.toString());
        });
    });
    app.post("/api/fav/delete", (req, res) => {
        const { token, productId } = req.body;
        if (!validateToken(token)) {
            res.json(returnInvalidToken());
            return;
        }
        const userId = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET).id;
        (0, LovedProducts_1.deleteLovedItem)(userId, productId).then(r => {
            res.json(r);
        }).catch(e => {
            res.json((0, postgre_1.createException)(e));
        });
    });
    app.post("/api/fav/check_loved", (req, res) => {
        const { token, productId } = req.body;
        if (!validateToken(token)) {
            res.json(returnInvalidToken());
            return;
        }
        const userId = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET).id;
        (0, LovedProducts_1.isUserLovedProduct)(userId, productId).then(r => {
            res.json(r);
        }).catch(e => {
            res.json((0, postgre_1.createException)(e));
        });
    });
    app.get("/api/statistical/monthly-chart", (req, res) => {
        res.header('Content-Type: application/json');
        res.header('Access-Control-Allow-Origin: *');
        (0, Statistical_1.getMonthlyChart)().then(r => {
            res.json(r);
        }).catch(e => {
            res.json((0, postgre_1.createException)(e));
        });
    });
    app.get("/api/statistical/bar-chart", (req, res) => {
        (0, Statistical_1.getRangeBarChart)().then(result => {
            res.json(result);
        });
    });
    app.get("/api/statistical/yearly-chart", (req, res) => {
        res.header('Content-Type: application/json');
        res.header('Access-Control-Allow-Origin: *');
        (0, Statistical_1.getYearlyChart)().then(r => {
            res.json(r);
        }).catch(e => {
            res.json((0, postgre_1.createException)(e));
        });
    });
    app.post("/api/product/find", (req, res) => {
        (0, Product_1.findProductsByName)(req.body.query).then(r => {
            res.json(r);
        }).catch(e => {
            res.end(e);
        });
    });
    app.post("/api/notification/promote", (req, res) => {
        (0, Notification_1.getPromotionNotifications)().then(r => {
            res.json(r);
        }).catch(e => {
            res.json((0, postgre_1.createException)(e));
        });
    });
    app.post("/api/notification/news", (req, res) => {
        (0, Notification_1.getNewsNotifications)().then(r => {
            res.json(r);
        }).catch(e => {
            res.json((0, postgre_1.createException)(e));
        });
    });
    app.post("/api/notification/all", (req, res) => {
        (0, Notification_1.getAllNotifications)().then(r => {
            res.json(r);
        }).catch(e => {
            res.json((0, postgre_1.createException)(e));
        });
    });
}
exports.API = API;
function validateToken(token) {
    try {
        jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        return true;
    }
    catch (e) {
        return false;
    }
}
function returnInvalidToken() {
    return (0, postgre_1.createException)("Token không hợp lệ!");
}
