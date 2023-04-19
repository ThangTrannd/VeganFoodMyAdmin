"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEndDateProductList = exports.getLovesProductList = exports.getRunningOutOfStock = exports.getBestSellerProducts = void 0;
const pg_1 = require("pg");
const posgre_1 = require("../config/posgre");
const index_1 = require("./index");
const date_fns_1 = require("date-fns");
async function getBestSellerProducts() {
    const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
    try {
        const result = await connection.query(`select productid        as id,
                                                    sum(gr.quantity) as total,
                                                    name,
                                                    displayimage     as "displayImage"
                                            from "OrderItem" gr
                                            inner join "Product" P on P.id = gr.productid
                                            group by gr.quantity, productid, name, displayimage
                                            order by total desc;`);
        return (0, index_1.createResult)(result.rows);
    }
    catch (e) {
        throw (0, index_1.createException)(e);
    }
}
exports.getBestSellerProducts = getBestSellerProducts;
async function getRunningOutOfStock() {
    const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
    try {
        const result = await connection.query(`select id as id, name as name, quantity as quantity
                                          from "Product"
                                          where quantity <= 10
                                          order by quantity asc `);
        return (0, index_1.createResult)(result.rows);
    }
    catch (e) {
        throw (0, index_1.createException)(e);
    }
}
exports.getRunningOutOfStock = getRunningOutOfStock;
async function getLovesProductList() {
    const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
    try {
        return (0, index_1.createResult)((await connection.query(`select P.id, name, count(P.id) as total
                                                  from "LovedItems"
                                                  inner join "Product" P on P.id = "LovedItems".productid
                                                  group by P.id
                                                  order by total desc;`)).rows);
    }
    catch (e) {
        return (0, index_1.createException)(e);
    }
}
exports.getLovesProductList = getLovesProductList;
async function getEndDateProductList() {
    const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
    try {
        await connection.query('update "Product" set active = false  where enddate < now()::timestamp;');
        const results = (0, index_1.createResult)((await connection.query('select * from "Product" p /*where active = true*/ order by enddate asc')).rows);
        // @ts-ignore
        results.result.map((elm) => {
            elm.enddate = (0, date_fns_1.differenceInDays)(elm.enddate, new Date());
            elm.active = elm.active ? 'Đang Bán' : 'Ngừng bán';
        });
        return results;
    }
    catch (e) {
        return (0, index_1.createException)(e);
    }
}
exports.getEndDateProductList = getEndDateProductList;
