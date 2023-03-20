"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminLoginLogRoute = void 0;
const Admin_1 = require("../postgre/Admin");
function adminLoginLogRoute(app) {
    app.get('/log', async (req, res) => {
        if (req.session.userid === 'admin') {
            (0, Admin_1.getLog)().then(r => {
                res.json(r);
                // res.render('login_log', {data: data})
            }).catch(e => {
                res.end(e.toString());
            });
        }
        else {
            res.redirect('/login');
        }
    });
}
exports.adminLoginLogRoute = adminLoginLogRoute;
