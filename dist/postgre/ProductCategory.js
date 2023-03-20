"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProductCategory = exports.getProductCategory = exports.updateProductCategoryWithoutImage = exports.updateProductCategory = exports.getProductCategories = exports.addProductCategory = void 0;
const posgre_1 = require("../config/posgre");
const index_1 = require("./index");
const pg_1 = require("pg");
async function addProductCategory(productCategory) {
    const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
    try {
        await connection.query(`begin`);
        let result = await connection.query(`INSERT INTO "ProductCategory"
                                             values (default,
                                                     '${productCategory.name}',
                                                     '${productCategory.description}',
                                                     '${productCategory.displayImage}',
                                                     now(),
                                                     now())`);
        console.log(result);
        await connection.query(`commit`);
        return {
            isSuccess: true,
            result: result.rowCount === 1,
            errorMessage: null
        };
    }
    catch (e) {
        await connection.query(`rollback`);
        throw {
            isSuccess: true,
            result: null,
            errorMessage: "Lỗi server: " + e
        };
    }
}
exports.addProductCategory = addProductCategory;
async function getProductCategories() {
    try {
        const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
        let result = await connection.query(`select "ProductCategory".id,
                                                    "ProductCategory".displayimage,
                                                    createat,
                                                    "ProductCategory".description,
                                                    "ProductCategory".name,
                                                    modifiedat,
                                                    (select count(P.id) filter ( where P.id is not null ) not_nulls) as count
                                             from "ProductCategory"
                                                      left outer join "Product" P on "ProductCategory".id = P.categoryid
                                             group by "ProductCategory".id, "ProductCategory".displayimage, createat,
                                                      "ProductCategory".description, "ProductCategory".name, modifiedat
                                             order by id`);
        console.log(result.rows);
        result.rows.map(item => {
            item.createat = new Date(item.createat).toLocaleString("vi-VN", { timeZone: "Asia/Saigon" });
            item.modifiedat = new Date(item.modifiedat).toLocaleString("vi-VN", { timeZone: "Asia/Saigon" });
        });
        connection.end();
        return {
            isSuccess: true,
            result: result.rows,
            errorMessage: null
        };
    }
    catch (e) {
        return {
            isSuccess: true,
            result: null,
            errorMessage: "Lỗi server: " + e
        };
    }
}
exports.getProductCategories = getProductCategories;
async function updateProductCategory(oldId, productCategory) {
    const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
    try {
        await connection.query(`begin`);
        let result = await connection.query(`update "ProductCategory"
                                             set name         = '${productCategory.name}',
                                                 description  = '${productCategory.description}',
                                                 displayImage = '${productCategory.displayImage}',
                                                 modifiedAt   = now()
                                             where id = ${oldId} `);
        await connection.query(`commit`);
        return (0, index_1.createResult)(result.rowCount === 1);
    }
    catch (e) {
        await connection.query(`rollback`);
        return (0, index_1.createException)(e);
    }
}
exports.updateProductCategory = updateProductCategory;
async function updateProductCategoryWithoutImage(oldId, productCategory) {
    const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
    try {
        await connection.query(`begin`);
        let result = await connection.query(`update "ProductCategory"
                                             set name         = '${productCategory.name}',
                                                 description  = '${productCategory.description}',
                                                 modifiedAt   = now()
                                             where id = ${oldId} `);
        await connection.query(`commit`);
        return (0, index_1.createResult)(result.rowCount === 1);
    }
    catch (e) {
        await connection.query(`rollback`);
        return (0, index_1.createException)(e);
    }
}
exports.updateProductCategoryWithoutImage = updateProductCategoryWithoutImage;
async function getProductCategory(id) {
    try {
        const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
        let result = await connection.query(`select *
                                             from "ProductCategory"
                                             where id = ${id}`);
        if (result.rowCount === 1) {
            return (0, index_1.createResult)(result.rows[0]);
        }
        else {
            return (0, index_1.createException)("Khong tim thay ID");
        }
    }
    catch (e) {
        return (0, index_1.createException)(e);
    }
}
exports.getProductCategory = getProductCategory;
async function deleteProductCategory(id) {
    const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
    try {
        await connection.query(`begin`);
        const result = await connection.query(` delete
                                                FROM "ProductCategory"
                                                where id = ${id}  `);
        await connection.query(`commit`);
        return (0, index_1.createResult)(result.rowCount === 1);
    }
    catch (e) {
        return (0, index_1.createException)(e);
    }
}
exports.deleteProductCategory = deleteProductCategory;
