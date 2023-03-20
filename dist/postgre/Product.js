"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findProductsByName = exports.applyDiscount = exports.getProductsByCategoryId = exports.updateProductWithoutImage = exports.updateProduct = exports.getProduct = exports.getProducts = exports.updateProductQuantity = exports.deleteProduct = exports.addProduct = void 0;
const pg_1 = require("pg");
const posgre_1 = require("../config/posgre");
const index_1 = require("./index");
async function addProduct(product) {
    const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
    try {
        await connection.query(`begin`);
        const result = await connection.query(`insert into "Product"
                                               values (default,
                                                       '${product.productName}',
                                                       '${product.productCategoryId}',
                                                       '${product.quantity}',
                                                       '${product.price}',
                                                       ${product.discountId},
                                                       '${product.displayImage}',
                                                       '${product.size}',
                                                       true,
                                                       '${product.productDescription}')`);
        await connection.query(`commit`);
        return (0, index_1.createResult)(true);
    }
    catch (e) {
        await connection.query(`rollback`);
        throw (0, index_1.createException)(e);
    }
}
exports.addProduct = addProduct;
async function deleteProduct(id) {
    const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
    try {
        await connection.query(`begin`);
        const result = await connection.query(`update "Product"
                                               set active = false
                                               where id = ${id}`);
        await connection.query(`commit`);
        return (0, index_1.createResult)(true);
    }
    catch (e) {
        await connection.query(`rollback`);
        return (0, index_1.createException)(e);
    }
}
exports.deleteProduct = deleteProduct;
/*?????*/
async function updateProductQuantity(id, quantity) {
    if (quantity < 0) {
        return (0, index_1.createException)("So luong cap nhat " + quantity + " khong hop le!");
    }
    try {
        const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
        const result = await connection.query(`update "Product"
                                               set quantity = ${quantity}
                                               where id = ${id}`);
        if (result.rowCount === 1) {
            return (0, index_1.createResult)(result.rowCount === 1);
        }
        else {
            return (0, index_1.createException)("Khong tim thay san pham co ID la" + id);
        }
    }
    catch (e) {
        return (0, index_1.createException)(e);
    }
}
exports.updateProductQuantity = updateProductQuantity;
async function getProducts() {
    try {
        const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
        const result = await connection.query(`select "Product".id,
                                                      "Product".name             as "productName",
                                                      "Product".description      as "productDescription",
                                                      "ProductCategory".name     as "productCategoryName",
                                                      "Product".quantity         as "quantity",
                                                      "Product".price            as "price",
                                                      "Discount".name            as "discount",
                                                      "Discount".discountpercent as "discountPercent",
                                                      "Product".price -
                                                      round(("Discount".discountpercent * "Product".price) /
                                                            100)                 as "priceAfterDiscount",
                                                      "Product".size             as "size",
                                                      "Product".displayimage     as "displayImage"

                                               from "Product"
                                                        inner join "ProductCategory" on "ProductCategory".id = "Product".categoryid
                                                        left join "Discount" on "Product".discountid = "Discount".id
                                               where "Product".active = true
                                               order by id;
        `);
        result.rows.map(item => {
            item.size = item.size.toString().split(",").filter((it) => {
                return it != "";
            }).join(",");
            if (item.discount == null) {
                item.discount = "Không";
            }
        });
        connection.end();
        return (0, index_1.createResult)(result.rows);
    }
    catch (e) {
        return (0, index_1.createException)(e);
    }
}
exports.getProducts = getProducts;
async function getProduct(productId) {
    try {
        const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
        const result = await connection.query(`select "Product".id,
                                                      "Product".name             as "productName",
                                                      "Product".description      as "productDescription",
                                                      "ProductCategory".name     as "productCategoryName",
                                                      "Product".quantity         as "quantity",
                                                      "Product".price            as "price",
                                                      "Discount".name            as "discount",
                                                      "Discount".discountpercent as "discountPercent",
                                                      "Product".price -
                                                      round((coalesce("Discount".discountpercent, 0) * "Product".price) /
                                                            100)                 as "priceAfterDiscount",
                                                      "Product".size             as "size",
                                                      "Product".displayimage as "displayImage"
                                               from "Product"
                                                        inner join "ProductCategory" on "ProductCategory".id = "Product".categoryid
                                                        left join "Discount" on "Product".discountid = "Discount".id
                                               where "Product".active = true
                                                 and "Product".id = ${productId}`);
        if (result.rows.length === 1) {
            return (0, index_1.createResult)(result.rows[0]);
        }
        else {
            return (0, index_1.createException)("Khong tim thay id");
        }
    }
    catch (e) {
        return (0, index_1.createException)(e);
    }
}
exports.getProduct = getProduct;
async function updateProduct(product, productId) {
    const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
    try {
        await connection.query(`begin`);
        const result = await connection.query(`update "Product"
                                               set name        = '${product.productName}',
                                                   description = '${product.productDescription}',
                                                   categoryid  = ${product.productCategoryId},
                                                   quantity    = ${product.quantity},
                                                   price       = ${product.price},
                                                   displayimage= '${product.displayImage}',
                                                   size        = '${product.size}'
                                               where id = ${productId}`);
        await connection.query(`commit`);
        return (0, index_1.createResult)(result.rowCount === 1);
    }
    catch (e) {
        await connection.query(`rollback`);
        return (0, index_1.createException)(e);
    }
}
exports.updateProduct = updateProduct;
async function updateProductWithoutImage(product, productId) {
    const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
    console.log(product.size);
    try {
        await connection.query(`begin`);
        const result = await connection.query(`update "Product"
                                               set name        = '${product.productName}',
                                                   description = '${product.productDescription}',
                                                   categoryid  = ${product.productCategoryId},
                                                   quantity    = ${product.quantity},
                                                   price       = ${product.price},
                                                   size        = '${product.size}'
                                               where id = ${productId}`);
        await connection.query(`commit`);
        return (0, index_1.createResult)(result.rowCount == 1);
    }
    catch (e) {
        await connection.query(`rollback`);
        throw (0, index_1.createException)(e);
    }
}
exports.updateProductWithoutImage = updateProductWithoutImage;
async function getProductsByCategoryId(categoryId) {
    try {
        const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
        const result = await connection.query(`select "Product".id,
                                                      "Product".name             as "productName",
                                                      "Product".description      as "productDescription",
                                                      "ProductCategory".name     as "productCategoryName",
                                                      "Product".quantity         as "quantity",
                                                      "Product".price            as "price",
                                                      "Discount".name            as "discount",
                                                      "Discount".discountpercent as "discountPercent",
                                                      "Product".price -
                                                      round(("Discount".discountpercent * "Product".price) /
                                                            100)                 as "priceAfterDiscount",
                                                      "Product".size             as "size",
                                                      "Product".displayimage     as "displayImage"

                                               from "Product"
                                                        inner join "ProductCategory" on "ProductCategory".id = "Product".categoryid
                                                        left join "Discount" on "Product".discountid = "Discount".id
                                               where "Product".active = true
                                                 and "ProductCategory".id = ${categoryId}
                                               order by id;
        `);
        result.rows.map(item => {
            item.size = item.size.toString().split(",").filter((it) => {
                return it != "";
            }).join(",");
            if (item.discount == null) {
                item.discount = "Không";
            }
        });
        connection.end();
        return (0, index_1.createResult)(result.rows);
    }
    catch (e) {
        return (0, index_1.createException)(e);
    }
}
exports.getProductsByCategoryId = getProductsByCategoryId;
/*TODO*/
async function applyDiscount(productId, discountId) {
    try {
        const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
        let result = await connection.query(`update "Product"
                                             set discountid = ${discountId}
                                             where id = ${productId}`);
        return (0, index_1.createResult)(result.rowCount == 1);
    }
    catch (e) {
        return (0, index_1.createException)(e);
    }
}
exports.applyDiscount = applyDiscount;
async function findProductsByName(query) {
    try {
        const connection = await new pg_1.Pool(posgre_1.PostgreSQLConfig);
        const result = await connection.query(`select "Product".id,
                                                      "Product".name             as "productName",
                                                      "Product".description      as "productDescription",
                                                      "ProductCategory".name     as "productCategoryName",
                                                      "Product".quantity         as "quantity",
                                                      "Product".price            as "price",
                                                      "Discount".name            as "discount",
                                                      "Discount".discountpercent as "discountPercent",
                                                      "Product".price -
                                                      round(("Discount".discountpercent * "Product".price) /
                                                            100)                 as "priceAfterDiscount",
                                                      "Product".size             as "size",
                                                      "Product".displayimage     as "displayImage"
                                               from "Product"
                                                        inner join "ProductCategory" on "ProductCategory".id = "Product".categoryid
                                                        left join "Discount" on "Product".discountid = "Discount".id
                                               where upper("Product".name) like upper('%${query}%')
        `);
        result.rows.map(item => {
            item.size = item.size.toString().split(",").filter((it) => {
                return it != "";
            }).join(",");
            if (item.discount == null) {
                item.discount = "Không";
            }
        });
        connection.end();
        return (0, index_1.createResult)(result.rows);
    }
    catch (e) {
        return (0, index_1.createException)(e);
    }
}
exports.findProductsByName = findProductsByName;
