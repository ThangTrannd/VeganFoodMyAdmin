"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.discountRoute = void 0;
const storage_1 = require("firebase/storage");
const postgre_1 = require("../postgre");
const Discount_1 = require("../postgre/Discount");
function discountRoute(app, upload) {
    app.get("/discount", async (req, res) => {
        const discounts = await (0, postgre_1.getDiscounts)();
        res.render("discount", { discounts: discounts.result });
    });
    app.post("/delete_discount", (req, res) => {
        (0, postgre_1.deleteDiscount)(req.body.id).then(r => {
            res.redirect("/discount");
        }).catch(e => {
            res.end(e.toString());
        });
    });
    app.post("/add_discount", upload.single("image"), (req, res) => {
        if (!req.file) {
            res.end("File required");
        }
        // console.log(req.body)
        const { name, description, discountPercent } = req.body;
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
                // console.log(r)
                (0, postgre_1.createDiscount)({
                    id: null,
                    name: name,
                    description: description,
                    displayImage: r,
                    createAt: "",
                    modifiedAt: "",
                    discountPercent: discountPercent,
                    active: true
                }).then(r1 => {
                    res.redirect("/discount");
                }).catch(e => {
                    console.log(e);
                    res.end(e.toString());
                });
            });
        });
    });
    app.post("/update_discount", upload.single("image"), (req, res) => {
        const { name, description, discountPercent, oldId } = req.body;
        if (!req.file) {
            (0, Discount_1.updateDiscountWithoutImage)(oldId, {
                id: null,
                name: name,
                description: description,
                displayImage: null,
                modifiedAt: null,
                createAt: null,
                active: true,
                discountPercent: discountPercent
            }).then();
            res.redirect("/discount");
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
                // console.log(r)
                (0, postgre_1.updateDiscount)(oldId, {
                    id: null,
                    name: name,
                    description: description,
                    displayImage: r,
                    createAt: "",
                    modifiedAt: "",
                    discountPercent: discountPercent,
                    active: true
                }).then(r1 => {
                    res.redirect("/discount");
                }).catch(e => {
                    res.end(e.toString());
                });
            });
        });
    });
}
exports.discountRoute = discountRoute;
