const express = require("express");
const router = express.Router();

// middlewares
const { authCheck, adminCheck } = require("../middlewares/auth");

// controller
const {
  create,
  list,
  remove,
  listRelated,
  update,
  read,
} = require("../controllers/banner");

// routes
router.post("/banner", authCheck, adminCheck, create);
router.get("/banners", list);
router.delete("/banner/:slug", authCheck, adminCheck, remove);
router.post("/banners", listRelated);
router.put("/banner/:slug", authCheck, adminCheck, update);
router.get("/banner/:slug", read);
// router.put("/category/:slug",   authCheck, adminCheck, update);

module.exports = router;
