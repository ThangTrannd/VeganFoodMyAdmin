import {Application, Response, Request} from 'express';
import multer from "multer";
import {getStorage, ref, uploadBytesResumable, getDownloadURL} from "firebase/storage";
import {
    addProduct,
    addProductCategory,
    deleteProductCategory,
    updateProductCategory,
    getDiscounts,
    getProductCategories, getProducts, updateProduct
} from "../postgre";
import {deleteProduct, updateProductWithoutImage} from "../postgre/Product";

export function productRoute(app: Application, upload: multer.Multer) {
    app.get("/product", async (req: Request, res: Response) => {
        // res.render('product')
        try {
            // let productCategories = await getProductCategories()
            // let discounts = await getDiscounts()
            // let products = await getProducts()
            /*Put all promises into a pool, faster than call each, 3s-> 1.5s*/
            let result = await Promise.all([getProductCategories(), getDiscounts(), getProducts()])
            console.log("DISCOUNT 2",result)
            res.render('product', {
                productCategories: result[0].result,
                discounts: result[1].result,
                products: result[2].result
            })
        } catch (e) {
            res.end(e)
        }

    })

    app.post("/add_product", upload.single("image"), (req: Request, res: Response) => {
        console.log(req.body)
        const name = req.body.name
        const description = req.body.description
        const productCategory = req.body.productCategory
        const quantity = req.body.quantity
        const price = req.body.price
        const discount = req.body.discount == "" ? null : req.body.discount
        const sizeS = req.body.sizeS != undefined ? "X" : ""
        const sizeM = req.body.sizeM != undefined ? "M" : ""
        const sizeL = req.body.sizeL != undefined ? "L" : ""

        console.log(discount)

        if (!req.file) {
            res.end("File required")
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
                addProduct({
                    id: null,
                    productName: name,
                    productDescription: description,
                    productCategoryId: productCategory,
                    quantity: quantity,
                    price: price,
                    size: sizeS + "," + sizeM + "," + sizeL,
                    discountId: discount,
                    displayImage: r,
                    productCategoryName : null,
                    discount : null,
                    active : true,
                    discountPercent : null,
                    priceAfterDiscount : null
                }).then(r => {
                    console.log(r)
                    res.redirect("/product")
                }).catch(e => {
                    console.log(e)
                    res.end(e.toString())
                })
            })
        })
    })

    app.post("/delete_product", (req: Request, res: Response) => {
        const {id} = req.body
        deleteProduct(id).then(r => {
            res.redirect("/product")
        }).catch(e => {
            res.end(e.toString())
        })
    })

    app.post("/update_product", upload.single('image'), (req: Request, res: Response) => {
        const name = req.body.name
        const description = req.body.description
        const productCategory = req.body.productCategory
        const quantity = req.body.quantity
        const price = req.body.price
        const discount = req.body.discount == "" ? null : req.body.discount
        const sizeS = req.body.sizeS != undefined ? "S" : ""
        const sizeM = req.body.sizeM != undefined ? "M" : ""
        const sizeL = req.body.sizeL != undefined ? "L" : ""
        const oldId = req.body.oldId

        if (!req.file) {
            updateProductWithoutImage({
                id: null,
                productName: name,
                productDescription: description,
                productCategoryId: productCategory,
                quantity: quantity,
                price: price,
                size: sizeS + "," + sizeM + "," + sizeL,
                discountId: discount,
                displayImage: null,
                productCategoryName : null,
                discount : null,
                active : true,
                discountPercent : null,
                priceAfterDiscount : null
            }, oldId).then(()=> {
                res.redirect("/product")
                return
            }).catch(r=> {
                console.log(r)
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
                updateProduct({
                    id: null,
                    productName: name,
                    productDescription: description,
                    productCategoryId: productCategory,
                    quantity: quantity,
                    price: price,
                    size: sizeS + "," + sizeM + "," + sizeL,
                    discountId: discount,
                    displayImage: r,
                    productCategoryName : null,
                    discount : null,
                    active : true,
                    discountPercent : null,
                    priceAfterDiscount : null
                }, oldId).then(r => {
                    console.log(r)
                    res.redirect("/product")
                }).catch(e => {
                    res.end(e.toString())
                })
            })
        })
    })
}
