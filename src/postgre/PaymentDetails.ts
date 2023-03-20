import {Pool} from "pg";
import {PostgreSQLConfig} from "../config/posgre";
import {createException, createResult} from "./index";

export async function createPaymentDetail(orderId: number, provider: String, status: string, phoneNumber: string, address: string, note: string): Promise<number> {
    const connection = await new Pool(PostgreSQLConfig)
    try {
        await connection.query(`begin`)
        const result = await connection.query(`insert into "PaymentDetails" (id, orderid, amount, status, createat,
                                                                             modifiedat, provider, address,
                                                                             phonenumber, note)
                                               values (default,
                                                       ${orderId},
                                                       0,
                                                       '${status}',
                                                       now(),
                                                       now(),
                                                       '${provider}',
                                                       '${address}',
                                                       '${phoneNumber}', '${note}')
                                               returning id`)
        await connection.query(`commit`)
        return result.rows[0].id
    } catch (e) {
        await connection.query(`rollback`)
        throw createException("Cant create order detail")
    }
}

//
export async function updatePaymentDetailStatus(paymentId: number, orderId: number, status: string): Promise<APIResponse<boolean>> {
    const connection = await new Pool(PostgreSQLConfig)
    try {
        await connection.query(`begin`)
        const result = await connection.query(`update "PaymentDetails"
                                               set status     = '${status}',
                                                   modifiedat = now()
                                               where id = ${paymentId}
                                                 and orderid = ${orderId}`)
        await connection.query(`commit`)
        return createResult(result.rowCount == 1)
    } catch (e) {
        await connection.query(`rollback`)
        throw createException(e)
    }
}

