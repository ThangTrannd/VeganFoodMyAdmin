"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addCartItemsToOrder = void 0;
const pg_1 = require("pg");
const posgre_1 = require("../config/posgre");
const index_1 = require("./index");
async function addCartItemsToOrder(orderId, sessionId, userId) {
    const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
    try {
        await connection.query(`begin`);
        let sessionResult = await connection.query(`select productid                   as "productId",
                                                           "CartItem".quantity         as "quantity",
                                                           price * "CartItem".quantity as "priceBeforeDiscount",
                                                           price * "CartItem".quantity -
                                                           (price * "CartItem".quantity * coalesce(D.discountpercent, 0)) /
                                                           100                         as "priceAfterDiscount",
                                                           "CartItem".size,
                                                           note as "note"
                                                    from "CartItem"
                                                             inner join "Product" P on P.id = "CartItem".productid
                                                             inner join "ProductCategory" on P.categoryid = "ProductCategory".id
                                                             left outer join "Discount" D on P.discountid = D.id

                                                    where sessionid = ${sessionId};`);
        console.log(sessionResult.rows);
        for (const item of sessionResult.rows) {
            await connection.query(`insert into "OrderItem" (id, orderid, productid, quantity, createat,
                                                             modifiedat, size, pricebeforediscount,
                                                             priceafterdiscount, note)
                                    values (default, ${orderId}, ${item.productId}, ${item.quantity}, now(),
                                            now(), '${item.size}', ${item.priceBeforeDiscount},
                                            ${item.priceAfterDiscount}, '${item.note}')`);
        }
        await connection.query(`commit`);
        await updateOrderDetailTotal(orderId, userId);
    }
    catch (e) {
        await connection.query(`rollback`);
        throw (0, index_1.createException)(e);
    }
}
exports.addCartItemsToOrder = addCartItemsToOrder;
async function updateOrderDetailTotal(orderId, userId) {
    const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
    try {
        await connection.query(`begin`);
        await connection.query(`with total_sum as (select sum(priceafterdiscount)
                                         from "OrderDetail"
                                                  inner join "OrderItem" on "OrderDetail".id = "OrderItem".orderid
                                         where "OrderDetail".id = ${orderId})
                      update "OrderDetail"
                      set total = total_sum.sum
                      from total_sum
                      where id = ${orderId}
                        and userid = ${userId}
    ;`);
        await connection.query(`commit`);
    }
    catch (e) {
        await connection.query(`rollback`);
    }
}
