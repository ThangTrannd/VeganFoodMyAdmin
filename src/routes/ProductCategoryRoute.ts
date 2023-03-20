import {Application, Request, Response} from 'express';
import multer from "multer";
import {getDownloadURL, getStorage, ref, uploadBytesResumable} from "firebase/storage";
import {addProductCategory, deleteProductCategory, getProductCategories, updateProductCategory} from "../postgre";
import {updateProductCategoryWithoutImage} from "../postgre/ProductCategory";

export function productCategoryRoute(app: Application, upload: multer.Multer) {
    app.get('/category', (req: Request, res: Response) => {
        // if (req.session.userid === 'admin') {
        //     res.render('product_category')
        // } else {
        //     res.redirect('/login')
        // }
        getProductCategories().then(r => {
            console.log(r)
            res.render('product_category', {categories: r.result})
        })
        // res.render('product_category')
    })

    app.post("/update_product_category", upload.single('image'), (req: Request, res: Response) => {

        // console.log(req.body)
        const {id, name, description} = req.body
        if (!req.file) {
            updateProductCategoryWithoutImage(id, {
                id: null,
                name: name,
                description: description,
                displayImage: null,
                modifiedAt: null,
                createAt: null
            }).then(r => {
                res.redirect('/category')
            }).catch(e => {
                res.end(e.toString())
            })
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
                updateProductCategory(req.body.id, {
                    id: null,
                    name: name,
                    description: description,
                    displayImage: r,
                    createAt: null,
                    modifiedAt: null
                }).then(r1 => {
                    res.redirect("/category")
                }).catch(e => {
                    res.end(e.toString())
                })
            })
        })
    })

    app.post("/add_category", upload.single('image'), (req: Request, res: Response) => {
        if (!req.file) {
            res.end("File required")
        }
        const {name, description} = req.body
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
                addProductCategory({
                    id: null,
                    name: name,
                    description: description,
                    displayImage: r,
                    createAt: null,
                    modifiedAt: null
                }).then(r1 => {
                    res.redirect("/category")
                }).catch(e => {
                    res.end(e.toString())
                })
            })
        })
    })

    app.post("/delete_category", (req: Request, res: Response) => {
        const {id} = req.body
        deleteProductCategory(id).then(r => {
            console.log(r)
            if (r.isSuccess && r.errorMessage == null) {
                res.redirect("/category")
            } else {
                res.end(("Unknown Error"))
            }
        }).catch(e => {
            res.end(e.toString())
        })
    })
}
