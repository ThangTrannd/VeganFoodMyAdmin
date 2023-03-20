import {Pool} from "pg";
import {PostgreSQLConfig} from "../config/posgre";
import {addItemToCart, createException, createResult, createShoppingSession, deleteShoppingSession} from "./index";
import {createPaymentDetail, updatePaymentDetailStatus} from "./PaymentDetails";
import {addCartItemsToOrder} from "./OrderItem";
import {getUserSessionId} from "./ShoppingSession";
import {getUserTokenDevice} from "./User";
import {sendNotification} from "../routes/NotificationRoute";

/* Move temporary cart to order details, cuz ppl confirmed buying */

export async function confirmOrder(userId: number, sessionId: number, provider: string, phoneNumber: string, address: string, note?: string | null): Promise<APIResponse<boolean>> {
    try {
        if (note == undefined) {
            note = ""
        }
        /*Check if session exist?*/
        let _isSessionExist = await getUserSessionId(userId)
        if (!_isSessionExist.isSuccess) {
            return createException("Gio hang khong ton tai!")
        }
        let userCurrentOrder = await getUserCurrentOrder(userId)
        if (userCurrentOrder.result != null) {
            return createException("Bạn có đơn hàng chưa hoàn thành nên chưa thể tiếp tục đặt đơn")
        }
        console.log("Enter create order")
        let orderId = await createOrder(userId, sessionId, provider, phoneNumber, address, note)
        console.log("End create order")
        await deleteShoppingSession(userId, sessionId)
        await updateProductInventory(orderId, userId)
        return createResult(true)
    } catch (e) {
        console.log(e)
        throw createException(e)
    }
}

export async function updateProductInventory(orderId: number, userId: number) {
    const connection = await new Pool(PostgreSQLConfig)
    try {
        console.log("UPDATING INVENTORY")
        await connection.query(`begin`)
        let productsId = await connection.query(`select productid, quantity
                                                 from "OrderDetail"
                                                          inner join "OrderItem" OI on "OrderDetail".id = OI.orderid
                                                 where orderid = ${orderId}
                                                   and userid = ${userId};`)
        for (let item of productsId.rows) {
            await connection.query(`update "Product"
                                    set quantity = quantity - ${item.quantity}
                                    where id = ${item.productid}`)
        }
        await connection.query(`commit`)
    } catch (e) {
        console.log(e)
        await connection.query(`rollback`)
        throw createException("Không thể cập nhật số luợng sản phẩm trong kho")
    }
}

async function createOrder(userId: number, sessionId: number, provider: string, phoneNumber: string, address: string, note: string): Promise<number> {
    try {
        const connection = await new Pool(PostgreSQLConfig)
        let orderId = await createEmptyOrder(userId)
        let paymentId = await createPaymentDetail(orderId, provider, "Đợi xác nhận", phoneNumber, address, note)
        await updatePaymentId(orderId, paymentId)
        await addCartItemsToOrder(orderId, sessionId, userId)
        return orderId
    } catch (e) {
        throw createException(e)
    }
}

async function updatePaymentId(orderId: number, paymentId: number) {
    const connection = await new Pool(PostgreSQLConfig)
    try {
        await connection.query(`begin`)
        await connection.query(`update "OrderDetail"
                                set paymentid = ${paymentId}
                                where id = ${orderId}`)
        await connection.query(`commit`)
    } catch (e) {
        await connection.query(`rollback`)
        throw createException(e)
    }

}

export async function getUserOrders(userId: number): Promise<APIResponse<Order[]>> {
    try {
        const connection = await new Pool(PostgreSQLConfig)
        let result = await connection.query(`select "OrderDetail".id,
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
                                             group by "OrderDetail".id, total, "OrderDetail".createat, status, provider,
                                                      address, "phoneNumber", displayimage
                                             order by createat desc;`)
        result.rows.map(item => {
            item.createat = new Date(item.createat).toLocaleString("vi-VN")
        })
        return createResult(result.rows)
    } catch (e) {
        return createException(e)
    }
}

export async function getUserCompletedOrders(userId: number): Promise<APIResponse<Order[]>> {
    try {
        const connection = await new Pool(PostgreSQLConfig)
        let result = await connection.query(`select "OrderDetail".id,
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
                                             order by createat desc;`)
        result.rows.map(item => {
            item.createat = new Date(item.createat).toLocaleString("vi-VN")
        })
        return createResult(result.rows)
    } catch (e) {
        return createException(e)
    }
}


export async function getOrderDetail(userId: number, orderId: number): Promise<APIResponse<Order>> {
    try {
        const connection = await new Pool(PostgreSQLConfig)
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
                                               order by createat desc;`)
        if (result.rowCount != 1) {
            return createException("Khong tim thay order " + orderId)
        } else {
            return createResult(result.rows[0])
        }
    } catch (e) {
        throw createException(e)
    }
}

export async function adminGetOrderDetails(orderId: number): Promise<APIResponse<any>> {
    try {
        const connection = await new Pool(PostgreSQLConfig)
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
                                               order by createat desc;`)
        if (result.rowCount != 1) {
            return createException("Khong tim thay order " + orderId)
        } else {
            return createResult(result.rows[0])
        }
    } catch (e) {
        return createException(e)
    }
}

export async function getItemsInOrder(orderId: number, userId: number): Promise<APIResponse<OrderItem[]>> {
    try {
        const connection = await new Pool(PostgreSQLConfig)
        let result = await connection.query(`select "OrderItem".id               as "id",
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
                                               and userid = ${userId};`)
        return createResult(result.rows)
    } catch (e) {
        return createException(e)
    }
}

export async function adminGetItemsInOrder(orderId: number): Promise<APIResponse<any>> {
    try {
        const connection = await new Pool(PostgreSQLConfig)
        let result = await connection.query(`select "OrderItem".id               as "id",
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
                                             where orderid = ${orderId}`)
        const numberFormatter = Intl.NumberFormat('vi-VN', {style: "currency", currency: "VND"})
        result.rows.map(item => {
            item.price = numberFormatter.format(Number(item.price))
            item.priceBeforeDiscount = numberFormatter.format(Number(item.priceBeforeDiscount))
            item.priceAfterDiscount = numberFormatter.format(Number(item.priceAfterDiscount))
        });
        console.log(result.rows)
        return createResult(result.rows)
    } catch (e) {
        return createException(e)
    }
}

export async function createEmptyOrder(userId: number): Promise<any> {
    const connection = await new Pool(PostgreSQLConfig)
    try {
        await connection.query(`begin`)
        let result = await connection.query(`insert into "OrderDetail" (id, userid, total, paymentid, createat, modifiedat)
                                             values (default, ${userId}, 0, null, now(), now())
                                             returning id`)
        await connection.query(`commit`)
        return result.rows[0].id
    } catch (e) {
        await connection.query(`rollback`)
        throw createException(e)
        return 0
    }
}


export async function getOrders(type: string | null): Promise<APIResponse<any>> {
    try {
        if (type == null) type = "%%"
        const connection = await new Pool(PostgreSQLConfig)

        let orders = await connection.query(`select "OrderItem".orderid        as "orderId",
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
                                                                                    inner join "OrderItem" on "OrderDetail".id = "OrderItem".orderid)
                                             order by PD.modifiedat desc `)
        const numberFormatter = Intl.NumberFormat('vi-VN', {style: "currency", currency: "VND"})
        const map = new Map()
        for (let element of orders.rows) {
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
                })
            } else {
                let temp = map.get(element.orderId)
                let array = temp.productName
                array.push(element.productName)
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
                })
            }
        }

        let dumpResult = []
        for (let [key, value] of map) {
            let tempObj: any = {}
            tempObj.orderId = key
            tempObj.username = value.username
            tempObj.status = value.status
            tempObj.items = value.productName
            tempObj.phoneNumber = value.phoneNumber
            let detail = await adminGetItemsInOrder(key)
            let total = await adminGetOrderDetails(key)
            tempObj.total = numberFormatter.format(Number(total.result.total))
            tempObj.detail = detail.result
            tempObj.address = value.address
            tempObj.paymentId = value.paymentId
            tempObj.time = value.time
            tempObj.userId = value.userId
            tempObj.note = value.note
            tempObj.provider = value.provider
            dumpResult.push(tempObj)
        }
        connection.end()

        dumpResult.map(element => {
            element.time = new Date(element.time).toLocaleString("vi-VN")
        })
        return createResult(dumpResult)
    } catch (e) {
        return createException(e)
    }
}

export async function getUserCurrentOrder(userId: number): Promise<APIResponse<Order>> {
    try {
        const connection = await new Pool(PostgreSQLConfig)
        let result = await connection.query(`select orderidid     as "orderId",
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
                                             order by PD.modifiedat desc;`)
        if (result.rows.length == 0) {
            return createException("Bạn hiện tại chưa có đơn hàng nào!")
        }
        return createResult(result.rows[0])
    } catch (e) {
        return createException(e)
    }
}

export async function deleteOrder(orderId: number, paymentId: number) {
    const connection = await new Pool(PostgreSQLConfig)
    try {
        await connection.query(`begin`)
        await connection.query(`delete
                                from "OrderDetail"
                                where id = ${orderId}
                                  and paymentid = ${paymentId}`)
        await connection.query(`delete
                                from "PaymentDetails"
                                where id = ${paymentId}`)
        await connection.query(`commit`)
    } catch (e) {
        await connection.query(`rollback`)
    }
}

async function getPaymentId(orderId: number): Promise<number | null> {
    try {
        const connection = await new Pool(PostgreSQLConfig)
        const result = await connection.query(`select paymentid as "paymentId"
                                               from "OrderDetail"
                                               where id = ${orderId}
                                               limit 1`)
        if (result.rowCount != 1) {
            return null
        }
        console.log(result.rows)
        connection.end();
        return result.rows[0].paymentId
    } catch (e) {
        return null
    }
}

export async function userCancelOrder(userId: number, orderId: number): Promise<APIResponse<boolean>> {
    const connection = await new Pool(PostgreSQLConfig)
    try {
        let paymentId = await getPaymentId(orderId)
        if (paymentId == null) {
            return createException("Không tìm thấy order của bạn")
        }
        await connection.query(`begin`)
        let result = await connection.query(`update "PaymentDetails"
                                             set status     = 'Bị hủy',
                                                 modifiedat = now()
                                             where id = ${paymentId}
                                               and orderidid = ${orderId}
                                               and status like 'Đợi xác nhận'`)
        await connection.query(`commit`)
        if (result.rowCount != 1) {
            return createException("Bạn không thể hủy đơn này!")
        }
        return createResult("Hủy thành công!")
    } catch (e) {
        await connection.query(`rollback`)
        return createException(e)
    }
}

/*Experimental*/
export async function reOrder(userId: number, orderId: number, note: string): Promise<APIResponse<any>> {
    try {

        if (note == undefined) {
            note = ""
        }
        /*Check if session exist?*/
        await createShoppingSession(userId);
        let shoppingSessionId = ((await getUserSessionId(userId)).result.id);
        console.log(shoppingSessionId)
        let userCurrentOrder = await getUserCurrentOrder(userId)
        if (userCurrentOrder.result != null) {
            await deleteShoppingSession(userId, shoppingSessionId)
            return createException("Bạn có đơn hàng chưa hoàn thành nên chưa thể tiếp tục đặt đơn")
        }
        /*ADD PRODUCT TO SESSION*/
        let items = (await getItemsInOrder(orderId, userId)).result as OrderItem[]
        for (let item of items) {
            await addItemToCart(userId, shoppingSessionId, item.productId, item.quantity, item.size, item.note)
        }

        // create order
        console.log(await getOrderDetail(userId, orderId))
        let orderDetail = (await getOrderDetail(userId, orderId)).result as Order
        console.log(orderDetail)
        let info = await createOrder(userId, shoppingSessionId, orderDetail.provider, orderDetail.phoneNumber, orderDetail.address, note)
        await deleteShoppingSession(userId, shoppingSessionId)
        await updateProductInventory(info, userId)
        return createResult("Đặt hàng lại thành công!")
    } catch (e) {
        console.log(e)
        return createException("Có lỗi khi đặt lại đơn hàng, kiểm tra lại!")
    }


}
