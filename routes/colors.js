const express = require("express");
const router = express.Router();

// middlewares
const { authCheck, adminCheck } = require("../middlewares/auth");

// controller
const { create, remove, list } = require("../controllers/colors");

// routes
router.post("/color", authCheck, adminCheck, create);
router.get("/colors", list);
router.delete("/color/:slug", authCheck, adminCheck, remove);

module.exports = router;
