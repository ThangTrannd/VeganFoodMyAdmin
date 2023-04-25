"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.homeRoute = void 0;
const postgre_1 = require("../postgre");
const OrderDetails_1 = require("../postgre/OrderDetails");
function homeRoute(app) {
    app.get("/", async (req, res) => {
        /* Uncomment this and comment render line below*/
        if (req.session.userid !== "admin") {
            res.redirect("/login");
        }
        else {
            Promise.all([await (0, postgre_1.getAllStatistical)(), await (0, OrderDetails_1.getOrders)(null)]).then(result => {
                res.render("index", { data: result[0].result, orders: result[1].result });
            });
            // res.render('index')
        }
    });
}
exports.homeRoute = homeRoute;
