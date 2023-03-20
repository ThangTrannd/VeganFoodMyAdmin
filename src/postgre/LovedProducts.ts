import {Pool} from "pg";
import {PostgreSQLConfig} from "../config/posgre";
import {createException, createResult} from "./index";

export async function getLovedItems(userId: number): Promise<APIResponse<LovedProduct[]>> {
    try {
        const connection = await new Pool(PostgreSQLConfig)
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
        ;`)
        result.rows.map(item => {
            item.size = item.size.split(",").filter((it: string) => it != "").join(",")
        })
        return createResult(result.rows)
    } catch (e) {
        return createException(e)
    }
}

export async function addLovedItem(userId: number, productId: number): Promise<APIResponse<boolean>> {
    const connection = await new Pool(PostgreSQLConfig)
    try {
        if ((await isItemAlreadyInList(userId, productId))) {
            return createException("San pham nay da co trong list")
        }
        await connection.query(`begin`)
        let result = await connection.query(`insert into "LovedItems" (id, useid, productid)
                                             values (default, ${userId}, ${productId})`)
        await connection.query(`commit`)
        return createResult(result.rowCount != 0)
    } catch (e) {
        await connection.query(`rollback`)
        return createException(e)
    }
}

export async function deleteLovedItem(userId: number, productId: number): Promise<APIResponse<boolean>> {
    const connection = await new Pool(PostgreSQLConfig)
    try {
        await connection.query(`begin`)
        let _isItemInList = await isItemAlreadyInList(userId, productId)
        if (!_isItemInList) {
            return createException("San pham nay chua co trong list")
        }
        let result = await connection.query(`delete
                                             from "LovedItems"
                                             where userid = ${userId}
                                               and productid = ${productId}`)
        await connection.query(`commit`)
        if (result.rowCount == 0) {
            return createException("Khong tim thay item ID")
        } else {
            return createResult(true)
        }
    } catch (e) {
        await connection.query(`rollback`)
        return createException(e)
    }
}

async function isItemAlreadyInList(userId: number, productId: number): Promise<boolean> {
    try {
        const connection = await new Pool(PostgreSQLConfig)
        const result = await connection.query(`select *
                                               from "LovedItems"
                                               where userid = ${userId}
                                                 and productid = ${productId}`)
        return result.rows.length == 1
    } catch (e) {
        return false;
    }
}


export async function isUserLovedProduct(userId: number, productId: number): Promise<APIResponse<boolean>> {
    try {
        const connection = await new Pool(PostgreSQLConfig)
        let result = await connection.query(`select *
                                             from "LovedItems"
                                             where userid = ${userId}
                                               and productid = ${productId}`)
        return createResult(result.rowCount != 0)
    } catch (e) {
        return createException(e)
    }
}
