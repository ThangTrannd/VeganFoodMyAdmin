import {Pool} from "pg";
import {PostgreSQLConfig} from "../config/posgre";
import {createException, createResult,} from "./index";
import {triggerUpdateSessionTotal} from "./ShoppingSession";

export async function addItemToCart(userId: number, sessionId: number, productId: number, quantity: number, size: string, note: string): Promise<APIResponse<boolean>> {
    const connection = await new Pool(PostgreSQLConfig)
    try {
        const productQuantity = await connection.query(`select quantity
                                                        from "Product"
                                                        where id = ${productId}`)
        if (productQuantity.rows.length === 0) {
            return createException("Khong thay san pham voi ID la " + productId);
        } else {
            if (quantity > productQuantity.rows[0].quantity) {
                return createException("So luong khong hop le! Kho con " + productQuantity.rows[0].quantity + ", so luong nhap: " + quantity)
            }
            // if item in cart, update quantity
            let _isItemInTempCart = await isItemInTempCart(productId, sessionId)
            if (_isItemInTempCart.result) {
                await updateCartItem(userId, sessionId, productId, quantity, size, note)
                await triggerUpdateSessionTotal(userId, sessionId).then()
                return createResult(true)
            }
            await connection.query(`begin`)
            let insertResult = await connection.query(`insert into "CartItem" (id, sessionid, productid, quantity, size, note)
                                                       values (default,
                                                               ${sessionId},
                                                               ${productId},
                                                               ${quantity},
                                                               '${size}',
                                                               '${note}')
            `)
            await connection.query(`commit`)
            console.log(insertResult)
            if (insertResult.rowCount == 1) {
                await triggerUpdateSessionTotal(userId, sessionId).then()
                return createResult(true)
            } else {
                return createException("Them san pham bi loi")
            }
        }
    } catch (e) {
        await connection.query(`rollback`)
        throw createException(e)
    }
}

export async function isItemInTempCart(productId: number, sessionId: number): Promise<APIResponse<boolean>> {
    try {
        const connection = await new Pool(PostgreSQLConfig)
        let result = await connection.query(`select count(*)
                                             from "CartItem"
                                             where productid = ${productId}
                                               and sessionid = ${sessionId}`)
        if (result.rows[0].count == 0) {
            return createResult(false)
        } else {
            return createResult(true)
        }
    } catch (e) {
        throw createException(e)
    }
}


export async function removeItemFromCart(itemId: number, sessionId: number): Promise<APIResponse<boolean>> {
    const connection = await new Pool(PostgreSQLConfig)
    try {
        await connection.query(`begin`)
        const result = await connection.query(`delete
                                               from "CartItem"
                                               where id = ${itemId}
                                                 and sessionid = ${sessionId}`)
        await connection.query(`commit`)
        if (result.rowCount === 1) {
            return createResult(true)
        } else {
            return createException("Khong tim thay ID")
        }
    } catch (e) {
        await connection.query(`rollback`)
        throw createException(e)
    }
}

export async function updateCartItem(userId: number, sessionId: number, productId: number, quantity: number, size: string, note: string): Promise<APIResponse<boolean>> {
    const connection = await new Pool(PostgreSQLConfig)
    try {

        const productQuantity = await connection.query(`select quantity
                                                        from "Product"
                                                        where id = ${productId}`)
        if (productQuantity.rows.length === 0) {
            return createException("Khong tim thay san pham co ID la " + productId)
        } else {
            if (quantity > productQuantity.rows[0].quantity) {
                return createException("So luong khong hop le! Kho con " + productQuantity.rows[0].quantity + ", so luong nhap: " + quantity)
            }
            await connection.query(`begin`)
            let result = await connection.query(`update "CartItem"
                                                 set quantity = ${quantity},
                                                     size     = '${size}',
                                                     note     = '${note}'
                                                 where sessionid = ${sessionId}
                                                   and productid = ${productId}
            `)
            await connection.query(`commit`)
            if (result.rowCount != 0) {
                return createResult(true)
            } else {
                throw createException("Khong the cap nhat! Xem lai session ID")
            }
        }
    } catch (e) {
        await connection.query(`rollback`)
        throw createException(e)
    }
}

export async function getCartItems(userId: number, sessionId: number): Promise<APIResponse<CartItem[]>> {
    try {
        const connection = await new Pool(PostgreSQLConfig)
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
        `)
        return createResult(result.rows)
    } catch (e) {
        throw createException(e)
    }
}




