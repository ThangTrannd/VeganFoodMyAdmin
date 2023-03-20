"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderRoutes = void 0;
const OrderDetails_1 = require("../postgre/OrderDetails");
const PaymentDetails_1 = require("../postgre/PaymentDetails");
const User_1 = require("../postgre/User");
const NotificationRoute_1 = require("./NotificationRoute");
function orderRoutes(app) {
    app.get("/pending-orders", (req, res) => {
        (0, OrderDetails_1.getOrders)("Đợi xác nhận").then(r => {
            res.render("pending_orders", { orders: r.result });
        });
    });
    app.post("/pending-orders/confirm", (req, res) => {
        const { paymentId, orderId, userId } = req.body;
        (0, PaymentDetails_1.updatePaymentDetailStatus)(paymentId, orderId, "Đang giao").then(r => {
            (0, User_1.getUserTokenDevice)(userId).then(r1 => {
                console.log(r1);
                (0, NotificationRoute_1.sendNotification)("Thông báo", "Đơn hàng của bạn đã được xác nhận", r1);
            });
            res.redirect("/pending-orders");
        });
    });
    app.post("/pending-orders/cancel", (req, res) => {
        const { paymentId, orderId, userId } = req.body;
        (0, PaymentDetails_1.updatePaymentDetailStatus)(paymentId, orderId, "Bị hủy").then(r => {
            (0, User_1.getUserTokenDevice)(userId).then(r1 => {
                (0, NotificationRoute_1.sendNotification)("Thông báo", "Đơn hàng của bạn đã bị hủy", r1);
            });
            res.redirect("/pending-orders");
        });
    });
    app.get("/delivering-order", (req, res) => {
        (0, OrderDetails_1.getOrders)("Đang giao").then(r => {
            res.render("delivering_orders", { orders: r.result });
        });
    });
    app.post("/delivering-order/confirm", (req, res) => {
        const { paymentId, orderId, userId } = req.body;
        (0, PaymentDetails_1.updatePaymentDetailStatus)(paymentId, orderId, "Hoàn thành").then(r => {
            (0, User_1.getUserTokenDevice)(userId).then(r1 => {
                (0, NotificationRoute_1.sendNotification)("Thông báo", "Đơn hàng của bạn đã giao xong", r1);
            });
            res.redirect("/delivering-order");
        });
    });
    app.post("/delivering-order/cancel", (req, res) => {
        const { paymentId, orderId, userId } = req.body;
        (0, PaymentDetails_1.updatePaymentDetailStatus)(paymentId, orderId, "Bị hủy").then(r => {
            (0, User_1.getUserTokenDevice)(userId).then(r1 => {
                (0, NotificationRoute_1.sendNotification)("Thông báo", "Đơn hàng của bạn đã bị hủy", r1);
            });
            res.redirect("/delivering-order");
        });
    });
    app.get("/completed-orders", (req, res) => {
        (0, OrderDetails_1.getOrders)("Hoàn thành").then(r => {
            res.render("completed_orders", { orders: r.result });
        });
    });
    app.post("/completed-orders/delete", (req, res) => {
        const { paymentId, orderId } = req.body;
        (0, OrderDetails_1.deleteOrder)(orderId, paymentId).then(r => {
            res.redirect("/completed-orders");
        });
    });
    app.get("/canceled-orders", (req, res) => {
        (0, OrderDetails_1.getOrders)("Bị hủy").then(r => {
            res.render("canceled_orders", { orders: r.result });
        });
    });
    app.post("/canceled-orders/delete", (req, res) => {
        const { paymentId, orderId } = req.body;
        (0, OrderDetails_1.deleteOrder)(orderId, paymentId).then(r => {
            res.redirect("/canceled-orders");
        });
    });
}
exports.orderRoutes = orderRoutes;
