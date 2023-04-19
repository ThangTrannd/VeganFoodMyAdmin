import {Pool} from "pg";
import {PostgreSQLConfig} from "../config/posgre";
import {createException, createResult} from "./index";
import {differenceInDays} from "date-fns";

export async function getBestSellerProducts(): Promise<APIResponse<any>> {
    const connection = await new Pool(PostgreSQLConfig);
    try {
        const result = await connection.query(`select productid        as id,
                                                    sum(gr.quantity) as total,
                                                    name,
                                                    displayimage     as "displayImage"
                                            from "OrderItem" gr
                                            inner join "Product" P on P.id = gr.productid
                                            group by gr.quantity, productid, name, displayimage
                                            order by total desc;`);
        return createResult(result.rows);
    } catch (e) {
        throw createException(e);
    }
}

export async function getRunningOutOfStock(): Promise<APIResponse<any>> {
    const connection = await new Pool(PostgreSQLConfig);
    try {
        const result = await connection.query(`select id as id, name as name, quantity as quantity
                                          from "Product"
                                          where quantity <= 10
                                          order by quantity asc `);
        return createResult(result.rows);
    } catch (e) {
        throw createException(e);
    }
}

export async function getLovesProductList(): Promise<APIResponse<any>> {
    const connection = await new Pool(PostgreSQLConfig);
    try {
        return createResult((await connection.query(`select P.id, name, count(P.id) as total
                                                  from "LovedItems"
                                                  inner join "Product" P on P.id = "LovedItems".productid
                                                  group by P.id
                                                  order by total desc;`)).rows);
    } catch (e) {
        return createException(e);
    }
}

export async function getEndDateProductList() {
    const connection = await new Pool(PostgreSQLConfig);
    try {
        await connection.query('update "Product" set active = false  where enddate < now()::timestamp;')
        const results = createResult(
            (await connection.query('select * from "Product" p /*where active = true*/ order by enddate asc')).rows
        );
        // @ts-ignore
        results.result.map((elm) => {
            elm.enddate = differenceInDays(elm.enddate, new Date())
            elm.active = elm.active ? 'Đang Bán' : 'Ngừng bán'
        })
        return results
    } catch (e) {
        return createException(e)
    }
}