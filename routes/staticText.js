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
} = require("../controllers/staticText");

// routes
router.post("/admin/statictext", authCheck, adminCheck, create);
router.get("/admin/statictexts", list);
router.delete(
  "/admin/statictext/:slug",

  authCheck,
  adminCheck,
  remove
);
router.post("/admin/statictexts/", listRelated);
router.put(
  "/admin/statictext/:slug",

  authCheck,
  adminCheck,
  update
);
router.get("/admin/statictext/:slug", read);

module.exports = router;
