const express = require("express");
const router = express.Router();

// middlewares
const { authCheck, adminCheck } = require("../middlewares/auth");

// controller
const { create, list } = require("../controllers/optinEmail");

// routes
router.post("/optinEmailcreate", create);
router.post("/optinEmailslist", authCheck, adminCheck, list);

module.exports = router;
