const express = require("express");

const router = express.Router();

// middlewares
const { authCheck, adminCheck } = require("../middlewares/auth");

const {
  getAllRatings,
  markRead,
  deleteComment,
} = require("../controllers/ratings");

// Admin Get all user ratings
router.get(
  "/admin/allratings",

  authCheck,
  adminCheck,
  getAllRatings
);
// Admin mark comments read
router.put("/admin/commentRead", authCheck, adminCheck, markRead);
// Admin delete comments
router.put(
  "/admin/deleteComment",

  authCheck,
  adminCheck,
  deleteComment
);

module.exports = router;
