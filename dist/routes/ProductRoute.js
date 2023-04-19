"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productRoute = void 0;
const storage_1 = require("firebase/storage");
const postgre_1 = require("../postgre");
const Product_1 = require("../postgre/Product");
function productRoute(app, upload) {
    app.get("/product", async (req, res) => {
        // res.render('product')
        try {
            // let productCategories = await getProductCategories()
            // let discounts = await getDiscounts()
            // let products = await getProducts()
            /*Put all promises into a pool, faster than call each, 3s-> 1.5s*/
            const result = await Promise.all([(0, postgre_1.getProductCategories)(), (0, postgre_1.getDiscounts)(), (0, postgre_1.getProducts)()]);
            res.render("product", {
                productCategories: result[0].result,
                discounts: result[1].result,
                products: result[2].result
            });
        }
        catch (e) {
            res.end(e);
        }
    });
    app.post("/add_product", upload.single("image"), (req, res) => {
        console.log(req.body);
        const name = req.body.name;
        const description = req.body.description;
        const productCategory = req.body.productCategory;
        const quantity = req.body.quantity;
        const endDate = new Date(req.body.endDate).toUTCString();
        const price = req.body.price;
        const discount = req.body.discount == "" ? null : req.body.discount;
        const sizeS = req.body.sizeS != undefined ? "X" : "";
        const sizeM = req.body.sizeM != undefined ? "M" : "";
        const sizeL = req.body.sizeL != undefined ? "L" : "";
        console.log(discount);
        console.log(endDate);
        if (!req.file) {
            res.end("File required");
        }
        const storage = (0, storage_1.getStorage)();
        const metadata = {
            contentType: "image/jpeg"
        };
        const fileName = encodeURIComponent(req.file.originalname);
        const storageRef = (0, storage_1.ref)(storage, "/images" + fileName);
        const uploadTask = (0, storage_1.uploadBytesResumable)(storageRef, req.file.buffer, metadata);
        uploadTask.on("state_changed", (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            switch (snapshot.state) {
                case "paused":
                    console.log("Upload is paused");
                    break;
                case "running":
                    console.log("Upload is running");
                    break;
            }
        }, (error) => {
            console.log(error);
        }, () => {
            (0, storage_1.getDownloadURL)(uploadTask.snapshot.ref).then(r => {
                (0, postgre_1.addProduct)({
                    id: null,
                    productName: name,
                    productDescription: description,
                    productCategoryId: productCategory,
                    quantity: quantity,
                    price: price,
                    endDate: endDate,
                    size: sizeS + "," + sizeM + "," + sizeL,
                    discountId: discount,
                    displayImage: r,
                    productCategoryName: null,
                    discount: null,
                    active: true,
                    discountPercent: null,
                    priceAfterDiscount: null
                }).then(r => {
                    console.log(r);
                    res.redirect("/product");
                }).catch(e => {
                    console.log(e);
                    res.end(e.toString());
                });
            });
        });
    });
    app.post("/delete_product", (req, res) => {
        const { id } = req.body;
        (0, Product_1.deleteProduct)(id).then(r => {
            res.redirect("/product");
        }).catch(e => {
            res.end(e.toString());
        });
    });
    app.post("/update_product", upload.single("image"), (req, res) => {
        const name = req.body.name;
        const description = req.body.description;
        const productCategory = req.body.productCategory;
        const quantity = req.body.quantity;
        const price = req.body.price;
        const endDate = new Date(req.body.endDate).toUTCString();
        const discount = req.body.discount == "" ? null : req.body.discount;
        const sizeS = req.body.sizeS != undefined ? "S" : "";
        const sizeM = req.body.sizeM != undefined ? "M" : "";
        const sizeL = req.body.sizeL != undefined ? "L" : "";
        const oldId = req.body.oldId;
        if (!req.file) {
            (0, Product_1.updateProductWithoutImage)({
                id: null,
                productName: name,
                productDescription: description,
                productCategoryId: productCategory,
                quantity: quantity,
                price: price,
                endDate: endDate,
                size: sizeS + "," + sizeM + "," + sizeL,
                discountId: discount,
                displayImage: null,
                productCategoryName: null,
                discount: null,
                active: true,
                discountPercent: null,
                priceAfterDiscount: null
            }, oldId).then(() => {
                res.redirect("/product");
                return;
            }).catch(r => {
                console.log(r);
            });
            return;
        }
        const storage = (0, storage_1.getStorage)();
        const metadata = {
            contentType: "image/jpeg"
        };
        const fileName = encodeURIComponent(req.file.originalname);
        const storageRef = (0, storage_1.ref)(storage, "/images" + fileName);
        const uploadTask = (0, storage_1.uploadBytesResumable)(storageRef, req.file.buffer, metadata);
        uploadTask.on("state_changed", (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            switch (snapshot.state) {
                case "paused":
                    console.log("Upload is paused");
                    break;
                case "running":
                    console.log("Upload is running");
                    break;
            }
        }, (error) => {
            console.log(error);
        }, () => {
            (0, storage_1.getDownloadURL)(uploadTask.snapshot.ref).then(r => {
                (0, postgre_1.updateProduct)({
                    id: null,
                    productName: name,
                    productDescription: description,
                    productCategoryId: productCategory,
                    quantity: quantity,
                    price: price,
                    endDate: endDate,
                    size: sizeS + "," + sizeM + "," + sizeL,
                    discountId: discount,
                    displayImage: r,
                    productCategoryName: null,
                    discount: null,
                    active: true,
                    discountPercent: null,
                    priceAfterDiscount: null
                }, oldId).then(r => {
                    console.log(r);
                    res.redirect("/product");
                }).catch(e => {
                    res.end(e.toString());
                });
            });
        });
    });
}
exports.productRoute = productRoute;
