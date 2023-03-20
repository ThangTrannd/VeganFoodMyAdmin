import {Application, Request, Response} from "express";
import {getAllStatistical} from "../postgre";
import {getOrders} from "../postgre/OrderDetails";

export function homeRoute(app: Application) {

    app.get("/", (req: Request, res: Response) => {
        /* Uncomment this and comment render line below*/
        if (req.session.userid !== 'admin') {
            res.redirect("/login")
        } else {
            Promise.all([getAllStatistical(), getOrders(null)]).then(result => {
                // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all
                console.log(result[0])
                console.log(result[1])
                res.render('index', {data: result[0].result, orders: result[1].result})
                // res.render('index')
            })
            // res.render('index')
        }
    });
}
