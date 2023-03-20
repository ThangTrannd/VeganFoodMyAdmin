"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePaymentDetailStatus = exports.createPaymentDetail = void 0;
const pg_1 = require("pg");
const posgre_1 = require("../config/posgre");
const index_1 = require("./index");
async function createPaymentDetail(orderId, provider, status, phoneNumber, address, note) {
    const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
    try {
        await connection.query(`begin`);
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
                                               returning id`);
        await connection.query(`commit`);
        return result.rows[0].id;
    }
    catch (e) {
        await connection.query(`rollback`);
        throw (0, index_1.createException)("Cant create order detail");
    }
}
exports.createPaymentDetail = createPaymentDetail;
//
async function updatePaymentDetailStatus(paymentId, orderId, status) {
    const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
    try {
        await connection.query(`begin`);
        const result = await connection.query(`update "PaymentDetails"
                                               set status     = '${status}',
                                                   modifiedat = now()
                                               where id = ${paymentId}
                                                 and orderid = ${orderId}`);
        await connection.query(`commit`);
        return (0, index_1.createResult)(result.rowCount == 1);
    }
    catch (e) {
        await connection.query(`rollback`);
        throw (0, index_1.createException)(e);
    }
}
exports.updatePaymentDetailStatus = updatePaymentDetailStatus;
