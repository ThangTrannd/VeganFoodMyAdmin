"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCartItems = exports.updateCartItem = exports.removeItemFromCart = exports.isItemInTempCart = exports.addItemToCart = void 0;
const pg_1 = require("pg");
const posgre_1 = require("../config/posgre");
const index_1 = require("./index");
const ShoppingSession_1 = require("./ShoppingSession");
async function addItemToCart(userId, sessionId, productId, quantity, size, note) {
    const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
    try {
        const productQuantity = await connection.query(`select quantity
                                                        from "Product"
                                                        where id = ${productId}`);
        if (productQuantity.rows.length === 0) {
            return (0, index_1.createException)("Khong thay san pham voi ID la " + productId);
        }
        else {
            if (quantity > productQuantity.rows[0].quantity) {
                return (0, index_1.createException)("So luong khong hop le! Kho con " + productQuantity.rows[0].quantity + ", so luong nhap: " + quantity);
            }
            // if item in cart, update quantity
            let _isItemInTempCart = await isItemInTempCart(productId, sessionId);
            if (_isItemInTempCart.result) {
                await updateCartItem(userId, sessionId, productId, quantity, size, note);
                await (0, ShoppingSession_1.triggerUpdateSessionTotal)(userId, sessionId).then();
                return (0, index_1.createResult)(true);
            }
            else {
                await connection.query(`begin`);
                const product = await connection.query(`select displayimage from "Product" where id = ${productId}`);
                let insertResult = await connection.query(`insert into "CartItem" (id, sessionid, productid, quantity,displayimage, size, note)
                                                       values (default,
                                                               ${sessionId},
                                                               ${productId},
                                                               ${quantity},
                                                                '${product.rows[0].displayimage}',
                                                               '${size}',
                                                               '${note}')
            `);
                await connection.query(`commit`);
                if (insertResult.rowCount == 1) {
                    await (0, ShoppingSession_1.triggerUpdateSessionTotal)(userId, sessionId).then();
                    return (0, index_1.createResult)(true);
                }
                else {
                    return (0, index_1.createException)("Them san pham bi loi");
                }
            }
        }
    }
    catch (e) {
        await connection.query(`rollback`);
        throw (0, index_1.createException)(e);
    }
}
exports.addItemToCart = addItemToCart;
async function isItemInTempCart(productId, sessionId) {
    try {
        const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
        let result = await connection.query(`select count(*)
                                             from "CartItem"
                                             where productid = ${productId}
                                               and sessionid = ${sessionId}`);
        if (result.rows[0].count == 0) {
            return (0, index_1.createResult)(false);
        }
        else {
            return (0, index_1.createResult)(true);
        }
    }
    catch (e) {
        throw (0, index_1.createException)(e);
    }
}
exports.isItemInTempCart = isItemInTempCart;
async function removeItemFromCart(itemId, sessionId) {
    const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
    try {
        await connection.query(`begin`);
        const result = await connection.query(`delete
                                               from "CartItem"
                                               where id = ${itemId}
                                                 and sessionid = ${sessionId}`);
        await connection.query(`commit`);
        if (result.rowCount === 1) {
            return (0, index_1.createResult)(true);
        }
        else {
            return (0, index_1.createException)("Khong tim thay ID");
        }
    }
    catch (e) {
        await connection.query(`rollback`);
        throw (0, index_1.createException)(e);
    }
}
exports.removeItemFromCart = removeItemFromCart;
async function updateCartItem(userId, sessionId, productId, quantity, size, note) {
    const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
    try {
        const productQuantity = await connection.query(`select quantity
                                                        from "Product"
                                                        where id = ${productId}`);
        if (productQuantity.rows.length === 0) {
            return (0, index_1.createException)("Khong tim thay san pham co ID la " + productId);
        }
        else {
            if (quantity > productQuantity.rows[0].quantity) {
                return (0, index_1.createException)("So luong khong hop le! Kho con " + productQuantity.rows[0].quantity + ", so luong nhap: " + quantity);
            }
            await connection.query(`begin`);
            let result = await connection.query(`update "CartItem"
                                                 set quantity = ${quantity},
                                                     size     = '${size}',
                                                     note     = '${note}'
                                                 where sessionid = ${sessionId}
                                                   and productid = ${productId}
            `);
            await connection.query(`commit`);
            if (result.rowCount != 0) {
                return (0, index_1.createResult)(true);
            }
            else {
                throw (0, index_1.createException)("Khong the cap nhat! Xem lai session ID");
            }
        }
    }
    catch (e) {
        await connection.query(`rollback`);
        throw (0, index_1.createException)(e);
    }
}
exports.updateCartItem = updateCartItem;
async function getCartItems(userId, sessionId) {
    try {
        const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
        const result = await connection.query(`select "CartItem".id               as "id",
                                                      sessionid                   as "sessionId",
                                                      productid                   as "productId",
                                                      "CartItem".quantity         as "quantity",
                                                      P.name                      as "productName",
                                                      P.description               as "description",
                                                      price * "CartItem".quantity as total,
                                                      P.price                     as price,
                                                      "ProductCategory".name      as "productCategoryName",
                                                      "CartItem".size             as "size",
                                                      P.displayimage              as "displayImage",
                                                      discountid                  as "discountId",
                                                      price * "CartItem".quantity as "priceBeforeDiscount",
                                                      price * "CartItem".quantity -
                                                      round((price * "CartItem".quantity * coalesce("Discount".discountpercent, 0)) /
                                                            100)                  as "priceAfterDiscount",
                                                      note                        as "note"
                                               from "CartItem"
                                                        inner join "ShoppingSession" on "CartItem".sessionid = "ShoppingSession".id
                                                        inner join "Product" P on P.id = "CartItem".productid
                                                        inner join "ProductCategory" on P.categoryid = "ProductCategory".id
                                                        left outer join "Discount" on P.discountid = "Discount".id

                                               where sessionid = ${sessionId}
                                                 and userid = ${userId};
        `);
        return (0, index_1.createResult)(result.rows);
    }
    catch (e) {
        throw (0, index_1.createException)(e);
    }
}
exports.getCartItems = getCartItems;
