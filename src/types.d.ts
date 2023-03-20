declare type Admin = {
    id: number,
    username: string,
    password: string,
    createAt: string,
    modifiedAt: string,
    updateAt: string
}

declare type ProductCategory = {
    id: number | null,
    name: string,
    description: string,
    displayImage: string | null,
    createAt: string | null,
    modifiedAt: string | null
}

declare type Product = {
    id: number | null,
    productName: string,
    productDescription: string,
    productCategoryName: string | null,
    productCategoryId: number,
    quantity: number,
    price: number,
    discount: string | null,
    discountId: number | null
    discountPercent: number | null,
    priceAfterDiscount: number | null,
    displayImage: string | null,
    size: string,
    active: boolean
}

declare type Discount = {
    id: number | null,
    name: string | null,
    description: string | null,
    discountPercent: number | null,
    createAt: string | null,
    modifiedAt: string | null,
    displayImage: string | null,
    active: boolean
}

declare type User = {
    id: number | null,
    username: string,
    email: string,
    password: string | null,
    name: string,
    phoneNumber: string,
    createAt: string | null,
    modifiedAt: string | null
}


declare type UserAddress = {
    id: number | null,
    userId: number | null,
    address: string,
    phoneNumber: string
}

declare type CartItem = {
    id: number | null,              // Mã sản phẩm trong giỏ hàng tạm
    sessionId: null | number,      // Mã giỏ hàng tạm
    productId: number | null,      // Mã sản phẩm
    quantity: number | null,              // Số lượng sản phẩm trong giỏ hàng
    productName: string | null,           // Tên sản phẩm
    description: string | null,    // Mô tả sản phẩm
    total: number | null,            // Tổng giá trị của sản phẩm (số lượng * giá)
    price: number | null,                 // Giá của 1 sản phẩm
    productCategoryName: string | null,   // Tên loại sản phẩm,
    size: string | null,
    displayImage: string | null,
    discountId: number | null,
    priceBeforeDiscount: number | null,
    priceAfterDiscount: number | null,
    note: string | null
}

declare type APIResponse<T> = {
    isSuccess: boolean
    result: null | any | T,
    errorMessage: null | any
}

declare type AdminLoginLog = {
    id: number | null,
    time: string | null,
    ip: string | null
}

declare type LovedProduct = {
    id: number,
    productId: number,
    productName: string,
    productDescription: string,
    productCategoryName: string,
    discountPercent: number,
    priceBeforeDiscount: number,
    priceAfterDiscount: number,
    displayImage: string,
    size: string
}

declare type NotificationType = {
    "id": number,
    "title": string,
    "message": string,
    "type": string,
    "image": string
}

declare type Order = {
    id: number,
    total: number,
    createat: string,
    status: string,
    provider: string,
    address: string,
    phoneNumber: string,
    totalProduct: number,
    displayImage: string
}

declare type OrderItem = {
    id: number,
    orderId: number,
    productId: number,
    quantity: number,
    productName: string,
    description: string,
    total: number,
    price: number,
    productCategoryName: string,
    displayImage: string,
    size: string,
    priceBeforeDiscount: number,
    priceAfterDiscount: number,
    note: string
}

declare type CartInfo = {
    totalCategory: number,
    totalQuantity: number,
    priceBeforeDiscount: number,
    priceAfterDiscount: number
}










