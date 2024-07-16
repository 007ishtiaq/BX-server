const express = require("express");
const router = express.Router();

// middlewares
const { authCheck, adminCheck } = require("../middlewares/auth");

// controller
const { create, remove, list } = require("../controllers/stories");

// routes
router.post("/story", authCheck, adminCheck, create);
router.delete("/story/:public_id", authCheck, adminCheck, remove);
router.get("/stories", list);

module.exports = router;
