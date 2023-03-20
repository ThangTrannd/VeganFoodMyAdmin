"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUserLovedProduct = exports.deleteLovedItem = exports.addLovedItem = exports.getLovedItems = void 0;
const pg_1 = require("pg");
const posgre_1 = require("../config/posgre");
const index_1 = require("./index");
async function getLovedItems(userId) {
    try {
        const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
        let result = await connection.query(`select "LovedItems".id                                  as "id",
                                                    productid                                        as "productId",
                                                    P.name                                           as "productName",
                                                    P.description                                    as "productDescription",
                                                    PC.name                                          as "productCategoryName",
                                                    discountpercent                                  as "discountPercent",
                                                    price                                            as "priceBeforeDiscount",
                                                    round(price - P.price * D.discountpercent / 100) as "priceAfterDiscount",
                                                    P.displayimage                                   as "displayImage",
                                                    size                                             as "size"
                                             from "LovedItems"
                                                      inner join "Product" P on P.id = "LovedItems".productid

                                                      inner join "ProductCategory" PC on PC.id = P.categoryid
                                                      left outer join "Discount" D on D.id = P.discountid
                                             where useid = ${userId}
        ;`);
        result.rows.map(item => {
            item.size = item.size.split(",").filter((it) => it !== "").join(",");
        });
        return (0, index_1.createResult)(result.rows);
    }
    catch (e) {
        return (0, index_1.createException)(e);
    }
}
exports.getLovedItems = getLovedItems;
async function addLovedItem(userId, productId) {
    const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
    try {
        if ((await isItemAlreadyInList(userId, productId))) {
            return (0, index_1.createException)("San pham nay da co trong list");
        }
        await connection.query(`begin`);
        let result = await connection.query(`insert into "LovedItems" (id, useid, productid)
                                             values (default, ${userId}, ${productId})`);
        await connection.query(`commit`);
        return (0, index_1.createResult)(result.rowCount != 0);
    }
    catch (e) {
        await connection.query(`rollback`);
        return (0, index_1.createException)(e);
    }
}
exports.addLovedItem = addLovedItem;
async function deleteLovedItem(userId, productId) {
    const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
    try {
        await connection.query(`begin`);
        let _isItemInList = await isItemAlreadyInList(userId, productId);
        if (!_isItemInList) {
            return (0, index_1.createException)("San pham nay chua co trong list");
        }
        let result = await connection.query(`delete
                                             from "LovedItems"
                                             where userid = ${userId}
                                               and productid = ${productId}`);
        await connection.query(`commit`);
        if (result.rowCount == 0) {
            return (0, index_1.createException)("Khong tim thay item ID");
        }
        else {
            return (0, index_1.createResult)(true);
        }
    }
    catch (e) {
        await connection.query(`rollback`);
        return (0, index_1.createException)(e);
    }
}
exports.deleteLovedItem = deleteLovedItem;
async function isItemAlreadyInList(userId, productId) {
    try {
        const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
        const result = await connection.query(`select *
                                               from "LovedItems"
                                               where userid = ${userId}
                                                 and productid = ${productId}`);
        return result.rows.length == 1;
    }
    catch (e) {
        return false;
    }
}
async function isUserLovedProduct(userId, productId) {
    try {
        const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
        let result = await connection.query(`select *
                                             from "LovedItems"
                                             where userid = ${userId}
                                               and productid = ${productId}`);
        return (0, index_1.createResult)(result.rowCount != 0);
    }
    catch (e) {
        return (0, index_1.createException)(e);
    }
}
exports.isUserLovedProduct = isUserLovedProduct;
