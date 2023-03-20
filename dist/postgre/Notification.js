"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNotification = exports.addNotification = exports.getNewsNotifications = exports.getPromotionNotifications = exports.getAllNotifications = void 0;
const pg_1 = require("pg");
const posgre_1 = require("../config/posgre");
const index_1 = require("./index");
async function getAllNotifications() {
    try {
        const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
        let result = await connection.query(`select *
                                             from "Notifications"
                                             order by id`);
        return (0, index_1.createResult)(result.rows);
    }
    catch (e) {
        return (0, index_1.createException)(e);
    }
}
exports.getAllNotifications = getAllNotifications;
async function getPromotionNotifications() {
    try {
        const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
        let result = await connection.query(`select *
                                             from "Notifications"
                                             where type = 'Khuyến mại'`);
        return (0, index_1.createResult)(result.rows);
    }
    catch (e) {
        return (0, index_1.createException)(e);
    }
}
exports.getPromotionNotifications = getPromotionNotifications;
async function getNewsNotifications() {
    try {
        const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
        let result = await connection.query(`select *
                                             from "Notifications"
                                             where type = 'Tin tức'`);
        return (0, index_1.createResult)(result.rows);
    }
    catch (e) {
        return (0, index_1.createException)(e);
    }
}
exports.getNewsNotifications = getNewsNotifications;
async function addNotification(title, message, type, image) {
    const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
    try {
        await connection.query(`begin`);
        let result = await connection.query(`insert into "Notifications" (id, title, message, type, image)
                                             VALUES (default,
                                                     '${title}',
                                                     '${message}',
                                                     '${type}',
                                                     '${image}')`);
        await connection.query(`commit`);
        return (0, index_1.createResult)(result.rowCount != 0);
    }
    catch (e) {
        await connection.query(`rollback`);
        return (0, index_1.createException)(e);
    }
}
exports.addNotification = addNotification;
async function deleteNotification(id) {
    const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
    try {
        await connection.query(`begin`);
        await connection.query(`delete
                            from "Notifications"
                            where id = ${id}`);
        await connection.query(`commit`);
    }
    catch (e) {
        await connection.query(`rollback`);
    }
}
exports.deleteNotification = deleteNotification;
