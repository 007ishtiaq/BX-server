const express = require("express");
const router = express.Router();

// middlewares
const { authCheck, adminCheck } = require("../middlewares/auth");

// controllers
const { upload, remove } = require("../controllers/cloudinary");

router.post("/uploadimages", authCheck, adminCheck, upload);
router.post("/removeimage", authCheck, adminCheck, remove);

//for users deposite slip uploading
router.post("/slipupload", authCheck, upload);

//for users Contact form attachment uploading
router.post("/attachment", upload);
router.post("/removeattachment", remove);

module.exports = router;
