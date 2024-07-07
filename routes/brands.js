const express = require("express");
const router = express.Router();

// middlewares
const { authCheck, adminCheck } = require("../middlewares/auth");

// controller
const { create, remove, list, read, update } = require("../controllers/brands");

// routes
router.post("/brand", authCheck, adminCheck, create);
router.get("/brands", list);
router.delete("/brand/:slug", authCheck, adminCheck, remove);
router.get("/brand/:slug", read);
router.put("/brand/:slug", authCheck, adminCheck, update);

module.exports = router;
