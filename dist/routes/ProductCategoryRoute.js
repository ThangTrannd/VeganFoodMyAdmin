"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productCategoryRoute = void 0;
const storage_1 = require("firebase/storage");
const postgre_1 = require("../postgre");
const ProductCategory_1 = require("../postgre/ProductCategory");
function productCategoryRoute(app, upload) {
    app.get('/category', (req, res) => {
        // if (req.session.userid === 'admin') {
        //     res.render('product_category')
        // } else {
        //     res.redirect('/login')
        // }
        (0, postgre_1.getProductCategories)().then(r => {
            console.log(r);
            res.render('product_category', { categories: r.result });
        });
        // res.render('product_category')
    });
    app.post("/update_product_category", upload.single('image'), (req, res) => {
        // console.log(req.body)
        const { id, name, description } = req.body;
        if (!req.file) {
            (0, ProductCategory_1.updateProductCategoryWithoutImage)(id, {
                id: null,
                name: name,
                description: description,
                displayImage: null,
                modifiedAt: null,
                createAt: null
            }).then(r => {
                res.redirect('/category');
            }).catch(e => {
                res.end(e.toString());
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
            console.log('Upload is ' + progress + '% done');
            switch (snapshot.state) {
                case 'paused':
                    console.log('Upload is paused');
                    break;
                case 'running':
                    console.log('Upload is running');
                    break;
            }
        }, (error) => {
            console.log(error);
        }, () => {
            (0, storage_1.getDownloadURL)(uploadTask.snapshot.ref).then(r => {
                // console.log(r)
                (0, postgre_1.updateProductCategory)(req.body.id, {
                    id: null,
                    name: name,
                    description: description,
                    displayImage: r,
                    createAt: null,
                    modifiedAt: null
                }).then(r1 => {
                    res.redirect("/category");
                }).catch(e => {
                    res.end(e.toString());
                });
            });
        });
    });
    app.post("/add_category", upload.single('image'), (req, res) => {
        if (!req.file) {
            res.end("File required");
        }
        const { name, description } = req.body;
        const storage = (0, storage_1.getStorage)();
        const metadata = {
            contentType: "image/jpeg"
        };
        const fileName = encodeURIComponent(req.file.originalname);
        const storageRef = (0, storage_1.ref)(storage, "/images" + fileName);
        const uploadTask = (0, storage_1.uploadBytesResumable)(storageRef, req.file.buffer, metadata);
        uploadTask.on("state_changed", (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
            switch (snapshot.state) {
                case 'paused':
                    console.log('Upload is paused');
                    break;
                case 'running':
                    console.log('Upload is running');
                    break;
            }
        }, (error) => {
            console.log(error);
        }, () => {
            (0, storage_1.getDownloadURL)(uploadTask.snapshot.ref).then(r => {
                // console.log(r)
                (0, postgre_1.addProductCategory)({
                    id: null,
                    name: name,
                    description: description,
                    displayImage: r,
                    createAt: null,
                    modifiedAt: null
                }).then(r1 => {
                    res.redirect("/category");
                }).catch(e => {
                    res.end(e.toString());
                });
            });
        });
    });
    app.post("/delete_category", (req, res) => {
        const { id } = req.body;
        (0, postgre_1.deleteProductCategory)(id).then(r => {
            console.log(r);
            if (r.isSuccess && r.errorMessage == null) {
                res.redirect("/category");
            }
            else {
                res.end(("Unknown Error"));
            }
        }).catch(e => {
            res.end(e.toString());
        });
    });
}
exports.productCategoryRoute = productCategoryRoute;
