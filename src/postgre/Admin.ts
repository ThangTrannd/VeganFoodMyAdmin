import {PostgreSQLConfig} from "../config/posgre";
import {Pool} from 'pg';
import {createResult} from "./index";


export async function isAdminLogin(username: string, password: string, ip: string | undefined): Promise<boolean> {
    const connection = new Pool(PostgreSQLConfig)
    let result = await connection.query(`select *
                                         from "Admin"
                                         where username = '${username}'
                                           and password = '${password}' `)
    await connection.query(`INSERT INTO "AdminLoginLog"
                            values (default, now(), '${ip}')`)
    if (result.rowCount == 1) {
        return true
    }
    connection.end()
    return false
}

export async function updateAdminLastLogin() {
    const connection = await new Pool(PostgreSQLConfig)
    try {
        await connection.query(`begin`)
        let result = await connection.query(`update "Admin"
                                             set lastLogin = now()
                                             where username = 'admin'
                                               and password = 'admin'`)
        await connection.query(`commit`)
    } catch (e) {
        await connection.query(`rollback`)
    }
}

export async function getLog(): Promise<APIResponse<AdminLoginLog[]>> {
    const connection = await new Pool(PostgreSQLConfig)
    let result = await connection.query('select * from "AdminLoginLog"')
    return createResult(result.rows)
}
