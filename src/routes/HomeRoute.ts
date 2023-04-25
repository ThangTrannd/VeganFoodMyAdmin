import {Application, Request, Response} from "express";
import {getAllStatistical} from "../postgre";
import {getOrders} from "../postgre/OrderDetails";

export function homeRoute(app: Application) {

    app.get("/", async (req: Request, res: Response) => {
        /* Uncomment this and comment render line below*/
        if (req.session.userid !== "admin") {
            res.redirect("/login");
        } else {
            Promise.all([await getAllStatistical(), await getOrders(null)]).then(result => {
                res.render("index", {data: result[0].result, orders: result[1].result});
            });
            // res.render('index')
        }
    });
}
