import {Application, Response} from 'express'
import {getLog} from "../postgre/Admin";

export function adminLoginLogRoute(app: Application) {
    app.get('/log', async (req, res: Response) => {
        if (req.session.userid === 'admin') {
            getLog().then(r => {
                res.json(r)
                // res.render('login_log', {data: data})
            }).catch(e => {
                res.end(e.toString())
            })
        } else {
            res.redirect('/login')
        }
    })
}
