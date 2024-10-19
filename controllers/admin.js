const User = require("../models/user");
const Product = require("../models/product");
const QuoteRequest = require("../models/QuoteRequest");
const Review = require("../models/review");
const Order = require("../models/order");
const Productcancel = require("../models/productcancel");
const Productreturn = require("../models/productreturn");
const Ledger = require("../models/ledger");
const Shipping = require("../models/shipping");
const {
  transporter,
  orderReceipttemplate,
  generateInvoicePDF,
} = require("../middlewares/utils");
const fs = require("fs");

const {
  Types: { ObjectId },
} = require("mongoose");
//orders, orderStatus

exports.orders = async (req, res) => {
  let orders = await Order.find({
    $or: [
      {
        orderAccept: { $in: ["Under", "Yes"] },
        orderStatus: {
          $in: ["Not Processed", "Processing", "Dispatched"],
        },
      },
      {
        $and: [{ orderStatus: "Delivered" }, { isPaid: false }],
      },
    ],
  })
    .sort("createdAt")
    .populate("orderdBy")
    .exec();

  res.json(orders);
};

exports.rejectedOrders = async (req, res) => {
  let rejectedOrders = await Order.find({
    orderAccept: "No",
    orderStatus: "Cancelled",
  })
    .sort("-createdAt")
    .populate("orderdBy")
    .exec();

  res.json(rejectedOrders);
};
exports.completedOrders = async (req, res) => {
  let rejectedOrders = await Order.find({
    $and: [
      { orderStatus: "Delivered" },
      { isPaid: true },
      { isDelivered: true },
    ],
  })
    .sort("-createdAt")
    .populate("orderdBy")
    .exec();

  res.json(rejectedOrders);
};
exports.returnedOrders = async (req, res) => {
  let returnedOrders = await Order.find({
    orderStatus: "Returned",
  })
    .sort("-createdAt")
    .populate("orderdBy")
    .exec();

  res.json(returnedOrders);
};

exports.orderStatus = async (req, res) => {
  //
};

exports.orderAccept = async (req, res) => {
  try {
    const { orderId, orderAccept } = req.body;

    let updated = await Order.findByIdAndUpdate(
      orderId,
      { orderAccept },
      { new: true }
    ).exec();

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.orderUpdate = async (req, res) => {
  //
};

exports.removeProductandMakeclone = async (req, res) => {
  //
};

exports.actionInfo = async (req, res) => {
  const { prodId, currentinfo } = req.body;
  try {
    if (currentinfo === "cancel") {
      let ActionInfo = await Productcancel.findOne({ prod: prodId.toString() });
      res.json(ActionInfo);
    }
    if (currentinfo === "return") {
      let ActionInfo = await Productreturn.findOne({ prod: prodId.toString() });
      res.json(ActionInfo);
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
exports.ledgerInfo = async (req, res) => {
  try {
    let ledgerInfo = await Ledger.find({});
    res.json(ledgerInfo);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.setcashback = async (req, res) => {
  const { OrderId } = req.body;
  try {
    // Find the order by OrderId
    const order = await Order.findById(OrderId);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (!order.isPaid) {
      return res.json({
        error: "Order Not Paid, Order cannot be CashBacked",
      });
    } else {
      if (order.orderStatus === "Returned" && !order.isDelivered) {
        return res.json({
          error: "Order Items Not Delivered Back, Order cannot be CashBacked",
        });
      } else {
        // Toggle isCashBack and set CashBackedAt if isCashBack is set to true
        if (!order.isCashBack) {
          order.isCashBack = true;
          order.CashBackedAt = new Date();

          // code for ledger entries
          let allLedgerEntries = await Ledger.find({}).exec();
          let totalDebits = 0;
          let totalCredits = 0;
          allLedgerEntries.forEach((entry) => {
            totalDebits += entry.debit || 0;
            totalCredits += entry.credit || 0;
          });

          let newEntry = await new Ledger({
            date: Date.now(),
            particulars: `${order.orderStatus} "OrderID = ${order.OrderId}"`,
            debit: null,
            credit: order.paymentIntent.amount,
            balance: totalDebits - totalCredits - order.paymentIntent.amount,
          }).save();
        } else {
          order.isCashBack = false;
          order.CashBackedAt = null;

          // Find and delete the ledger entry with the corresponding OrderId in particulars
          await Ledger.deleteOne({
            particulars: `${order.orderStatus} "OrderID = ${order.OrderId}"`,
          });
        }
      }
      // Save the updated order
      await order.save();
      // Return the updated order to the frontend
      res.json({ success: true, isCashBack: order.isCashBack });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.setPaid = async (req, res) => {
  const { OrderId } = req.body;

  try {
    // Find the order by OrderId
    const order = await Order.findById(OrderId);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    // Toggle isCashBack and set CashBackedAt if isCashBack is set to true
    if (!order.isPaid) {
      order.isPaid = true;
      order.paidAt = new Date();

      // code for ledger entries
      let allLedgerEntries = await Ledger.find({}).exec();
      let totalDebits = 0;
      let totalCredits = 0;
      allLedgerEntries.forEach((entry) => {
        totalDebits += entry.debit || 0;
        totalCredits += entry.credit || 0;
      });

      let newEntry = await new Ledger({
        date: Date.now(),
        particulars: `Purchase "MOD: ${order.paymentStatus}" "OrderID = ${order.OrderId}"`,
        debit: order.paymentIntent.amount,
        credit: null,
        balance: totalDebits - totalCredits + order.paymentIntent.amount,
      }).save();
    } else {
      order.isPaid = false;
      order.paidAt = null;

      // Find and delete the ledger entry with the corresponding OrderId in particulars
      await Ledger.deleteOne({
        particulars: `Purchase "MOD: ${order.paymentStatus}" "OrderID = ${order.OrderId}"`,
      });
    }
    // Save the updated order
    await order.save();
    // Return the updated order to the frontend
    res.json({ success: true, isPaid: order.isPaid });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
exports.setbackDeliver = async (req, res) => {
  const { OrderId } = req.body;

  try {
    // Find the order by OrderId
    const order = await Order.findById(OrderId);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    // Toggle isCashBack and set CashBackedAt if isCashBack is set to true
    if (!order.isDelivered) {
      order.isDelivered = true;
      order.deliveredAt = new Date();

      // product qty and sold updation
      for (const productData of order.products) {
        const product = productData.product;
        const count = productData.count;
        await Product.findByIdAndUpdate(product._id, {
          $inc: { quantity: count, sold: -count },
        }).exec();
      }
    } else {
      order.isDelivered = false;
      order.deliveredAt = null;

      // product qty and sold updation
      for (const productData of order.products) {
        const product = productData.product;
        const count = productData.count;
        await Product.findByIdAndUpdate(product._id, {
          $inc: { quantity: -count, sold: count },
        }).exec();
      }
    }
    // Save the updated order
    await order.save();
    // Return the updated order to the frontend
    res.json({ success: true, isDelivered: order.isDelivered });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.makeEntry = async (req, res) => {
  const { Particulars, Debit, Credit } = req.body.newentry;

  if (Debit && Credit) {
    return res.json({
      error: "Debit and Credit both cannot be entred.",
    });
  }

  if (!Particulars || (!Debit && !Credit)) {
    return res.json({
      error: "Particulars or Debit/Credit is missing.",
    });
  }

  // code for ledger entries
  let allLedgerEntries = await Ledger.find({}).exec();
  let totalDebits = 0;
  let totalCredits = 0;
  allLedgerEntries.forEach((entry) => {
    totalDebits += entry.debit || 0;
    totalCredits += entry.credit || 0;
  });

  let balance;

  if (Debit) {
    balance = totalDebits - totalCredits + parseFloat(Debit);
  } else if (Credit) {
    balance = totalDebits - totalCredits - parseFloat(Credit);
  }

  const newEntry = new Ledger({
    date: Date.now(),
    particulars: Particulars,
    debit: Debit || null,
    credit: Credit || null,
    balance: balance || 0,
    editable: true,
  });

  try {
    await newEntry.save();
    res.json({ success: true, message: "Entry added successfully." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteEntry = async (req, res) => {
  try {
    const ledgerEntry = await Ledger.findById(req.params.id);

    // Check if the entry is editable
    if (!ledgerEntry.editable) {
      return res.json({ error: "Delete not allowed. Entry is not editable." });
    }

    const deleted = await Ledger.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).send("Entry delete failed");
  }
};

exports.deleteOrder = async (req, res) => {
  const { id } = req.body;

  try {
    // Find and delete the order by its ID
    const deletedOrder = await Order.findByIdAndDelete(id);

    // If the order was not found, return an error message
    if (!deletedOrder) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Respond with success if the order was deleted
    res.json({ success: true, message: "Order deleted successfully" });
  } catch (err) {
    // Handle errors (e.g., invalid ID format or database errors)
    res
      .status(400)
      .json({ success: false, message: "Failed to delete the order" });
  }
};

exports.sendInvoiceToEmail = async (req, res) => {
  const { id } = req.body;

  try {
    // Fetch the order from the database using the id
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Generate the PDF
    const pdfPath = await generateInvoicePDF(order);

    // Email content
    const mailOptions = {
      from: "Your App <ishtiaqahmad427427@gmail.com>",
      to: order.email,
      subject: `Order Invoice "ID: ${order.OrderId}"`,
      html: orderReceipttemplate(order),
      attachments: [
        {
          filename: `Order Invoice "ID:${order.OrderId}".pdf`,
          path: pdfPath,
          contentType: "application/pdf",
        },
      ],
    };

    // Send email using Mailjet
    await transporter.sendMail(mailOptions);

    // Send success response
    res
      .status(200)
      .json({ message: "Invoice email sent successfully with PDF" });

    // Clean up the PDF file after sending the email
    fs.unlinkSync(pdfPath);
  } catch (error) {
    console.error("Error sending Invoice Email:", error);
    res.status(500).json({ error: "Failed to send Invoice email" });
  }
};

exports.flashData = async (req, res) => {
  try {
    const products = await Product.find({ onSale: "Yes" })
      .select("slug onSale saleTime")
      .exec();

    res.json(products);
  } catch (err) {
    console.log(err);
    res.status(400).send("Flash Products Data failed");
  }
};

// ----------Dashboard function working-----------

exports.salesData = async (req, res) => {
  const today = new Date();
  const currentYear = new Date(today.getFullYear(), 00, 01, 00, 00); //1/1/2023, 12:00:00 AM  - month day year
  const nextYear = new Date(today.getFullYear() + 1, 00, 01, 00, 00); //1/1/2024, 12:00:00 AM - month day year
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    00,
    00
  ); // 11/13/2023, 12:00:00 AM - month day year

  const todayEnd = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 1,
    00,
    00
  ); // 11/14/2023, 12:00:00 AM - month day year
  const monthStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    01,
    00,
    00
  ); // 11/01/2023, 12:00:00 AM - month day year

  try {
    const totalIncom = await Order.aggregate([
      {
        $match: {
          isPaid: true,
          paidAt: { $gte: currentYear, $lt: nextYear },
          orderStatus: {
            $in: ["Not Processed", "Processing", "Dispatched", "Delivered"],
          },
        },
      },
      {
        $group: {
          _id: { $month: "$paidAt" },
          totalIncom: { $sum: "$paymentIntent.amount" },
        },
      },
    ]).sort({ _id: 1 });

    const yearIncom = await Order.aggregate([
      {
        $match: {
          isPaid: true,
          paidAt: { $gte: currentYear, $lt: nextYear },
          orderStatus: {
            $in: ["Not Processed", "Processing", "Dispatched", "Delivered"],
          },
        },
      },
      {
        $group: {
          _id: "",
          totalIncom: { $sum: "$paymentIntent.amount" },
        },
      },
    ]);

    const dailyIncom = await Order.aggregate([
      {
        $match: {
          isPaid: true,
          paidAt: { $gte: todayStart, $lt: todayEnd },
          orderStatus: {
            $in: ["Not Processed", "Processing", "Dispatched", "Delivered"],
          },
        },
      },
      {
        $group: {
          _id: "",
          totalIncom: { $sum: "$paymentIntent.amount" },
        },
      },
    ]);

    const monthIncom = await Order.aggregate([
      {
        $match: {
          isPaid: true,
          paidAt: { $gte: monthStart, $lt: todayEnd },
          orderStatus: {
            $in: ["Not Processed", "Processing", "Dispatched", "Delivered"],
          },
        },
      },
      {
        $group: {
          _id: "",
          totalIncom: { $sum: "$paymentIntent.amount" },
        },
      },
    ]);

    res.status(200).json({ totalIncom, yearIncom, monthIncom, dailyIncom });
  } catch (error) {
    res.status(400).json({ error });
  }
};

exports.addAdminReview = async (req, res) => {
  const { productId, posterName, postedDate, star, comment, images } =
    req.body.data;

  try {
    const user = await User.findOne({ email: req.user.email }).exec();

    const product = await Product.findById(productId).exec();
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    // console.log(product);

    const newReview = new Review({
      star,
      comment,
      postedBy: user._id,
      posterName,
      product: productId,
      postedOn: new Date(postedDate),
      images,
    });

    await newReview.save();
    res.json(newReview);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAdminReview = async (req, res) => {
  const productId = req.body.query;
  // console.log(productId);

  try {
    // Check if productId is provided
    if (productId) {
      // Find the user by their email
      const user = await User.findOne({ email: req.user.email }).exec();

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Find reviews for the product posted by this user and populate the product details (title and first image)
      const reviews = await Review.find({
        product: productId, // Match the product
        postedBy: user._id, // Match the user who posted the review
      })
        .populate({
          path: "product", // Populate the product field
          select: "title images", // Select only title and images from the product schema
          transform: (doc) => ({
            title: doc.title,
            image: doc.images && doc.images.length > 0 ? doc.images[0] : null, // Return only the first image
          }),
        })
        .sort({ postedOn: -1 }) // Sort reviews by postedOn field in descending order (newest first)
        .exec();

      // Return the sorted and populated reviews
      return res.json(reviews);
    } else {
      // If productId is not provided
      return res.status(400).json({ message: "Product ID is required" });
    }
  } catch (err) {
    // Handle any errors that occur
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteAdminReview = async (req, res) => {
  const { reviewId } = req.body; // Extract reviewId from the request body

  try {
    // Check if reviewId is provided
    if (!reviewId) {
      return res.status(400).json({ message: "Review ID is required" });
    }

    // Find and delete the review by its ID
    const deletedReview = await Review.findByIdAndDelete(reviewId);

    // If no review was found with the given ID
    if (!deletedReview) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Successfully deleted the review
    return res.json({ message: "Review deleted successfully" });
  } catch (err) {
    // Handle any errors that occur during deletion
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

exports.listQuoteRequests = async (req, res) =>
  res.json(await QuoteRequest.find({}).sort({ createdAt: 1 }).exec());

exports.readQuoteRequet = async (req, res) => {
  try {
    const QuoteRequet = await QuoteRequest.findById(req.params.id).exec();

    if (!QuoteRequet) {
      return res.status(404).json({ error: "Quote Requet not found" });
    }

    res.json(QuoteRequet);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error contact forms" });
  }
};
exports.setquoteRequestReplied = async (req, res) => {
  try {
    const quoteRequest = await QuoteRequest.findById(req.body.requestId).exec();

    if (!quoteRequest) {
      return res.status(404).json({ error: "Quote Requet not found" });
    }

    if (!quoteRequest.isReplied) {
      quoteRequest.isReplied = true;
    } else {
      quoteRequest.isReplied = false;
    }
    // Save the updated form
    await quoteRequest.save();
    // Return the updated order to the frontend
    res.json({ success: true, isReplied: quoteRequest.isReplied });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error contact forms" });
  }
};

exports.deleteRequest = async (req, res) => {
  const { requestId } = req.body;

  try {
    // Find and delete the order by its ID
    const deletedRequest = await QuoteRequest.findByIdAndDelete(requestId);

    // If the order was not found, return an error message
    if (!deletedRequest) {
      return res
        .status(404)
        .json({ success: false, message: "Quote Request not found" });
    }

    // Respond with success if the order was deleted
    res.json({ success: true, message: "Quote Request deleted successfully" });
  } catch (err) {
    // Handle errors (e.g., invalid ID format or database errors)
    res
      .status(400)
      .json({ success: false, message: "Failed to delete the order" });
  }
};
