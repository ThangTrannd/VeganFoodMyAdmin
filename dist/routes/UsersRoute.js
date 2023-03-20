"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersRoute = void 0;
const postgre_1 = require("../postgre");
const User_1 = require("../postgre/User");
function usersRoute(app) {
    app.get("/users", (req, res) => {
        (0, postgre_1.getUsers)().then(r => {
            console.log(r);
            res.render("users", { users: r.result });
        }).catch(e => {
            console.log(e);
            res.end("ERROR");
        });
    });
    app.post("/users/active", (req, res) => {
        (0, User_1.updateUserActiveStatus)(req.body.id).then(r => {
            res.redirect("/users");
        });
    });
}
exports.usersRoute = usersRoute;
