"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteShoppingSession = exports.getUserSessionId = exports.getCartInfo = exports.createShoppingSession = exports.isUserHasTempCart = exports.triggerUpdateSessionTotal = void 0;
const pg_1 = require("pg");
const posgre_1 = require("../config/posgre");
const index_1 = require("./index");
/* As we don't know much about PostgreSQL, we cannot create trigger in Postgre, so we decided to use
* javascript as trigger. We know that it's not recommended, but we don't have much time left :<
* By DieuNN */
async function triggerUpdateSessionTotal(userId, sessionId) {
    const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
    try {
        await connection.query(`begin`);
        let result = await connection.query(`with total_sum as (select sum(CI.quantity * price) -
                                                                       round(sum(CI.quantity * price * discountpercent / 100)) as sum
                                                                from "ShoppingSession"
                                                                         inner join "CartItem" CI on "ShoppingSession".id = CI.sessionid
                                                                         inner join "Product" P on CI.productid = P.id
                                                                         left join "Discount" on P.discountid = "Discount".id
                                                                where sessionid = ${sessionId}
                                                                  and userid = ${userId})
                                             update "ShoppingSession"
                                             set total = total_sum.sum
                                             from total_sum
                                             where id = ${sessionId}
                                               and userid = ${userId};`);
        await connection.query(`commit`);
    }
    catch (e) {
        await connection.query(`rollback`);
    }
    connection.end();
}
exports.triggerUpdateSessionTotal = triggerUpdateSessionTotal;
async function isUserHasTempCart(userId) {
    try {
        const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
        let result = await connection.query(`select count(*)
                                             from "ShoppingSession"
                                             where userid = ${userId}`);
        if (result.rows[0].count == 0) {
            return (0, index_1.createResult)(true);
        }
        else {
            return (0, index_1.createResult)(false);
        }
    }
    catch (e) {
        return (0, index_1.createException)(e);
    }
}
exports.isUserHasTempCart = isUserHasTempCart;
async function createShoppingSession(userId) {
    const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
    try {
        const shouldCreateTempCart = await isUserHasTempCart(userId);
        if (shouldCreateTempCart.result === false) {
            return (0, index_1.createException)("Nguoi dung nay da co gio hang tam thoi!");
        }
        await connection.query(`begin`);
        const result = await connection.query(`insert into "ShoppingSession"
                                               values (default,
                                                       ${userId},
                                                       0,
                                                       now(),
                                                       now())`);
        await connection.query(`commit`);
        return (0, index_1.createResult)(result.rowCount == 1);
    }
    catch (e) {
        await connection.query(`rollback`);
        throw (0, index_1.createException)(e);
    }
}
exports.createShoppingSession = createShoppingSession;
async function getCartInfo(userId, sessionId) {
    try {
        const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
        let result = await connection.query(`select count(*)                                                             as "totalCategory",
                                                    sum(CI.quantity)                                                     as "totalQuantity",
                                                    sum(CI.quantity * price)                                             as "priceBeforeDiscount",
                                                    sum(CI.quantity * price) -
                                                    round(sum(CI.quantity * price * coalesce(discountpercent, 0) / 100)) as "priceAfterDiscount"
                                             from "ShoppingSession"
                                                      inner join "CartItem" CI on "ShoppingSession".id = CI.sessionid
                                                      inner join "Product" P on CI.productid = P.id
                                                      left join "Discount" on P.discountid = "Discount".id
                                             where sessionid = ${sessionId}
                                               and userid = ${userId};`);
        return (0, index_1.createResult)(result.rows[0]);
    }
    catch (e) {
        throw (0, index_1.createException)(e);
    }
}
exports.getCartInfo = getCartInfo;
async function getUserSessionId(userId) {
    try {
        const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
        const result = await connection.query(`select "ShoppingSession".id
                                               from "ShoppingSession"
                                                        inner join "User" on "ShoppingSession".userid = "User".id
                                               where "User".id = ${userId}`);
        if (result.rowCount != 1) {
            return (0, index_1.createException)("Nguoi dung chua co gio hang!");
        }
        else {
            return (0, index_1.createResult)(result.rows[0]);
        }
    }
    catch (e) {
        throw (0, index_1.createException)(e);
    }
}
exports.getUserSessionId = getUserSessionId;
async function deleteShoppingSession(userId, sessionId) {
    const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
    try {
        await connection.query(`begin`);
        const result = await connection.query(`delete
                                               from "ShoppingSession"
                                               where id = ${sessionId}
                                                 and userid = ${userId}`);
        await connection.query(`commit`);
        if (result.rowCount === 1) {
            return (0, index_1.createResult)(true);
        }
        else {
            await connection.query(`rollback`);
            // stop here
            throw (0, index_1.createException)("Khong tim thay userId " + userId + " va sessionId " + sessionId);
        }
    }
    catch (e) {
        console.log(e);
        await connection.query(`rollback`);
        throw (0, index_1.createException)(e);
    }
}
exports.deleteShoppingSession = deleteShoppingSession;
