import {Application, Request, Response} from "express";
import {getBestSellerProducts, getLovesProductList, getRunningOutOfStock} from "../postgre/Inventory";

export function inventoryRoute(app: Application) {
    app.get('/inventory', (req: Request, res: Response) => {
        Promise.all([getBestSellerProducts(), getRunningOutOfStock(), getLovesProductList()]).then(result => {
            // [0] means best seller, [1] means running out
            console.log(result)
            res.render("inventory", {
                products: result[0].result,
                runningOutProds: result[1].result,
                loves: result[2].result
            })
        }).catch(_ => {
            console.log(_)
            res.end("ERROR")
        })
    })
}