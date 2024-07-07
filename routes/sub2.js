const express = require("express");
const router = express.Router();

// middlewares
const { authCheck, adminCheck } = require("../middlewares/auth");

// controller
const { create, read, update, remove, list } = require("../controllers/sub2");

// routes
router.post("/sub2", authCheck, adminCheck, create);
router.get("/subs2", list);
router.get("/sub2/:slug", read);
router.put("/sub2/:slug", authCheck, adminCheck, update);
router.delete("/sub2/:slug", authCheck, adminCheck, remove);

module.exports = router;
