const express = require("express");

const router = express.Router();

// middlewares
const { authCheck, adminCheck } = require("../middlewares/auth");
// controllers
const {
  userCart,
  getUserCart,
  emptyCart,
  saveAddress,
  getAddress,
  saveProfile,
  getProfile,
  couponValidation,
  applyCouponToUserCart,
  removeCouponFromUserCart,
  orders,
  cancelledorders,
  returnedorders,
  order,
  addToWishlist,
  wishlist,
  removeFromWishlist,
  createCashOrder,
  createOrder,
  shippingcreate,
  shippinglist,
  shippingremove,
  createCancellation,
  createReturn,
  handlenewsletterSubscribe,
  handlechecknewsSubs,
  saveUserForm,
} = require("../controllers/user");

router.post("/user/cart", authCheck, userCart); // save cart
router.get("/user/cart", authCheck, getUserCart); // get cart
router.delete("/user/cart", authCheck, emptyCart); // empty cart
router.post("/user/address", authCheck, saveAddress);
router.get("/user/address", authCheck, getAddress);
router.post("/user/form", saveUserForm);

//user profile
router.post("/user/profile", authCheck, saveProfile);
router.get("/user/profile", authCheck, getProfile);

//user order handling
router.post("/user/order", authCheck, createOrder); // BFT, Waller, easypesa
router.post("/user/cash-order", authCheck, createCashOrder); // cod
router.post("/user/orders", authCheck, orders);
router.post("/user/cancelledorders", authCheck, cancelledorders);
router.post("/user/returnedorders", authCheck, returnedorders);
router.get("/order/:id", authCheck, order);

// coupon
router.post(
  "/user/cart/couponValidate",

  authCheck,
  couponValidation
);
router.post("/user/cart/coupon", authCheck, applyCouponToUserCart);
router.post(
  "/user/cart/removecoupon",

  authCheck,
  removeCouponFromUserCart
);

// shipping
router.post("/shipping", authCheck, adminCheck, shippingcreate);
router.get("/shippings", shippinglist);
router.delete(
  "/shipping/:shippingId",

  authCheck,
  adminCheck,
  shippingremove
);

// wishlist
router.post("/user/wishlist", authCheck, addToWishlist);
router.get("/user/wishlist", authCheck, wishlist);
router.put(
  "/user/wishlist/:productId",

  authCheck,
  removeFromWishlist
);

//Product cancellation & Return
router.post("/user/product/cancel", authCheck, createCancellation);
router.post("/user/product/return", authCheck, createReturn);

// wishlist
router.post(
  "/user/newsletterSubscribe",

  authCheck,
  handlenewsletterSubscribe
);
router.get("/checknewsSubs", authCheck, handlechecknewsSubs);
// router.get("/user/wishlist",   authCheck, wishlist);

// router.get("/user",   (req, res) => {
//   res.json({
//     data: "hey you hit user API endpoint",
//   });
// });

module.exports = router;
