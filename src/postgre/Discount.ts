import {PostgreSQLConfig} from "../config/posgre";
import {createException, createResult} from "./index";
import {Pool} from "pg";

export async function createDiscount(discount: Discount): Promise<APIResponse<boolean>> {
    const connect = await new Pool(PostgreSQLConfig)
    try {
        await connect.query(`begin`)
        let result = await connect.query(`insert into "Discount"
                                          values (default,
                                                  '${discount.name}',
                                                  '${discount.description}',
                                                  '${discount.discountPercent}',
                                                  now(),
                                                  true,
                                                  '${discount.displayImage}',
                                                  now())`)
        await connect.query(`commit`)
        return createResult(result.rowCount === 1)
    } catch (e) {
        await connect.query(`rollback`)
        throw createException(e)
    }
}

export async function updateDiscount(oldId: number, discount: Discount): Promise<APIResponse<boolean>> {
    const connect = await new Pool(PostgreSQLConfig)
    try {
        await connect.query(`begin`)
        let result = await connect.query(` update "Discount"
                                           set name            = '${discount.name}',
                                               displayimage    = '${discount.displayImage}',
                                               discountpercent = '${discount.discountPercent}',
                                               description     = '${discount.description}',
                                               modifiedat      = now()
                                           where id = ${oldId}
        `)
        await connect.query(`commit`)
        return createResult(result.rowCount === 1)
    } catch (e) {
        await connect.query(`rollback`)
        return createException(e)
    }
}

export async function updateDiscountWithoutImage(oldId: number, discount: Discount): Promise<APIResponse<boolean>> {
    const connect = await new Pool(PostgreSQLConfig)
    try {
        await connect.query(`begin`)
        let result = await connect.query(` update "Discount"
                                           set name            = '${discount.name}',
                                               discountpercent = '${discount.discountPercent}',
                                               description     = '${discount.description}',
                                               modifiedat      = now()
                                           where id = ${oldId}
        `)
        await connect.query(`commit`)
        return createResult(result.rowCount === 1)
    } catch (e) {
        await connect.query(`rollback`)
        return createException(e)
    }
}

export async function getDiscount(id: number): Promise<APIResponse<Discount>> {
    try {
        const connect = await new Pool(PostgreSQLConfig)
        let result = await connect.query(`select *
                                          from "Discount"
                                          where id = ${id}
                                            and active = true
                                          order by id`)
        if (result.rowCount === 1) {
            return createResult(result.rows[0])
        } else {
            return createException("Khong tim thay ma giam gia");
        }
    } catch (e) {
        return createException(e)
    }
}

export async function deleteDiscount(id: number): Promise<APIResponse<boolean>> {
    console.log(id)
    const connect = await new Pool(PostgreSQLConfig)
    try {
        await connect.query(`begin`)
        let result = await connect.query(`update "Discount" set active = false
                                          where id = ${id}`)
        await connect.query(`commit`)
        return createResult(result.rowCount == 1)
    } catch (e) {
        await connect.query(`rollback`)
        throw createException(e)
    }
}

export async function getDiscounts(): Promise<APIResponse<Discount[]>> {
    const connect = await new Pool(PostgreSQLConfig)
    try {
        await connect.query(`begin`)
        let result = await connect.query(`select *
                                          from "Discount"`)
        result.rows.map(item => {
            item.createat = new Date(item.createat).toLocaleString()
            item.modifiedat = new Date(item.modifiedat).toLocaleString()
        })
        await connect.query(`commit`)
        console.log("DISCOUNT 1", result.rows)
        return createResult(result.rows)
    } catch (e) {
        await connect.query(`rollback`)
        return createException(e)
    }
}
