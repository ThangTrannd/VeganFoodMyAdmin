import {isAdminLogin} from "./Admin";
import {
	addProductCategory,
	deleteProductCategory,
	getProductCategories,
	getProductCategory,
	updateProductCategory
} from "./ProductCategory";
import {createDiscount, deleteDiscount, getDiscount, getDiscounts, updateDiscount} from "./Discount";
import {
	addUserMomoPayment,
	createUser,
	deleteUser,
	getUser,
	getUserIdByUsername,
	getUserLoginInfo,
	getUsers,
	updateUserAddress,
	updateUserInfo,
	updateUserMomoPayment,
	updateUserPassword
} from "./User";
import {addProduct, getProduct, getProducts, updateProduct} from "./Product";
import {createShoppingSession, deleteShoppingSession} from "./ShoppingSession";
import {addItemToCart, getCartItems, removeItemFromCart} from "./CartItem";
import {getLovedItems} from "./LovedProducts";
import {getAllStatistical} from "./Statistical";

export {
	isAdminLogin,
	addProductCategory,
	getProductCategories,
	updateProductCategory,
	deleteProductCategory,
	createDiscount,
	getDiscounts,
	deleteDiscount,
	updateDiscount,
	getProductCategory,
	getDiscount,
	createUser,
	getUsers,
	getUser,
	deleteUser,
	updateUserAddress,
	updateUserInfo,
	getUserLoginInfo,
	addProduct,
	updateProduct,
	getProduct,
	getProducts,
	updateUserPassword,
	updateUserMomoPayment,
	getUserIdByUsername,
	addUserMomoPayment,
	addItemToCart,
	createShoppingSession,
	removeItemFromCart,
	deleteShoppingSession,
	getCartItems,
	getLovedItems,
	getAllStatistical
};

export function createException(e: any): APIResponse<any> {
	console.log(e);
	return {
		isSuccess: false,
		errorMessage: "Lỗi server: " + e,
		result: null
	};
}

export function createResult(result: any): APIResponse<any> {
	return {
		isSuccess: true,
		errorMessage: null,
		result: result
	};
}

