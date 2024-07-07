const express = require("express");

const router = express.Router();

// middlewares
const { authCheck, adminCheck } = require("../middlewares/auth");

// import
const {
  createOrUpdateUser,
  createOrUpdatePhoneUser,
  currentUser,
} = require("../controllers/auth");

router.post("/create-or-update-user", authCheck, createOrUpdateUser);
// router.post("/create-or-update-phone-user",   authCheck, createOrUpdatePhoneUser);
router.post("/current-user", authCheck, currentUser);
router.post("/current-admin", authCheck, adminCheck, currentUser);

module.exports = router;
