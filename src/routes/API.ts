import {Application, Request, Response} from "express";
import {
    createUser,
    getDiscounts,
    getProductCategories,
    getProductCategory,
    getUsers,
    getUserLoginInfo,
    getUser,
    getProducts,
    getProduct,
    getDiscount,
    updateUserInfo,
    updateUserPassword,
    updateUserAddress,
    createShoppingSession,
    addItemToCart,
    deleteShoppingSession,
    getCartItems,
    removeItemFromCart,
    getLovedItems,
    createException, getAllStatistical
} from "../postgre";
import {checkActiveStatus, getUserAddress, getUserIdByUsername} from "../postgre/User";
import {findProductsByName, getProductsByCategoryId} from "../postgre/Product";
import {updateCartItem} from "../postgre/CartItem";
import {getCartInfo, getUserSessionId} from "../postgre/ShoppingSession";
import {
    confirmOrder,
    getItemsInOrder,
    getOrderDetail, getUserCompletedOrders,
    getUserCurrentOrder,
    getUserOrders, reOrder, userCancelOrder
} from "../postgre/OrderDetails";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import {addLovedItem, deleteLovedItem, isUserLovedProduct} from "../postgre/LovedProducts";
import {getMonthlyChart, getRangeBarChart, getYearlyChart} from "../postgre/Statistical";
import {getAllNotifications, getNewsNotifications, getPromotionNotifications} from "../postgre/Notification";
import {sendResetPasswordEmail, userResetPassword} from "./AuthenticationRoute";
import {resetPassword} from "../postgre/ResetPassword";

dotenv.config({
    path: "process.env"
})

export function API(app: Application) {
    app.post("/api/product_categories", async (req: Request, res: Response) => {
        getProductCategories().then(r => {
            res.json(r)
        }).catch(e => {
            res.json(createException(e));
        })
    })
    // TODO: Should we need this?
    // Update: We need this
    app.post("/api/users", (req: Request, res: Response) => {
        const result = getUsers()
        result.then(r => {
            res.json(r)
        }).catch(e => {
            res.json(createException(e));
        })
    })
    app.post("/api/user_info", async (req: Request, res: Response) => {
        const {token} = req.body
        if (!validateToken(token)) {
            res.json(returnInvalidToken())
            return
        }
        getUser(token).then(r => {
            res.json(r)
        }).catch(e => {
            res.json(createException(e));
        })
    })
    app.post("/api/update_user_info", (req: Request, res: Response) => {
        const {token, name, username, email, phoneNumber} = req.body
        for (let item of [token, name, username, email, phoneNumber]) {
            if (item == undefined) {
                res.json(createException("Du lieu nhap vao khong dung"))
                return
            }
        }
        if (!validateToken(token)) {
            res.json(returnInvalidToken())
            return;
        }
        const {id} = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload
        updateUserInfo(id, {
            id: null,
            username: username,
            name: name,
            email: email,
            phoneNumber: phoneNumber,
            password: null,
            modifiedAt: null,
            createAt: null
        }).then(r => {
            res.json(r)
        }).catch(e => {
            res.json(createException(e));
        })
    })

    app.post("/api/update_user_password", (req: Request, res: Response) => {
        const {token, oldPassword, newPassword} = req.body
        if (!validateToken(token)) {
            res.json(returnInvalidToken())
            return
        }
        const {id} = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload
        updateUserPassword(id, oldPassword, newPassword).then(r => {
            res.json(r)
        }).catch(e => {
            res.json(createException(e));
        })
    })
    app.post("/api/update_user_address", (req: Request, res: Response) => {
        const {token, address, phoneNumber} = req.body
        if (!validateToken(token)) {
            res.json(returnInvalidToken())
            return
        }
        const {id} = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload
        updateUserAddress(id, {
            id: null,
            address: address,
            phoneNumber: phoneNumber,
            userId: null
        }).then(r => {
            res.json(r)
        }).catch(e => {
            res.json(createException(e));
        })
    })

    // TODO: Should we need this?
    app.post("/api/user_id", async (req: Request, res: Response) => {
        const {username, token} = req.body
        getUserIdByUsername(username, token).then(r => {
            res.json(r)
        }).catch(e => {
            res.json(createException(e));
        })
    })

    app.post("/api/user_address", (req: Request, res: Response) => {
        const {token} = req.body
        if (!validateToken(token)) {
            res.json(returnInvalidToken())
            return
        }
        const {id} = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload
        getUserAddress(id).then(r => {
            res.json(r)
        }).catch(e => {
            res.json(createException(e));
        })
    })
    app.post("/api/user/current-order", (req: Request, res: Response) => {
        const {token} = req.body
        if (!validateToken(token)) {
            res.json(returnInvalidToken())
            return
        }
        const {id} = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload
        getUserCurrentOrder(id).then(r => {
            res.json(r)
        }).catch(e => {
            res.json(createException(e));
        })
    })
    app.post("/api/product_category", (req: Request, res: Response) => {
        const {id} = req.body
        console.log("This is test " + 101)
        console.log(req.body)
        getProductCategory(Number(id)).then(r => {
            res.json(r)
        }).catch(e => {
            res.json(createException(e));
        })
    })
    app.post("/api/discounts", async (req: Request, res: Response) => {
        getDiscounts().then(r => {
            res.json(r)
        }).catch(e => {
            res.json(createException(e));
        })
    })
    app.get("/api/discount", (req: Request, res: Response) => {
        const {id} = req.body
        getDiscount(id).then(r => {
            res.json(r)
        }).catch(e => {
            res.json(createException(e));
        })
    })
    app.post('/api/login', async (req: Request, res: Response) => {
        const {username, password, type, token_device} = req.body
        getUserLoginInfo(username, password, type, token_device).then(r => {
            res.json(r)
        }).catch(e => {
            res.json(createException(e));
        })
    })
    app.post('/api/signup', async (req: Request, res: Response) => {
        const {username, password, email, phoneNumber, name} = req.body
        if (username == undefined || username.toString() == "") {
            res.json(createException("Chua nhap ten nguoi dung!"))
            return
        }
        if (password == undefined || password.toString() == "") {
            res.json(createException("Chua nhap mat khau!"))
            return
        }
        if (email == undefined || email.toString() == "") {
            res.json(createException("Chua nhap email!"))
            return
        }
        if (phoneNumber == undefined || phoneNumber.toString() == "") {
            res.json(createException("Chua nhap so dien thoai!"))
            return
        }
        if (name == undefined || name.toString() == "") {
            res.json(createException("Chua nhap ten!"))
            return
        }

        createUser({
            username: username,
            password: password,
            email: email,
            phoneNumber: phoneNumber,
            name: name,
            id: null,
            createAt: null,
            modifiedAt: null
        }).then(r => {
            res.json(r)
        }).catch(e => {
            res.json(createException(e));
        })
    })
    app.post("/api/products", (req: Request, res: Response) => {
        getProducts().then(r => {
            res.json(r)
        }).catch(e => {
            res.json(createException(e));
        })
    })
    app.post("/api/product", (req, res: Response) => {
        const {id} = req.body
        getProduct(id).then(r => {
            res.json(r)
        }).catch(e => {
            res.json(createException(e));
        })
    })
    app.post("/api/get_products_by_category", (req: Request, res: Response) => {
        const {categoryId} = req.body
        getProductsByCategoryId(categoryId).then(r => {
            res.json(r)
        }).catch(e => {
            res.json(createException(e));
        })
    })
    app.post("/api/shopping_session/get_session_id", (req: Request, res: Response) => {
        const {token} = req.body
        if (!validateToken(token)) {
            res.json(returnInvalidToken())
            return
        }
        const {id} = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload
        getUserSessionId(id).then(r => {
            res.json(r)
        }).catch(e => {
            res.json(createException(e));
        })
    })
    app.post("/api/shopping_session/create_session", (req: Request, res: Response) => {
        const {token} = req.body
        if (!validateToken(token)) {
            res.json(returnInvalidToken())
            return
        }
        const {id} = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload
        createShoppingSession(id).then(r => {
            res.json(r)
        }).catch(e => {
            res.json(createException(e));
        })
    })
    app.post("/api/shopping_session/delete_session", (req: Request, res: Response) => {
        const {token, sessionId} = req.body
        if (!validateToken(token)) {
            res.json(returnInvalidToken())
            return
        }
        const userId = (jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload).id
        deleteShoppingSession(userId, sessionId).then(r => {
            res.json(r)
        }).catch(e => {
            res.json(createException(e));
        })
    })
    app.post("/api/shopping_session/get_cart_info", (req: Request, res: Response) => {
        const {token, sessionId} = req.body
        if (!validateToken(token)) {
            res.json(returnInvalidToken())
            return
        }
        const {id} = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload
        getCartInfo(id, sessionId).then(r => {
            res.json(r)
        }).catch(e => {
            res.json(createException(e));
        })
    })
    app.post("/api/shopping_session/add_item", (req: Request, res: Response) => {
        const {token, sessionId, productId, quantity, size, note} = req.body
        if (!validateToken(token)) {
            res.json(returnInvalidToken())
            return
        }
        const userId = (jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload).id
        addItemToCart(userId, sessionId, productId, quantity, size, note).then(r => {
            res.json(r)
        }).catch(e => {
            res.json(createException(e));
        })
    })
    app.post("/api/shopping_session/delete_item", (req: Request, res: Response) => {
        const {token, itemId, sessionId} = req.body
        if (!validateToken(token)) {
            res.json(returnInvalidToken())
            return
        }
        if (token == undefined) {
            res.end("Provide token!")
            return
        }
        removeItemFromCart(itemId, sessionId).then(r => {
            res.json(r);
        }).catch(e => {
            res.json(createException(e));
        })
    });

    app.post("/api/shopping_session/items", (req: Request, res: Response) => {
        console.log(req.body)
        const {token, sessionId} = req.body
        console.log(token)
        console.log(sessionId)
        if (!validateToken(token)) {
            res.json(returnInvalidToken())
            return
        }
        const userId = (jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload).id
        getCartItems(userId, sessionId).then(r => {
            res.json(r)
        }).catch(e => {
            res.json(createException(e));
        })
    })
    // I don't even know what did I write XD
    app.post("/api/shopping_session/update_item", (req: Request, res: Response) => {
        const {token, sessionId, productId, quantity, size, note} = req.body
        if (!validateToken(token)) {
            res.json(returnInvalidToken())
            return
        }
        const userId = (jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload).id
        updateCartItem(userId, sessionId, productId, quantity, size, note).then(r => {
            res.json(r)
        }).catch(e => {
            res.json(createException(e));
        })
    })

    app.post("/api/order/confirm_order", (req: Request, res: Response) => {
        const {token, sessionId, provider, phoneNumber, address, note} = req.body
        if (!validateToken(token)) {
            res.json(returnInvalidToken())
            return
        }
        const userId = (jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload).id
        confirmOrder(userId, sessionId, provider, phoneNumber, address, note).then(r => {
            res.json(r)
        }).catch(e => {
            res.json(createException(e));
        })
    })
    app.post("/api/order/re_order", (req: Request, res: Response) => {
        const {token, orderId, note} = req.body
        if (!validateToken(token)) {
            res.json(returnInvalidToken())
            return
        }
        const userId = (jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload).id
        reOrder(userId, orderId, note).then(r => {
            res.json(r)
        }).catch(e => {
            res.end(e.toString())
        })
    })

    app.post("/api/order/get_user_orders", (req: Request, res: Response) => {
        const {token} = req.body
        if (!validateToken(token)) {
            res.json(returnInvalidToken())
            return
        }
        const userId = (jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload).id
        getUserOrders(userId).then(r => {
            res.json(r)
        }).catch(e => {
            res.json(createException(e));
        })
    })
    app.post("/api/order/get_completed_orders", (req: Request, res: Response) => {
        const {token} = req.body
        if (!validateToken(token)) {
            res.json(returnInvalidToken())
            return
        }
        const userId = (jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload).id
        getUserCompletedOrders(userId).then(r => {
            res.json(r)
        }).catch(e => {
            res.json(createException(e));
        })
    })
    app.post("/api/order/get_order_detail", (req: Request, res: Response) => {
        const {token, orderId} = req.body
        if (!validateToken(token)) {
            res.json(returnInvalidToken())
            return
        }
        const userId = (jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload).id
        getOrderDetail(userId, orderId).then(r => {
            res.json(r)
        }).catch(e => {
            res.json(createException(e));
        })
    })
    app.post("/api/order/cancel_order", (req: Request, res: Response) => {
        const {token, orderId} = req.body
        if (!validateToken(token)) {
            res.json(returnInvalidToken())
            return
        }
        const userId = (jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload).id
        userCancelOrder(userId, orderId).then(r => {
            res.json(r)
        }).catch(e => {
            res.json(createException(e));
        })
    })
    app.post("/api/order/get_items", (req: Request, res: Response) => {
        const {token, orderId} = req.body
        if (!validateToken(token)) {
            res.json(returnInvalidToken())
            return
        }
        const userId = (jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload).id
        getItemsInOrder(orderId, userId).then(r => {
            res.json(r)
        }).catch(e => {
            res.json(createException(e));
        })
    })
    // FAV Items
    app.post("/api/fav/items", (req: Request, res: Response) => {
        const {token} = req.body
        if (!validateToken(token)) {
            res.json(returnInvalidToken())
            return
        }
        let user: JWTPayload;
        try {
            user = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload
        } catch (e) {
            res.json(createException("Token không hợp lệ!"))
            return
        }
        getLovedItems(user!.id).then(r => {
            res.json(r)
        }).catch(e => {
            res.json(createException(e));
        })
    })
    app.post("/api/fav/add", (req: Request, res: Response) => {
        const {token, productId} = req.body
        if (!validateToken(token)) {
            res.json(returnInvalidToken())
            return
        }
        const userId = (jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload).id
        addLovedItem(userId, productId).then(r => {
            res.json(r)
        }).catch(e => {
            res.json(createException(e));
        })
    })
    app.post("/api/user/send_reset_email", (req: Request, res: Response) => {
        const {email} = req.body
        sendResetPasswordEmail(email).then(r => {
            res.json(r)
        }).catch(e => {
            res.end(e.toString())
            throw e
        })
    })
    app.get("/api/user/reset_password/", (req: Request, res: Response) => {
        let token = req.query.token as string
        if (!validateToken(token)) {
            res.end("INVALID TOKEN")
        }
        // im so fucking lazy :>
        const email = jwt.verify(token, process.env.JWT_SECRET!) as any
        console.log(email)
        userResetPassword(email.email).then(r => {
            console.log(r)
            res.end("Mật khẩu đã được đặt về mặc định là 'password' (không có dấu nháy đơn)!")
        }).catch(e => {
            res.end("Lỗi không thể đặt lại mật khẩu: " + e.toString())
        })
    })
    app.post("/api/user/active_status", (req: Request, res: Response) => {
        const {token, productId} = req.body
        if (!validateToken(token)) {
            res.json(returnInvalidToken())
            return
        }
        const userId = (jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload).id
        checkActiveStatus(userId).then(r => {
            res.json(r)
        }).catch(e => {
            res.end(e.toString())
        })
    })
    app.post("/api/fav/delete", (req: Request, res: Response) => {
        const {token, productId} = req.body
        if (!validateToken(token)) {
            res.json(returnInvalidToken())
            return
        }
        const userId = (jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload).id
        deleteLovedItem(userId, productId).then(r => {
            res.json(r)
        }).catch(e => {
            res.json(createException(e));
        })
    })
    app.post("/api/fav/check_loved", (req: Request, res: Response) => {
        const {token, productId} = req.body
        if (!validateToken(token)) {
            res.json(returnInvalidToken())
            return
        }
        const userId = (jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload).id
        isUserLovedProduct(userId, productId).then(r => {
            res.json(r)
        }).catch(e => {
            res.json(createException(e));
        })
    })
    app.get("/api/statistical/monthly-chart", (req: Request, res: Response) => {
        res.header('Content-Type: application/json')
        res.header('Access-Control-Allow-Origin: *')
        getMonthlyChart().then(r => {
            res.json(r)
        }).catch(e => {
            res.json(createException(e));
        })
    })
    app.get("/api/statistical/bar-chart", (req: Request, res: Response) => {
        getRangeBarChart().then(result => {
            res.json(result)
        })
    })
    app.get("/api/statistical/yearly-chart", (req: Request, res: Response) => {
        res.header('Content-Type: application/json')
        res.header('Access-Control-Allow-Origin: *')
        getYearlyChart().then(r => {
            res.json(r)
        }).catch(e => {
            res.json(createException(e));
        })
    })
    app.post("/api/product/find", (req: Request, res: Response) => {
        findProductsByName(req.body.query).then(r => {
            res.json(r)
        }).catch(e => {
            res.end(e)
        })
    })
    app.post("/api/notification/promote", (req: Request, res: Response) => {
        getPromotionNotifications().then(r => {
            res.json(r)
        }).catch(e => {
            res.json(createException(e));
        })
    })
    app.post("/api/notification/news", (req: Request, res: Response) => {
        getNewsNotifications().then(r => {
            res.json(r)
        }).catch(e => {
            res.json(createException(e));
        })
    })
    app.post("/api/notification/all", (req: Request, res: Response) => {
        getAllNotifications().then(r => {
            res.json(r)
        }).catch(e => {
            res.json(createException(e));
        })
    })
}

function validateToken(token: string): boolean {
    try {
        jwt.verify(token, process.env.JWT_SECRET!)
        return true
    } catch (e) {
        return false;
    }
}

function returnInvalidToken(): APIResponse<any> {
    return createException("Token không hợp lệ!")
}

