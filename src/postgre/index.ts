import {isAdminLogin} from "./Admin";
import {
    addProductCategory,
    deleteProductCategory,
    updateProductCategory,
    getProductCategories,
    getProductCategory
} from "./ProductCategory";
import {
    createDiscount,
    deleteDiscount,
    getDiscount,
    getDiscounts,
    updateDiscount
} from "./Discount";
import {
    createUser,
    deleteUser,
    getUser,
    getUserLoginInfo,
    getUsers,
    updateUserInfo,
    updateUserAddress,
    updateUserPassword,
    getUserIdByUsername,
    updateUserMomoPayment,
    addUserMomoPayment

} from "./User";
import {
    addProduct, getProducts, getProduct, updateProduct
} from "./Product";
import {createShoppingSession, deleteShoppingSession} from "./ShoppingSession";
import {addItemToCart, removeItemFromCart, getCartItems} from "./CartItem";
import {getLovedItems} from "./LovedProducts";
import {getAllStatistical} from "./Statistical";

export {
    isAdminLogin,
    addProductCategory,
    getProductCategories,
    updateProductCategory,
    deleteProductCategory,
    createDiscount,
    getDiscounts, deleteDiscount,
    updateDiscount,
    getProductCategory,
    getDiscount,
    createUser, getUsers, getUser, deleteUser, updateUserAddress, updateUserInfo, getUserLoginInfo,
    addProduct, updateProduct, getProduct, getProducts,
    updateUserPassword, updateUserMomoPayment, getUserIdByUsername, addUserMomoPayment, addItemToCart, createShoppingSession,
    removeItemFromCart, deleteShoppingSession, getCartItems,
    getLovedItems,
    getAllStatistical
}

export function createException(e: any): APIResponse<any> {
    return {
        isSuccess: false,
        errorMessage: "Lỗi server: " + e,
        result: null
    }
}

export function createResult(result: any): APIResponse<any> {
    return {
        isSuccess: true,
        errorMessage: null,
        result: result
    }
}

