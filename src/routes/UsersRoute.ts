import {Application, Request, Response} from "express";
import {getUsers} from "../postgre";
import {updateUserActiveStatus} from "../postgre/User";


export function usersRoute(app: Application) {

    app.get("/users", (req: Request, res: Response) => {
        getUsers().then(r => {
            console.log(r)
            res.render("users", {users: r.result})
        }).catch(e=> {
            console.log(e)
            res.end("ERROR")
        })
    });
    app.post("/users/active", (req: Request, res: Response) => {
        updateUserActiveStatus(req.body.id).then(r=> {
            res.redirect("/users")
        })
    })

}
