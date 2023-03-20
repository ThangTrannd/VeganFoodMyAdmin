import {Pool} from "pg";
import {PostgreSQLConfig} from "../config/posgre";
import {createException, createResult} from "./index";

/* As we don't know much about PostgreSQL, we cannot create trigger in Postgre, so we decided to use
* javascript as trigger. We know that it's not recommended, but we don't have much time left :<
* By DieuNN */
export async function triggerUpdateSessionTotal(userId: number, sessionId: number) {
    const connection = await new Pool(PostgreSQLConfig)
    try {
        await connection.query(`begin`)
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
                                               and userid = ${userId};`)
        await connection.query(`commit`)
    } catch (e) {
        await connection.query(`rollback`)
    }
    connection.end()
}

export async function isUserHasTempCart(userId: number): Promise<APIResponse<boolean>> {
    try {
        const connection = await new Pool(PostgreSQLConfig)
        let result = await connection.query(`select count(*)
                                             from "ShoppingSession"
                                             where userid = ${userId}`)
        if (result.rows[0].count == 0) {
            return createResult(true)
        } else {
            return createResult(false)
        }
    } catch (e) {
        return createException(e)
    }
}

export async function createShoppingSession(userId: number): Promise<APIResponse<boolean>> {
    const connection = await new Pool(PostgreSQLConfig)
    try {
        const shouldCreateTempCart = await isUserHasTempCart(userId)
        if (shouldCreateTempCart.result === false) {
            return createException("Nguoi dung nay da co gio hang tam thoi!")
        }
        await connection.query(`begin`)
        const result = await connection.query(`insert into "ShoppingSession"
                                               values (default,
                                                       ${userId},
                                                       0,
                                                       now(),
                                                       now())`)
        await connection.query(`commit`)
        return createResult(result.rowCount == 1)
    } catch (e) {
        await connection.query(`rollback`)
        throw createException(e)
    }
}

export async function getCartInfo(userId: number, sessionId: number): Promise<APIResponse<CartInfo>> {
    try {
        const connection = await new Pool(PostgreSQLConfig)
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
                                               and userid = ${userId};`)
        return createResult(result.rows[0])
    } catch (e) {
        throw createException(e)
    }
}

export async function getUserSessionId(userId: number): Promise<APIResponse<number>> {
    try {
        const connection = await new Pool(PostgreSQLConfig)
        const result = await connection.query(`select "ShoppingSession".id
                                               from "ShoppingSession"
                                                        inner join "User" on "ShoppingSession".userid = "User".id
                                               where "User".id = ${userId}`)
        if (result.rowCount != 1) {
            return createException("Nguoi dung chua co gio hang!")
        } else {
            return createResult(result.rows[0])
        }
    } catch (e) {
        throw createException(e)
    }
}

export async function deleteShoppingSession(userId: number, sessionId: number): Promise<APIResponse<boolean>> {
    const connection = await new Pool(PostgreSQLConfig)
    try {
        await connection.query(`begin`)
        const result = await connection.query(`delete
                                               from "ShoppingSession"
                                               where id = ${sessionId}
                                                 and userid = ${userId}`)
        await connection.query(`commit`)
        if (result.rowCount === 1) {
            return createResult(true)
        } else {
            await connection.query(`rollback`)
            // stop here
            throw createException("Khong tim thay userId " + userId + " va sessionId " + sessionId)
        }
    } catch (e) {
        console.log(e)
        await connection.query(`rollback`)
        throw createException(e)
    }
}






