"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inventoryRoute = void 0;
const Inventory_1 = require("../postgre/Inventory");
function inventoryRoute(app) {
    app.get("/inventory", (req, res) => {
        Promise.all([(0, Inventory_1.getBestSellerProducts)(), (0, Inventory_1.getRunningOutOfStock)(), (0, Inventory_1.getLovesProductList)(), (0, Inventory_1.getEndDateProductList)()]).then(result => {
            // [0] means best seller, [1] means running out
            res.render("inventory", {
                products: result[0].result,
                runningOutProds: result[1].result,
                loves: result[2].result,
                endDate: result[3].result
            });
        }).catch(_ => {
            console.log(_);
            res.end("ERROR");
        });
    });
}
exports.inventoryRoute = inventoryRoute;
