import {Application, Request, Response} from "express";
import {getDownloadURL, getStorage, ref, uploadBytesResumable} from "firebase/storage";
import multer from "multer";
import {createDiscount, deleteDiscount, updateProductCategory, getDiscounts, updateDiscount} from "../postgre";
import {updateDiscountWithoutImage} from "../postgre/Discount";

export function discountRoute(app: Application, upload: multer.Multer) {
    app.get("/discount", async (req: Request, res: Response) => {
        console.log("getting discount ...")
        let discounts = await getDiscounts()
        console.log("DISCOUNT",discounts)
        res.render("discount", {discounts: discounts.result})
    })

    app.post("/delete_discount", (req: Request, res: Response) => {
        deleteDiscount(req.body.id).then(r => {
            res.redirect("/discount")
        }).catch(e => {
            res.end(e.toString())
        })
    })

    app.post("/add_discount", upload.single('image'), (req: Request, res: Response) => {
        if (!req.file) {
            res.end("File required")
        }
        // console.log(req.body)
        const {name, description, discountPercent} = req.body
        const storage = getStorage()
        const metadata = {
            contentType: "image/jpeg"
        }
        const fileName = encodeURIComponent(req!.file!.originalname)
        const storageRef = ref(storage, "/images" + fileName)
        const uploadTask = uploadBytesResumable(storageRef, req!.file!.buffer, metadata)
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
            console.log(error)
        }, () => {
            getDownloadURL(uploadTask.snapshot.ref).then(r => {
                // console.log(r)
                createDiscount({
                    id: null,
                    name: name,
                    description: description,
                    displayImage: r,
                    createAt: "",
                    modifiedAt: "",
                    discountPercent: discountPercent,
                    active: true
                }).then(r1 => {
                    res.redirect("/discount")
                }).catch(e => {
                    console.log(e)
                    res.end(e.toString())
                })
            })
        })
    })

    app.post("/update_discount", upload.single("image"), (req: Request, res: Response) => {
        const {name, description, discountPercent, oldId} = req.body
        if (!req.file) {
             updateDiscountWithoutImage(oldId, {
                id : null,
                name : name,
                description : description,
                displayImage : null,
                modifiedAt : null,
                createAt : null,
                active : true,
                discountPercent : discountPercent
            }).then()
            res.redirect("/discount")
            return
        }
        const storage = getStorage()
        const metadata = {
            contentType: "image/jpeg"
        }
        const fileName = encodeURIComponent(req!.file!.originalname)
        const storageRef = ref(storage, "/images" + fileName)
        const uploadTask = uploadBytesResumable(storageRef, req!.file!.buffer, metadata)
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
            console.log(error)
        }, () => {
            getDownloadURL(uploadTask.snapshot.ref).then(r => {
                // console.log(r)
                updateDiscount(oldId, {
                    id: null,
                    name: name,
                    description: description,
                    displayImage: r,
                    createAt: "",
                    modifiedAt: "",
                    discountPercent: discountPercent,
                    active: true
                }).then(r1 => {
                    console.log(r1)
                    res.redirect("/discount")
                }).catch(e => {
                    res.end(e.toString())
                })
            })
        })
    })
}
