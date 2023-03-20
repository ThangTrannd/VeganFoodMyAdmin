"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLog = exports.updateAdminLastLogin = exports.isAdminLogin = void 0;
const posgre_1 = require("../config/posgre");
const pg_1 = require("pg");
const index_1 = require("./index");
async function isAdminLogin(username, password, ip) {
    const connection = new pg_1.Pool(posgre_1.PostgreSQLConfig);
    let result = await connection.query(`select *
                                         from "Admin"
                                         where username = '${username}'
                                           and password = '${password}' `);
    await connection.query(`INSERT INTO "AdminLoginLog"
                            values (default, now(), '${ip}')`);
    if (result.rowCount == 1) {
        return true;
    }
    connection.end();
    return false;
}
exports.isAdminLogin = isAdminLogin;
async function updateAdminLastLogin() {
    const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
    try {
        await connection.query(`begin`);
        let result = await connection.query(`update "Admin"
                                             set lastLogin = now()
                                             where username = 'admin'
                                               and password = 'admin'`);
        await connection.query(`commit`);
    }
    catch (e) {
        await connection.query(`rollback`);
    }
}
exports.updateAdminLastLogin = updateAdminLastLogin;
async function getLog() {
    const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
    let result = await connection.query('select * from "AdminLoginLog"');
    return (0, index_1.createResult)(result.rows);
}
exports.getLog = getLog;
