"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.homeRoute = void 0;
const postgre_1 = require("../postgre");
const OrderDetails_1 = require("../postgre/OrderDetails");
function homeRoute(app) {
    app.get("/", (req, res) => {
        /* Uncomment this and comment render line below*/
        if (req.session.userid !== 'admin') {
            res.redirect("/login");
        }
        else {
            Promise.all([(0, postgre_1.getAllStatistical)(), (0, OrderDetails_1.getOrders)(null)]).then(result => {
                // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all
                console.log(result[0]);
                console.log(result[1]);
                res.render('index', { data: result[0].result, orders: result[1].result });
                // res.render('index')
            });
            // res.render('index')
        }
    });
}
exports.homeRoute = homeRoute;
