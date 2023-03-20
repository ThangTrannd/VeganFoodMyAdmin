"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = void 0;
const posgre_1 = require("../config/posgre");
const index_1 = require("./index");
const pg_1 = require("pg");
const md5_1 = __importDefault(require("md5"));
async function resetPassword(userId) {
    const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
    const encryptedPassword = (0, md5_1.default)("password");
    try {
        await connection.query(`begin`);
        await connection.query(`update "User"
                                set password = '${encryptedPassword}'
                                where id = ${userId}`);
        await connection.query(`commit`);
        return (0, index_1.createResult)("Đặt lại mật khẩu thành công! Kiểm tra email của bạn!");
    }
    catch (e) {
        await connection.query(`rollback`);
        return (0, index_1.createException)(e);
    }
}
exports.resetPassword = resetPassword;
