"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reOrder = exports.userCancelOrder = exports.deleteOrder = exports.getUserCurrentOrder = exports.getOrders = exports.createEmptyOrder = exports.adminGetItemsInOrder = exports.getItemsInOrder = exports.adminGetOrderDetails = exports.getOrderDetail = exports.getUserCompletedOrders = exports.getUserOrders = exports.updateProductInventory = exports.confirmOrder = void 0;
const pg_1 = require("pg");
const posgre_1 = require("../config/posgre");
const index_1 = require("./index");
const PaymentDetails_1 = require("./PaymentDetails");
const OrderItem_1 = require("./OrderItem");
const ShoppingSession_1 = require("./ShoppingSession");
/* Move temporary cart to order details, cuz ppl confirmed buying */
async function confirmOrder(userId, sessionId, provider, phoneNumber, address, note) {
    try {
        if (note == undefined) {
            note = "";
        }
        /*Check if session exist?*/
        const _isSessionExist = await (0, ShoppingSession_1.getUserSessionId)(userId);
        if (!_isSessionExist.isSuccess) {
            return (0, index_1.createException)("Gio hang khong ton tai!");
        }
        // let userCurrentOrder = await getUserCurrentOrder(userId)
        // if (userCurrentOrder.result != null) {
        //     return createException("Bạn có đơn hàng chưa hoàn thành nên chưa thể tiếp tục đặt đơn")
        // }
        const orderId = await createOrder(userId, sessionId, provider, phoneNumber, address, note);
        await (0, index_1.deleteShoppingSession)(userId, sessionId);
        await updateProductInventory(orderId, userId);
        return (0, index_1.createResult)(true);
    }
    catch (e) {
        console.log(e);
        throw (0, index_1.createException)(e);
    }
}
exports.confirmOrder = confirmOrder;
async function updateProductInventory(orderId, userId) {
    const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
    try {
        await connection.query("begin");
        const productsId = await connection.query(`select productid, quantity
                                              from "OrderDetail"
                                              inner join "OrderItem" OI on "OrderDetail".id = OI.orderid
                                              where orderid = ${orderId}
                                              and userid = ${userId};`);
        for (const item of productsId.rows) {
            await connection.query(`update "Product"
                                    set quantity = quantity - ${item.quantity}
                                    where id = ${item.productid}`);
        }
        await connection.query("commit");
    }
    catch (e) {
        console.log(e);
        await connection.query("rollback");
        throw (0, index_1.createException)("Không thể cập nhật số luợng sản phẩm trong kho");
    }
}
exports.updateProductInventory = updateProductInventory;
async function createOrder(userId, sessionId, provider, phoneNumber, address, note) {
    try {
        const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
        const orderId = await createEmptyOrder(userId);
        const paymentId = await (0, PaymentDetails_1.createPaymentDetail)(orderId, provider, "Đợi xác nhận", phoneNumber, address, note);
        await updatePaymentId(orderId, paymentId);
        await (0, OrderItem_1.addCartItemsToOrder)(orderId, sessionId, userId);
        return orderId;
    }
    catch (e) {
        throw (0, index_1.createException)(e);
    }
}
async function updatePaymentId(orderId, paymentId) {
    const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
    try {
        await connection.query("begin");
        await connection.query(`update "OrderDetail"
                                set paymentid = ${paymentId}
                                where id = ${orderId}`);
        await connection.query("commit");
    }
    catch (e) {
        await connection.query("rollback");
        throw (0, index_1.createException)(e);
    }
}
async function getUserOrders(userId) {
    try {
        const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
        const result = await connection.query(`select "OrderDetail".id,
                                                    round(total)              as total,
                                                    "OrderDetail".createat,
                                                    status,
                                                    provider,
                                                    address,
                                                    phonenumber               as "phoneNumber",
                                                    sum("OrderItem".quantity) as "totalProduct",
                                                    displayimage              as "displayImage"
                                          from "OrderDetail"
                                          inner join "PaymentDetails" PD on PD.id = "OrderDetail".paymentid
                                          inner join "OrderItem" on "OrderDetail".id = "OrderItem".orderid
                                          inner join "Product" P on "OrderItem".productid = P.id
                                          where userid = ${userId}
                                          group by "OrderDetail".id, total, "OrderDetail".createat, status, provider, address, "phoneNumber", displayimage
                                          order by createat desc;`);
        result.rows.map(item => {
            item.createat = new Date(item.createat).toLocaleString("vi-VN");
        });
        return (0, index_1.createResult)(result.rows);
    }
    catch (e) {
        return (0, index_1.createException)(e);
    }
}
exports.getUserOrders = getUserOrders;
async function getUserCompletedOrders(userId) {
    try {
        const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
        const result = await connection.query(`select "OrderDetail".id,
                                                    round(total)              as total,
                                                    "OrderDetail".createat,
                                                    status,
                                                    provider,
                                                    address,
                                                    phonenumber               as "phoneNumber",
                                                    sum("OrderItem".quantity) as "totalProduct",
                                                    displayimage              as "displayImage"
                                            from "OrderDetail"
                                                      inner join "PaymentDetails" PD on PD.id = "OrderDetail".paymentid
                                                      inner join "OrderItem" on "OrderDetail".id = "OrderItem".orderid
                                                      inner join "Product" P on P.id = "OrderItem".productid
                                            where userid = ${userId}
                                            and (status like 'Bị hủy' or status like 'Hoàn thành')
                                            group by "OrderDetail".id, total, "OrderDetail".createat, status, provider,
                                                      address, "phoneNumber"
                                            order by createat desc;`);
        result.rows.map(item => {
            item.createat = new Date(item.createat).toLocaleString("vi-VN");
        });
        return (0, index_1.createResult)(result.rows);
    }
    catch (e) {
        return (0, index_1.createException)(e);
    }
}
exports.getUserCompletedOrders = getUserCompletedOrders;
async function getOrderDetail(userId, orderId) {
    try {
        const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
        const result = await connection.query(`select "OrderDetail".id,
                                                      round(total)              as total,
                                                      "OrderDetail".createat,
                                                      status,
                                                      provider,
                                                      address,
                                                      phonenumber               as "phoneNumber",
                                                      sum("OrderItem".quantity) as "totalProduct",
                                                      PD.note                   as "note",
                                                      displayimage              as "displayImage"
                                              from "OrderDetail"
                                                        inner join "PaymentDetails" PD on PD.id = "OrderDetail".paymentid
                                                        inner join "OrderItem" on "OrderDetail".id = "OrderItem".orderid
                                                        inner join "Product" P on P.id = "OrderItem".productid
                                              where userid = ${userId}
                                              and "OrderDetail".id = ${orderId}
                                              group by "OrderDetail".id, total, "OrderDetail".createat, status,
                                                        provider,
                                                        address, "phoneNumber", PD.note, displayimage
                                              order by createat desc;`);
        if (result.rowCount != 1) {
            return (0, index_1.createException)("Khong tim thay order " + orderId);
        }
        else {
            return (0, index_1.createResult)(result.rows[0]);
        }
    }
    catch (e) {
        throw (0, index_1.createException)(e);
    }
}
exports.getOrderDetail = getOrderDetail;
async function adminGetOrderDetails(orderId) {
    try {
        const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
        const result = await connection.query(`select "OrderDetail".id,
                                                      round(total)  as total,
                                                      "OrderDetail".createat,
                                                      status,
                                                      provider,
                                                      address,
                                                      phonenumber   as "phoneNumber",
                                                      sum(quantity) as "totalProduct"
                                          from "OrderDetail"
                                            inner join "PaymentDetails" PD on PD.id = "OrderDetail".paymentid
                                            inner join "OrderItem" on "OrderDetail".id = "OrderItem".orderid
                                          where "OrderDetail".id = ${orderId}
                                          group by "OrderDetail".id, total, "OrderDetail".createat, status,
                                                        provider,
                                                        address, "phoneNumber"
                                          order by createat desc;`);
        if (result.rowCount != 1) {
            return (0, index_1.createException)("Khong tim thay order " + orderId);
        }
        else {
            return (0, index_1.createResult)(result.rows[0]);
        }
    }
    catch (e) {
        return (0, index_1.createException)(e);
    }
}
exports.adminGetOrderDetails = adminGetOrderDetails;
async function getItemsInOrder(orderId, userId) {
    try {
        const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
        const result = await connection.query(`select "OrderItem".id               as "id",
                                                    orderid                      as "orderId",
                                                    productid                    as "productId",
                                                    "OrderItem".quantity         as "quantity",
                                                    P.name                       as "productName",
                                                    P.description                as "description",
                                                    price * "OrderItem".quantity as total,
                                                    P.price                      as price,
                                                    "ProductCategory".name       as "productCategoryName",
                                                    P.displayimage               as "displayImage",
                                                    "OrderItem".size             as "size",
                                                    round(pricebeforediscount)          as "priceBeforeDiscount",
                                                    round(priceafterdiscount)           as "priceAfterDiscount",
                                                    note                         as "note"
                                            from "OrderItem"
                                              inner join "Product" P on P.id = "OrderItem".productid
                                              inner join "ProductCategory" on P.categoryid = "ProductCategory".id
                                              inner join "OrderDetail" on "OrderItem".orderid = "OrderDetail".id
                                            where orderid = ${orderId}
                                            and userid = ${userId};`);
        return (0, index_1.createResult)(result.rows);
    }
    catch (e) {
        return (0, index_1.createException)(e);
    }
}
exports.getItemsInOrder = getItemsInOrder;
async function adminGetItemsInOrder(orderId) {
    try {
        const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
        const result = await connection.query(`select "OrderItem".id               as "id",
                                                    orderid                      as "orderId",
                                                    productid                    as "productId",
                                                    "OrderItem".quantity         as "quantity",
                                                    P.name                       as "productName",
                                                    P.description                as "description",
                                                    price * "OrderItem".quantity as total,
                                                    P.price                      as price,
                                                    "ProductCategory".name       as "productCategoryName",
                                                    P.displayimage               as "displayImage",
                                                    "OrderItem".size             as "size",
                                                    round(pricebeforediscount)   as "priceBeforeDiscount",
                                                    round(priceafterdiscount)    as "priceAfterDiscount",
                                                    note                         as "note"
                                            from "OrderItem"
                                              inner join "Product" P on P.id = "OrderItem".productid
                                              inner join "ProductCategory" on P.categoryid = "ProductCategory".id
                                              inner join "OrderDetail" on "OrderItem".orderid = "OrderDetail".id
                                            where orderid = ${orderId}`);
        const numberFormatter = Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });
        result.rows.map(item => {
            item.price = numberFormatter.format(Number(item.price));
            item.priceBeforeDiscount = numberFormatter.format(Number(item.priceBeforeDiscount));
            item.priceAfterDiscount = numberFormatter.format(Number(item.priceAfterDiscount));
        });
        return (0, index_1.createResult)(result.rows);
    }
    catch (e) {
        return (0, index_1.createException)(e);
    }
}
exports.adminGetItemsInOrder = adminGetItemsInOrder;
async function createEmptyOrder(userId) {
    const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
    try {
        await connection.query("begin");
        const result = await connection.query(`insert into "OrderDetail" (id, userid, total, paymentid, createat, modifiedat)
                                          values (default, ${userId}, 0, 0, now(), now())
                                          returning id`);
        await connection.query("commit");
        return result.rows[0].id;
    }
    catch (e) {
        await connection.query("rollback");
        throw (0, index_1.createException)(e);
        return 0;
    }
}
exports.createEmptyOrder = createEmptyOrder;
async function getOrders(type) {
    try {
        const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
        let orders;
        if (type == null) {
            orders = await connection.query(`select "OrderItem".orderid        as "orderId",
                                                    PD.id                      as "paymentId",
                                                    U.name                     as "username",
                                                    U.id                       as "userId",
                                                    PD.phonenumber             as "phoneNumber",
                                                    status                     as "status",
                                                    P.name                     as "productName",
                                                    round(pricebeforediscount) as "priceBeforeDiscount",
                                                    round(priceafterdiscount)  as "priceAfterDiscount",
                                                    "OrderItem".quantity       as "quantity",
                                                    PD.address                 as "address",
                                                    PD.modifiedat              as "time",
                                                    "OrderItem".note           as "note",
                                                    provider                   as "provider"
                                        from "OrderItem"
                                          inner join "Product" P on P.id = "OrderItem".productid
                                          inner join "ProductCategory" on P.categoryid = "ProductCategory".id
                                          inner join "OrderDetail" on "OrderItem".orderid = "OrderDetail".id
                                          inner join "User" U on U.id = "OrderDetail".userid
                                          inner join "PaymentDetails" PD on PD.id = "OrderDetail".paymentid
                                        where "OrderItem".orderid in (
                                          select "OrderDetail".id
                                          from "OrderDetail"
                                            inner join "PaymentDetails" PD on PD.id = "OrderDetail".paymentid
                                            inner join "OrderItem" on "OrderDetail".id = "OrderItem".orderid)
                                            order by PD.modifiedat desc `);
        }
        else {
            orders = await connection.query(`select "OrderItem".orderid        as "orderId",
                                                    PD.id                      as "paymentId",
                                                    U.name                     as "username",
                                                    U.id                       as "userId",
                                                    PD.phonenumber             as "phoneNumber",
                                                    status                     as "status",
                                                    P.name                     as "productName",
                                                    round(pricebeforediscount) as "priceBeforeDiscount",
                                                    round(priceafterdiscount)  as "priceAfterDiscount",
                                                    "OrderItem".quantity       as "quantity",
                                                    PD.address                 as "address",
                                                    PD.modifiedat              as "time",
                                                    "OrderItem".note           as "note",
                                                    provider                   as "provider"
                                      from "OrderItem"
                                        inner join "Product" P on P.id = "OrderItem".productid
                                        inner join "ProductCategory" on P.categoryid = "ProductCategory".id
                                        inner join "OrderDetail" on "OrderItem".orderid = "OrderDetail".id
                                        inner join "User" U on U.id = "OrderDetail".userid
                                        inner join "PaymentDetails" PD on PD.id = "OrderDetail".paymentid
                                      where "OrderItem".orderid in (select "OrderDetail".id
                                                                    from "OrderDetail"
                                                                      inner join "PaymentDetails" PD on PD.id = "OrderDetail".paymentid
                                                                      inner join "OrderItem" on "OrderDetail".id = "OrderItem".orderid
                                                                      where PD.status = '${type}')
                                                                      order by PD.modifiedat desc `);
        }
        const numberFormatter = Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });
        const map = new Map();
        for (const element of orders.rows) {
            if (map.get(element.orderId) == undefined) {
                map.set(element.orderId, {
                    username: element.username,
                    phoneNumber: element.phoneNumber,
                    status: element.status,
                    productName: [element.productName],
                    orderId: element.orderId,
                    paymentId: element.paymentId,
                    priceBeforeDiscount: numberFormatter.format(Number(element.priceBeforeDiscount)),
                    priceAfterDiscount: numberFormatter.format(Number(element.priceAfterDiscount)),
                    quantity: element.quantity,
                    address: element.address,
                    time: element.time,
                    userId: element.userId,
                    note: element.note,
                    provider: element.provider
                });
            }
            else {
                const temp = map.get(element.orderId);
                const array = temp.productName;
                array.push(element.productName);
                map.set(element.orderId, {
                    username: element.username,
                    phoneNumber: element.phoneNumber,
                    status: element.status,
                    productName: array,
                    orderId: element.orderId,
                    paymentId: element.paymentId,
                    address: element.address,
                    time: element.time,
                    userId: element.userId,
                    note: element.note,
                    provider: element.provider
                });
            }
        }
        const dumpResult = [];
        for (const [key, value] of map) {
            const tempObj = {};
            tempObj.orderId = key;
            tempObj.username = value.username;
            tempObj.status = value.status;
            tempObj.items = value.productName;
            tempObj.phoneNumber = value.phoneNumber;
            const detail = await adminGetItemsInOrder(key);
            const total = await adminGetOrderDetails(key);
            tempObj.total = numberFormatter.format(Number(total.result.total));
            tempObj.detail = detail.result;
            tempObj.address = value.address;
            tempObj.paymentId = value.paymentId;
            tempObj.time = value.time;
            tempObj.userId = value.userId;
            tempObj.note = value.note;
            tempObj.provider = value.provider;
            dumpResult.push(tempObj);
        }
        connection.end();
        dumpResult.map(element => {
            element.time = new Date(element.time).toLocaleString("vi-VN");
        });
        return (0, index_1.createResult)(dumpResult);
    }
    catch (e) {
        return (0, index_1.createException)(e);
    }
}
exports.getOrders = getOrders;
async function getUserCurrentOrder(userId) {
    try {
        const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
        const result = await connection.query(`select orderid     as "orderId",
                                                    round(total)  as "total",
                                                    paymentid     as "paymentId",
                                                    PD.createat   as "createAt",
                                                    PD.modifiedat as "modifiedAt",
                                                    status        as "status",
                                                    provider      as "provider",
                                                    address       as "address",
                                                    phonenumber   as "phoneNumber"
                                          from "OrderDetail"
                                          inner join "PaymentDetails" PD on PD.id = "OrderDetail".paymentid
                                          where userid = ${userId}
                                          and (status = 'Đợi xác nhận' or status = 'Đang giao')
                                          order by PD.modifiedat desc;`);
        if (result.rows.length == 0) {
            return (0, index_1.createException)("Bạn hiện tại chưa có đơn hàng nào!");
        }
        return (0, index_1.createResult)(result.rows[0]);
    }
    catch (e) {
        return (0, index_1.createException)(e);
    }
}
exports.getUserCurrentOrder = getUserCurrentOrder;
async function deleteOrder(orderId, paymentId) {
    const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
    try {
        await connection.query("begin");
        await connection.query(`delete
                                from "OrderDetail"
                                where id = ${orderId}
                                  and paymentid = ${paymentId}`);
        await connection.query(`delete
                                from "PaymentDetails"
                                where id = ${paymentId}`);
        await connection.query("commit");
    }
    catch (e) {
        await connection.query("rollback");
    }
}
exports.deleteOrder = deleteOrder;
async function getPaymentId(orderId) {
    try {
        const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
        const result = await connection.query(`select paymentid as "paymentId"
                                          from "OrderDetail"
                                          where id = ${orderId}
                                          limit 1`);
        if (result.rowCount != 1) {
            return null;
        }
        connection.end();
        return result.rows[0].paymentId;
    }
    catch (e) {
        return null;
    }
}
async function userCancelOrder(userId, orderId) {
    const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
    try {
        const paymentId = await getPaymentId(orderId);
        if (paymentId == null) {
            return (0, index_1.createException)("Không tìm thấy order của bạn");
        }
        await connection.query("begin");
        const result = await connection.query(`update "PaymentDetails"
                                          set status     = 'Bị hủy',
                                          modifiedat = now()
                                          where id = ${paymentId}
                                          and orderid = ${orderId}
                                          and status like 'Đợi xác nhận'`);
        await connection.query("commit");
        if (result.rowCount != 1) {
            return (0, index_1.createException)("Bạn không thể hủy đơn này!");
        }
        return (0, index_1.createResult)("Hủy thành công!");
    }
    catch (e) {
        await connection.query("rollback");
        return (0, index_1.createException)(e);
    }
}
exports.userCancelOrder = userCancelOrder;
/*Experimental*/
async function reOrder(userId, orderId, note) {
    try {
        if (note == undefined) {
            note = "";
        }
        /*Check if session exist?*/
        await (0, index_1.createShoppingSession)(userId);
        const shoppingSessionId = ((await (0, ShoppingSession_1.getUserSessionId)(userId)).result.id);
        const userCurrentOrder = await getUserCurrentOrder(userId);
        if (userCurrentOrder.result != null) {
            await (0, index_1.deleteShoppingSession)(userId, shoppingSessionId);
            return (0, index_1.createException)("Bạn có đơn hàng chưa hoàn thành nên chưa thể tiếp tục đặt đơn");
        }
        /*ADD PRODUCT TO SESSION*/
        const items = (await getItemsInOrder(orderId, userId)).result;
        for (const item of items) {
            await (0, index_1.addItemToCart)(userId, shoppingSessionId, item.productId, item.quantity, item.size, item.note);
        }
        // create order
        const orderDetail = (await getOrderDetail(userId, orderId)).result;
        const info = await createOrder(userId, shoppingSessionId, orderDetail.provider, orderDetail.phoneNumber, orderDetail.address, note);
        await (0, index_1.deleteShoppingSession)(userId, shoppingSessionId);
        await updateProductInventory(info, userId);
        return (0, index_1.createResult)("Đặt hàng lại thành công!");
    }
    catch (e) {
        console.log(e);
        return (0, index_1.createException)("Có lỗi khi đặt lại đơn hàng, kiểm tra lại!");
    }
}
exports.reOrder = reOrder;
