import {PostgreSQLConfig} from "../config/posgre";
import {createException, createResult} from "./index";
import {Pool} from "pg";
import md5 from "md5";

export async function resetPassword(userId: number): Promise<APIResponse<boolean>> {
    const connection = await new Pool(PostgreSQLConfig)
    const encryptedPassword = md5("password")
    try {
        await connection.query(`begin`)
        await connection.query(`update "User"
                                set password = '${encryptedPassword}'
                                where id = ${userId}`)
        await connection.query(`commit`)
        return createResult("Đặt lại mật khẩu thành công! Kiểm tra email của bạn!")
    } catch (e) {
        await connection.query(`rollback`)
        return createException(e)
    }
}


