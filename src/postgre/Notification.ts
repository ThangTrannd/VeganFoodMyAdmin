import {Pool} from "pg";
import {PostgreSQLConfig} from "../config/posgre";
import {createException, createResult} from "./index";

export async function getAllNotifications(): Promise<APIResponse<NotificationType[]>> {
    try {
        const connection = await new Pool(PostgreSQLConfig)
        let result = await connection.query(`select *
                                             from "Notifications"
                                             order by id`)
        return createResult(result.rows)
    } catch (e) {
        return createException(e)
    }
}

export async function getPromotionNotifications(): Promise<APIResponse<NotificationType[]>> {
    try {
        const connection = await new Pool(PostgreSQLConfig)
        let result = await connection.query(`select *
                                             from "Notifications"
                                             where type = 'Khuyến mại'`)
        return createResult(result.rows)
    } catch (e) {
        return createException(e)
    }
}

export async function getNewsNotifications(): Promise<APIResponse<NotificationType[]>> {
    try {
        const connection = await new Pool(PostgreSQLConfig)
        let result = await connection.query(`select *
                                             from "Notifications"
                                             where type = 'Tin tức'`)
        return createResult(result.rows)
    } catch (e) {
        return createException(e)
    }
}

export async function addNotification(title: string, message: string, type: string, image: string): Promise<APIResponse<boolean>> {
    const connection = await new Pool(PostgreSQLConfig)
    try {
        await connection.query(`begin`)
        let result = await connection.query(`insert into "Notifications" (id, title, message, type, image)
                                             VALUES (default,
                                                     '${title}',
                                                     '${message}',
                                                     '${type}',
                                                     '${image}')`)
        await connection.query(`commit`)
        return createResult(result.rowCount != 0)
    } catch (e) {
        await connection.query(`rollback`)
        return createException(e)
    }
}

export async function deleteNotification(id: number) {
    const connection = await new Pool(PostgreSQLConfig)
    try {
        await connection.query(`begin`)
        await connection.query(`delete
                            from "Notifications"
                            where id = ${id}`)
        await connection.query(`commit`)
    } catch (e) {
        await connection.query(`rollback`)
    }
}

