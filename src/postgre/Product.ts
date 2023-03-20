import {Pool} from 'pg'
import {PostgreSQLConfig} from "../config/posgre";
import {createException, createResult} from "./index";

export async function addProduct(product: Product): Promise<APIResponse<boolean>> {
    const connection = await new Pool(PostgreSQLConfig)
    try {
        await connection.query(`begin`)
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
                                                       '${product.productDescription}')`)
        await connection.query(`commit`)
        return createResult(true)
    } catch (e) {
        await connection.query(`rollback`)
        throw createException(e)
    }
}

export async function deleteProduct(id: number): Promise<APIResponse<boolean>> {
    const connection = await new Pool(PostgreSQLConfig)
    try {
        await connection.query(`begin`)
        const result = await connection.query(`update "Product"
                                               set active = false
                                               where id = ${id}`)
        await connection.query(`commit`)
        return createResult(true)
    } catch (e) {
        await connection.query(`rollback`)
        return createException(e)
    }
}

/*?????*/
export async function updateProductQuantity(id: number, quantity: number): Promise<APIResponse<boolean>> {
    if (quantity < 0) {
        return createException("So luong cap nhat " + quantity + " khong hop le!")
    }
    try {
        const connection = await new Pool(PostgreSQLConfig)
        const result = await connection.query(`update "Product"
                                               set quantity = ${quantity}
                                               where id = ${id}`)
        if (result.rowCount === 1) {
            return createResult(result.rowCount === 1)
        } else {
            return createException("Khong tim thay san pham co ID la" + id)
        }
    } catch (e) {
        return createException(e)
    }
}

export async function getProducts(): Promise<APIResponse<Product>> {
    try {
        const connection = await new Pool(PostgreSQLConfig)
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
        `)
        result.rows.map(item => {
            item.size = item.size.toString().split(",").filter((it: string) => {
                return it != "";
            }).join(",")
            if (item.discount == null) {
                item.discount = "Không"
            }
        })
        connection.end()
        return createResult(result.rows)
    } catch (e) {
        return createException(e)
    }
}


export async function getProduct(productId: number): Promise<APIResponse<Product>> {
    try {
        const connection = await new Pool(PostgreSQLConfig)
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
                                                 and "Product".id = ${productId}`)

        if (result.rows.length === 1) {
            return createResult(result.rows[0])
        } else {
            return createException("Khong tim thay id")
        }

    } catch (e) {
        return createException(e)
    }
}

export async function updateProduct(product: Product, productId: number): Promise<APIResponse<boolean>> {
    const connection = await new Pool(PostgreSQLConfig)
    try {
        await connection.query(`begin`)
        const result = await connection.query(`update "Product"
                                               set name        = '${product.productName}',
                                                   description = '${product.productDescription}',
                                                   categoryid  = ${product.productCategoryId},
                                                   quantity    = ${product.quantity},
                                                   price       = ${product.price},
                                                   displayimage= '${product.displayImage}',
                                                   size        = '${product.size}'
                                               where id = ${productId}`
        )
        await connection.query(`commit`)
        return createResult(result.rowCount === 1)
    } catch (e) {
        await connection.query(`rollback`)
        return createException(e)
    }
}

export async function updateProductWithoutImage(product: Product, productId: number): Promise<APIResponse<boolean>> {
    const connection = await new Pool(PostgreSQLConfig)
    console.log(product.size)
    try {
        await connection.query(`begin`)
        const result = await connection.query(`update "Product"
                                               set name        = '${product.productName}',
                                                   description = '${product.productDescription}',
                                                   categoryid  = ${product.productCategoryId},
                                                   quantity    = ${product.quantity},
                                                   price       = ${product.price},
                                                   size        = '${product.size}'
                                               where id = ${productId}`
        )
        await connection.query(`commit`)
        return createResult(result.rowCount == 1)
    } catch (e) {
        await connection.query(`rollback`)
        throw createException(e)
    }
}

export async function getProductsByCategoryId(categoryId: number): Promise<APIResponse<Product[]>> {
    try {
        const connection = await new Pool(PostgreSQLConfig)
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
        `)
        result.rows.map(item => {
            item.size = item.size.toString().split(",").filter((it: string) => {
                return it != "";
            }).join(",")
            if (item.discount == null) {
                item.discount = "Không"
            }
        })
        connection.end()
        return createResult(result.rows)
    } catch (e) {
        return createException(e)
    }
}

/*TODO*/
export async function applyDiscount(productId: number, discountId: number): Promise<APIResponse<boolean>> {
    try {
        const connection = await new Pool(PostgreSQLConfig)
        let result = await connection.query(`update "Product"
                                             set discountid = ${discountId}
                                             where id = ${productId}`)
        return createResult(result.rowCount == 1)
    } catch (e) {
        return createException(e)
    }
}

export async function findProductsByName(query: string): Promise<APIResponse<Product[]>> {
    try {
        const connection = await new Pool(PostgreSQLConfig)
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
        `)
        result.rows.map(item => {
            item.size = item.size.toString().split(",").filter((it: string) => {
                return it != "";
            }).join(",")
            if (item.discount == null) {
                item.discount = "Không"
            }
        })
        connection.end()
        return createResult(result.rows)
    } catch (e) {
        return createException(e)
    }
}




