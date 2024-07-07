const express = require("express");

const router = express.Router();

// middlewares
const { authCheck, adminCheck } = require("../middlewares/auth");

// controllers
const {
  submitContact,
  list,
  listforms,
  readform,
  readapplyform,
  setReplied,
  setapplyformReplied,
} = require("../controllers/contact");

// routes
router.post("/contact", submitContact);
router.get("/contactForms", authCheck, adminCheck, list);
router.get("/applyForms", authCheck, adminCheck, listforms);
router.get("/contactForm/:id", authCheck, adminCheck, readform);
router.get("/applyForm/:id", authCheck, adminCheck, readapplyform);
router.put(
  "/contactForm/replied",

  authCheck,
  adminCheck,
  setReplied
);
router.put(
  "/applyForm/replied",

  authCheck,
  adminCheck,
  setapplyformReplied
);

module.exports = router;
