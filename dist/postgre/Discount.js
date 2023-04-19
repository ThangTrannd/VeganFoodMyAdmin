"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDiscounts = exports.deleteDiscount = exports.getDiscount = exports.updateDiscountWithoutImage = exports.updateDiscount = exports.createDiscount = void 0;
const posgre_1 = require("../config/posgre");
const index_1 = require("./index");
const pg_1 = require("pg");
async function createDiscount(discount) {
    const connect = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
    try {
        await connect.query("begin");
        const result = await connect.query(`insert into "Discount"
                                        values (default,
                                        '${discount.name}',
                                        '${discount.description}',
                                        '${discount.discountPercent}',
                                        now(),
                                        true,
                                        '${discount.displayImage}',
                                        now())`);
        await connect.query("commit");
        return (0, index_1.createResult)(result.rowCount === 1);
    }
    catch (e) {
        await connect.query("rollback");
        throw (0, index_1.createException)(e);
    }
}
exports.createDiscount = createDiscount;
async function updateDiscount(oldId, discount) {
    const connect = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
    try {
        await connect.query("begin");
        const result = await connect.query(`update "Discount"
                                        set name = '${discount.name}',
                                        displayimage    = '${discount.displayImage}',
                                        discountpercent = '${discount.discountPercent}',
                                        description     = '${discount.description}',
                                        modifiedat      = now()
                                        where id = ${oldId}
        `);
        await connect.query("commit");
        return (0, index_1.createResult)(result.rowCount === 1);
    }
    catch (e) {
        await connect.query("rollback");
        return (0, index_1.createException)(e);
    }
}
exports.updateDiscount = updateDiscount;
async function updateDiscountWithoutImage(oldId, discount) {
    const connect = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
    try {
        await connect.query("begin");
        const result = await connect.query(`update "Discount"
                                        set name            = '${discount.name}',
                                        discountpercent = '${discount.discountPercent}',
                                        description     = '${discount.description}',
                                        modifiedat      = now()
                                        where id = ${oldId}
        `);
        await connect.query("commit");
        return (0, index_1.createResult)(result.rowCount === 1);
    }
    catch (e) {
        await connect.query("rollback");
        return (0, index_1.createException)(e);
    }
}
exports.updateDiscountWithoutImage = updateDiscountWithoutImage;
async function getDiscount(id) {
    try {
        const connect = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
        const result = await connect.query(`select *
                                        from "Discount"
                                        where id = ${id}
                                        and active = true`);
        if (result.rowCount === 1) {
            return (0, index_1.createResult)(result.rows[0]);
        }
        else {
            return (0, index_1.createException)("Khong tim thay ma giam gia");
        }
    }
    catch (e) {
        return (0, index_1.createException)(e);
    }
}
exports.getDiscount = getDiscount;
async function deleteDiscount(id) {
    console.log(id);
    const connect = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
    try {
        await connect.query("begin");
        const result = await connect.query(`update "Discount" set active = false
                                        where id = ${id}`);
        await connect.query("commit");
        return (0, index_1.createResult)(result.rowCount == 1);
    }
    catch (e) {
        await connect.query("rollback");
        throw (0, index_1.createException)(e);
    }
}
exports.deleteDiscount = deleteDiscount;
async function getDiscounts() {
    const connect = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
    try {
        await connect.query("begin");
        const result = await connect.query(`select *
                                        from "Discount"
                                        where active = true`);
        result.rows.map(item => {
            item.createat = new Date(item.createat).toLocaleString();
            item.modifiedat = new Date(item.modifiedat).toLocaleString();
        });
        await connect.query("commit");
        return (0, index_1.createResult)(result.rows);
    }
    catch (e) {
        await connect.query("rollback");
        return (0, index_1.createException)(e);
    }
}
exports.getDiscounts = getDiscounts;
