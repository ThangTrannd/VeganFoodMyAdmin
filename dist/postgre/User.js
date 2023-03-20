"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserActiveStatus = exports.checkActiveStatus = exports.getUserTokenDevice = exports.updateUserMomoPayment = exports.addUserMomoPayment = exports.updateUserPassword = exports.getUserLoginInfo = exports.getUserIdByUsername = exports.getUserAddress = exports.updateUserAddress = exports.deleteUser = exports.updateUserInfo = exports.getUser = exports.getUsers = exports.createUser = exports.isEmailHasTaken = exports.isUsernameHasTaken = void 0;
const posgre_1 = require("../config/posgre");
const md5_1 = __importDefault(require("md5"));
const index_1 = require("./index");
const pg_1 = require("pg");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({
    path: "process.env"
});
async function isUsernameHasTaken(username) {
    const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
    let result = await connection.query(`select count(*)
                                         from "User"
                                         where username = '${username}'`);
    return result.rows[0].count != 0;
}
exports.isUsernameHasTaken = isUsernameHasTaken;
async function isPhoneNumberHasTaken(phoneNumber) {
    try {
        const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
        let result = await connection.query(`select count(*)
                                             from "User"
                                             where phonenumber = '${phoneNumber}'`);
        return result.rows[0].count != 0;
    }
    catch (e) {
        return false;
    }
}
async function isEmailHasTaken(email) {
    try {
        const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
        let result = await connection.query(`select count(*)
                                             from "User"
                                             where email = '${email}'`);
        return result.rows[0].count != 0;
    }
    catch (e) {
        return false;
    }
}
exports.isEmailHasTaken = isEmailHasTaken;
async function createUser(user) {
    const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
    const encryptedPassword = (0, md5_1.default)(user.password);
    const validateResult = await Promise.all([isUsernameHasTaken(user.username), isEmailHasTaken(user.email), isPhoneNumberHasTaken(user.phoneNumber)]);
    if (validateResult[0]) {
        return (0, index_1.createException)("Tên người dùng đã được sử dụng");
    }
    else if (validateResult[1]) {
        return (0, index_1.createException)("Email đã đuợc sử dụng");
    }
    else if (validateResult[2]) {
        return (0, index_1.createException)("Số điện thoại đã đuợc sử dụng");
    }
    try {
        await connection.query(`begin`);
        let insertNewUserId = await connection.query(`insert into "User" (id, email, password, name, phonenumber,
                                                                          createat,
                                                                          modifiedat, username)
                                                      values (DEFAULT,
                                                              '${user.email}',
                                                              '${encryptedPassword}',
                                                              '${user.name}',
                                                              '${user.phoneNumber}',
                                                              now(),
                                                              now(),
                                                              '${user.username}')
                                                      returning id`);
        let insertIndex = insertNewUserId.rows[0].id;
        let insertUserAddress = await connection.query(`insert into "UserAddress"
                                                        values (DEFAULT,
                                                                ${insertIndex},
                                                                '',
                                                                '')`);
        await connection.query(`commit`);
        addUserMomoPayment(insertIndex, "").then();
        if ((insertNewUserId.rowCount === 1
            && (insertUserAddress.rowCount === 1))) {
            return {
                isSuccess: true,
                result: true,
                errorMessage: null
            };
        }
        else {
            return {
                isSuccess: false,
                result: null,
                errorMessage: "Không thể đăng ký tài khoản do lỗi server!"
            };
        }
    }
    catch (e) {
        await connection.query(`rollback`);
        return (0, index_1.createException)(e);
    }
}
exports.createUser = createUser;
async function getUsers() {
    const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
    let result = await connection.query(`select * from "User"`);
    result.rows.map(item => {
        if (item.active == true) {
            item.active = "Đang hoạt động";
        }
        else {
            item.active = "Bị khóa";
        }
    });
    return {
        isSuccess: true,
        result: result.rows,
        errorMessage: null
    };
}
exports.getUsers = getUsers;
async function getUser(token) {
    const user = await jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
    const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
    let result = await connection.query(`select "User".id,
                                                "User".username,
                                                "User".name,
                                                "User".email,
                                                "User".phoneNumber,
                                                "User".createAt,
                                                "UserAddress".address
                                         from "User"
                                                  inner join "UserAddress" on "User".id = "UserAddress".userId
                                         where "User".id = ${user.id};`);
    if (result.rows.length == 0) {
        return {
            isSuccess: false,
            result: null,
            errorMessage: "Khong tim thay user nay"
        };
    }
    else {
        return {
            isSuccess: true,
            result: result.rows[0],
            errorMessage: null
        };
    }
}
exports.getUser = getUser;
async function updateUserInfo(oldId, user) {
    const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
    try {
        await connection.query(`begin`);
        let result = await connection.query(`update "User"
                                             set name        = '${user.name}',
                                                 username    = '${user.username}',
                                                 email       = '${user.email}',
                                                 phoneNumber = '${user.phoneNumber}',
                                                 modifiedAt  = now()
                                             where id = ${oldId}
        `);
        await connection.query(`commit`);
        if (result.rowCount == 1) {
            return (0, index_1.createResult)(true);
        }
        else {
            return (0, index_1.createException)("Khong tim thay user voi ID " + oldId);
        }
    }
    catch (e) {
        await connection.query(`rollback`);
        return (0, index_1.createException)(e);
    }
}
exports.updateUserInfo = updateUserInfo;
async function deleteUser(id) {
    const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
    try {
        await connection.query(`begin`);
        let result = await connection.query(`delete
                                             from "User"
                                             where id = ${id}`);
        await connection.query(`commit`);
        return (0, index_1.createResult)(result.rowCount == 1);
    }
    catch (e) {
        await connection.query(`end`);
        return (0, index_1.createException)(e);
    }
}
exports.deleteUser = deleteUser;
async function updateUserAddress(id, userAddress) {
    const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
    try {
        await connection.query(`begin`);
        let result = await connection.query(`update "UserAddress"
                                             set phoneNumber = '${userAddress.phoneNumber}',
                                                 address     = '${userAddress.address}'
                                             where id = ${id}
        `);
        await connection.query(`commit`);
        if (result.rowCount === 1) {
            return (0, index_1.createResult)(true);
        }
        else {
            return (0, index_1.createException)("Khong co nguoi dung voi ID " + id);
        }
    }
    catch (e) {
        await connection.query(`rollback`);
        return (0, index_1.createException)(e);
    }
}
exports.updateUserAddress = updateUserAddress;
async function getUserAddress(id) {
    try {
        const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
        const result = await connection.query(`select *
                                               from "UserAddress"
                                               where id = ${id}`);
        if (result.rows.length === 0) {
            return (0, index_1.createException)("Khong tim thay thong tin voi ID " + id);
        }
        else {
            return (0, index_1.createResult)(result.rows[0]);
        }
    }
    catch (e) {
        return (0, index_1.createException)(e);
    }
}
exports.getUserAddress = getUserAddress;
async function getUserIdByUsername(username, token) {
    try {
        const user = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        console.log(user);
        const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
        let result = await connection.query(`select id
                                             from "User"
                                             where username = '${username}'`);
        if (result.rows.length === 0) {
            return (0, index_1.createException)("Khong tim thay ID");
        }
        else {
            return (0, index_1.createResult)(result.rows[0].id);
        }
    }
    catch (e) {
        return (0, index_1.createException)(e);
    }
}
exports.getUserIdByUsername = getUserIdByUsername;
async function getUserLoginInfo(username, password, type, token_device) {
    let encryptedPassword = (0, md5_1.default)(password);
    const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
    let result;
    switch (type) {
        case "email": {
            let sqlQuery = `Select id, username, password, active
                            from "User"
                            where email = '${username}'
                              and password = '${encryptedPassword}'`;
            result = await connection.query(sqlQuery);
            break;
        }
        case "phoneNumber": {
            let sqlQuery = `Select id, username, password, active
                            from "User"
                            where phoneNumber = '${username}'
                              and password = '${encryptedPassword}'`;
            result = await connection.query(sqlQuery);
            break;
        }
        case "username": {
            let sqlQuery = `Select id, username, password, active
                            from "User"
                            where username = '${username}'
                              and password = '${encryptedPassword}'`;
            result = await connection.query(sqlQuery);
            break;
        }
        default: {
            return {
                isSuccess: false,
                result: false,
                errorMessage: "Thông tin đăng nhập không đúng!"
            };
        }
    }
    if (result.rows.length != 0) {
        console.log(result.rows[0]);
        if (result.rows[0].active == false) {
            return (0, index_1.createException)("Tài khoản của bạn bị tạm khóa, liên hệ với cửa hàng để biết thêm thông tin!");
        }
        const _jwt = await jsonwebtoken_1.default.sign(result.rows[0], process.env.JWT_SECRET.toString());
        await updateUserTokenDevice(result.rows[0].id, token_device);
        return {
            isSuccess: true,
            result: _jwt,
            errorMessage: null
        };
    }
    else {
        return {
            isSuccess: false,
            result: null,
            errorMessage: "Thông tin đăng nhập không đúng!"
        };
    }
}
exports.getUserLoginInfo = getUserLoginInfo;
async function updateUserTokenDevice(id, token_device) {
    const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
    try {
        await connection.query(`begin`);
        await connection.query(`update "User"
                                set tokendevice = '${token_device}'
                                where id = ${id}`);
        await connection.query(`commit`);
    }
    catch (e) {
        await connection.query(`rollback`);
    }
}
async function updateUserPassword(id, oldPassword, newPassword) {
    const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
    try {
        let encryptedOldPassword = (0, md5_1.default)(oldPassword);
        let encryptedNewPassword = (0, md5_1.default)(newPassword);
        await connection.query(`begin`);
        let result = await connection.query(`
            update
                "User"
            set password = '${encryptedNewPassword}'
            where id = ${id}
              and password = '${encryptedOldPassword}'`);
        await connection.query(`commit`);
        if (result.rowCount === 1) {
            return (0, index_1.createResult)(true);
        }
        else {
            return (0, index_1.createException)("Khong tim thay thong tin");
        }
    }
    catch (e) {
        await connection.query(`rollback`);
        return (0, index_1.createException)(e);
    }
}
exports.updateUserPassword = updateUserPassword;
async function addUserMomoPayment(userId, momoAccount) {
    const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
    try {
        await connection.query(`begin`);
        const result = await connection.query(`
            insert
            into "UserMomoPayment"
            values (default,
                    ${userId}
                       ,
                    '${momoAccount}')
        `);
        await connection.query(`commit`);
        if (result.rowCount == 1) {
            return (0, index_1.createResult)(true);
        }
        else {
            return (0, index_1.createException)("Khong tim thay ID");
        }
    }
    catch (e) {
        await connection.query(`rollback`);
        return (0, index_1.createException)(e);
    }
}
exports.addUserMomoPayment = addUserMomoPayment;
async function updateUserMomoPayment(userId, momoAccountId, momoAccount) {
    const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
    try {
        await connection.query(`begin`);
        const result = await connection.query(`
            update
                "UserMomoPayment"
            set momoaccount = '${momoAccount}'
            where userid = '${userId}'
              and id = '${momoAccountId}'`);
        await connection.query(`commit`);
        if (result.rowCount === 1) {
            return (0, index_1.createResult)(true);
        }
        else {
            return (0, index_1.createException)("Khong tim thay ID");
        }
    }
    catch (e) {
        await connection.query(`rollback`);
        return (0, index_1.createException)(e);
    }
}
exports.updateUserMomoPayment = updateUserMomoPayment;
async function getUserTokenDevice(userId) {
    try {
        const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
        let result = await connection.query(`select tokendevice as "tokenDevice"
                                             from "User"
                                             where id = ${userId}`);
        return result.rows[0].tokenDevice;
    }
    catch (e) {
        return "";
    }
}
exports.getUserTokenDevice = getUserTokenDevice;
async function checkActiveStatus(userId) {
    const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
    try {
        let result = await connection.query(`select active
                                             from "User"
                                             where id = ${userId}`);
        return (0, index_1.createResult)(result.rows[0].active);
    }
    catch (e) {
        return (0, index_1.createException)(e);
    }
}
exports.checkActiveStatus = checkActiveStatus;
async function updateUserActiveStatus(userId) {
    const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
    try {
        let sqlQuery = `
            update "User"
            set active = not active
            where id = ${userId}
        `;
        await connection.query(`begin`);
        await connection.query(sqlQuery);
        await connection.query(`commit`);
        return (0, index_1.createResult)(true);
    }
    catch (e) {
        await connection.query(`rollback`);
        return (0, index_1.createException)(e);
    }
}
exports.updateUserActiveStatus = updateUserActiveStatus;
