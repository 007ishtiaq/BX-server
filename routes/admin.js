const express = require("express");
const { auth } = require("../firebase");

const router = express.Router();

// middlewares
const { authCheck, adminCheck } = require("../middlewares/auth");

const {
  salesData,
  flashData,
  orders,
  rejectedOrders,
  completedOrders,
  returnedOrders,
  orderStatus,
  orderAccept,
  orderUpdate,
  removeProductandMakeclone,
  actionInfo,
  ledgerInfo,
  setcashback,
  setPaid,
  setbackDeliver,
  makeEntry,
  deleteEntry,
  allratings,
} = require("../controllers/admin");

// routes
router.get("/admin/sales", authCheck, adminCheck, salesData);
router.get("/admin/flash", authCheck, adminCheck, flashData);
router.get("/admin/orders", authCheck, adminCheck, orders);
router.get("/admin/rejected-orders", authCheck, adminCheck, rejectedOrders);
router.get("/admin/completed-orders", authCheck, adminCheck, completedOrders);
router.get("/admin/returned-orders", authCheck, adminCheck, returnedOrders);
router.put("/admin/order-status", authCheck, adminCheck, orderStatus);
router.put("/admin/order-accept", authCheck, adminCheck, orderAccept);
router.put("/admin/order-edit", authCheck, adminCheck, orderUpdate);
router.put(
  "/admin/order/item-delete",
  authCheck,
  adminCheck,
  removeProductandMakeclone
);

// Product Action Info cancel or return
router.put("/order/action", authCheck, adminCheck, actionInfo);

// Admin Ledger routes
router.get("/admin/ledger", authCheck, adminCheck, ledgerInfo);

// Admin Order Cashbacked
router.put("/order/cashback", authCheck, adminCheck, setcashback);

// Admin Order All payments Paid
router.put("/order/paid", authCheck, adminCheck, setPaid);

// Admin Order Items back delivered
router.put("/order/delivery", authCheck, adminCheck, setbackDeliver);

// Admin Ledger new entry
router.put("/ledger/entry", authCheck, adminCheck, makeEntry);
// Admin Ledger remove
router.delete("/ledger/entry/:id", authCheck, adminCheck, deleteEntry);

module.exports = router;
