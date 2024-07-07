const express = require("express");
const router = express.Router();

// middlewares
const { authCheck, adminCheck } = require("../middlewares/auth");

// controller
const {
  create,
  listAll,
  remove,
  read,
  readAdmin,
  update,
  list,
  reviewslist,
  flashlist,
  flashcurrent,
  checkFlash,
  flashreset,
  productsCount,
  productStar,
  ratedProducts,
  listSimilar,
  listRelated,
  searchFilters,
  highestprice,
} = require("../controllers/product");

// routes
router.post("/product", authCheck, adminCheck, create);
router.get("/products/total", productsCount);

router.get("/products/:count", listAll); // products/100
router.delete("/product/:slug", authCheck, adminCheck, remove);
router.post(
  "/productAdmin/:slug",

  authCheck,
  adminCheck,
  readAdmin
);
router.get("/product/:slug", read);
router.put("/product/:slug", authCheck, adminCheck, update);

// list products based on bestselling
// router.post("/products",   list);

// list reviews based on createdOn date
router.post("/reviews", reviewslist);

//Flashsale
// router.post("/products/flash",   flashlist);
router.post("/products/currentflash", flashcurrent);
router.post("/product/checkflash/:slug", checkFlash);
// router.post("/product/flashreset",   flashreset);

// rating
router.put("/product/review/:productId", authCheck, productStar);
router.get("/ratedAll", authCheck, ratedProducts);
// Similar
router.get("/product/Similar/:slug", listSimilar);
// related
// router.get("/product/related/:productId",   listRelated);
// search
router.post("/search/filters", searchFilters);
// Highest Price for price filter
router.get("/search/highestprice", highestprice);

//Product review jumia
// router.post("/rateproduct/:id", authCheck, RatingProduct);

module.exports = router;
