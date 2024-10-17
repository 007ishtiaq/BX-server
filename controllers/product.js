const Product = require("../models/product");
const Review = require("../models/review");
const User = require("../models/user");
const slugify = require("slugify");
const Category = require("../models/category");
const Shipping = require("../models/shipping");

exports.create = async (req, res) => {
  try {
    // Check if the 'art' already exists
    const existingProduct = await Product.findOne({ art: req.body.art });
    if (existingProduct) {
      return res.status(400).json({ error: "Article Number already exists" });
    }

    // Generate slug based on title and color
    req.body.slug = slugify(`${req.body.title} - ${req.body.color}`);

    // Handle shipping charges
    if (req.body.shippingcharges === "" || req.body.shippingcharges == null) {
      // Calculate shipping charges if not provided or empty string
      let shippingfee = 0;
      let shippings = await Shipping.find({}).exec();
      for (let i = 0; i < shippings.length; i++) {
        if (
          req.body.weight <= shippings[i].weightend &&
          req.body.weight >= shippings[i].weightstart
        ) {
          shippingfee = shippings[i].charges;
        }
      }
      req.body.shippingcharges = shippingfee;
    }

    // Create new product
    const newProduct = await Product.create(req.body);
    res.json(newProduct);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.listAll = async (req, res) => {
  let products = await Product.find({})
    .limit(parseInt(req.params.count))
    .populate("category")
    .sort([["createdAt", "desc"]])
    .exec();
  res.json(products);
};

exports.listByPage = async (req, res) => {
  const page = req.body.page;
  const perPage = req.body.perPage;

  try {
    const currentPage = page || 1;

    const products = await Product.find({})
      .skip((currentPage - 1) * perPage)
      .limit(perPage)
      .populate("category")
      .sort([["createdAt", "desc"]])
      .exec();
    const totalProducts = await Product.countDocuments();

    res.json({ products, totalProducts });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Internal Server Error, fetching products" });
  }
};

exports.remove = async (req, res) => {
  try {
    const deleted = await Product.findOneAndRemove({
      slug: req.params.slug,
    }).exec();
    res.json(deleted);
  } catch (err) {
    console.log(err);
    return res.staus(400).send("Product delete failed");
  }
};

exports.read = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .select("-saleTime") // Exclude the saleTime field
      .populate("category")
      .populate("attributes.subs")
      .populate("attributes.subs2")
      .exec();

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(400).send(error);
  }
};
exports.readAdmin = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .populate("category")
      .populate("attributes.subs")
      .populate("attributes.subs2")
      .exec();

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(400).send(error);
  }
};

exports.listSimilar = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .populate("category")
      .populate("attributes.subs")
      .populate("attributes.subs2")
      .exec();

    const patern = product.slug.substring(0, product.slug.lastIndexOf("-"));

    let Products = [];
    if (patern) {
      Products = await Product.find({
        slug: { $regex: patern },
        brand: product.brand,
        _id: { $ne: product._id },
      }).select("images title slug category");
    }
    const similarProducts = [];
    Products &&
      Products.map((prod) => {
        similarProducts.push({
          _id: prod._id,
          slug: prod.slug,
          img: prod.images[0],
          title: prod.title,
          category: prod.category,
        });
      });

    res.status(200).json(similarProducts);
  } catch (error) {
    res.status(400).send(error);
  }
};

exports.listRelated = async (req, res) => {
  const { productId } = req.params; // Get the product ID from the request params

  try {
    // Find the product by ID
    const product = await Product.findById(productId)
      // .populate("category")
      .select("category")
      .exec();

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Find related products in the same category, excluding the current product
    const relatedProducts = await Product.find({
      category: product.category, // Use categoryId directly
      _id: { $ne: product._id }, // Exclude the current product
    })
      .populate("category")
      .select("images title slug category") // Select only the specified fields
      .exec();

    console.log(relatedProducts);

    res.status(200).json(relatedProducts);
  } catch (error) {
    res.status(400).send(error);
  }
};

exports.update = async (req, res) => {
  try {
    // Find the product being updated
    const productToUpdate = await Product.findOne({ slug: req.params.slug });

    // If the 'art' value is being changed
    if (req.body.art && req.body.art !== productToUpdate.art) {
      // Check if the new 'art' value already exists
      const existingProduct = await Product.findOne({ art: req.body.art });
      if (existingProduct && existingProduct.slug !== req.params.slug) {
        return res.status(400).json({ error: "Article Number already exists" });
      }
    }

    if (req.body.title && req.body.color) {
      req.body.slug = slugify(`${req.body.title} - ${req.body.color}`);
    }

    // Handle shipping charges
    if (req.body.shippingcharges === "" || req.body.shippingcharges == null) {
      // Calculate shipping charges if not provided or empty string
      let shippingfee = 0;
      let shippings = await Shipping.find({}).exec();
      for (let i = 0; i < shippings.length; i++) {
        if (
          req.body.weight <= shippings[i].weightend &&
          req.body.weight >= shippings[i].weightstart
        ) {
          shippingfee = shippings[i].charges;
        }
      }
      req.body.shippingcharges = shippingfee;
    }

    const updated = await Product.findOneAndUpdate(
      { slug: req.params.slug },
      req.body,
      { new: true }
    ).exec();
    res.json(updated);
  } catch (err) {
    console.log("PRODUCT UPDATE ERROR ----> ", err);
    // return res.status(400).send("Product update failed");
    res.status(400).json({
      err: err.message,
    });
  }
};

// WITHOUT PAGINATION
// exports.list = async (req, res) => {
//   try {
//     // createdAt/updatedAt, desc/asc, 3
//     const { sort, order, limit } = req.body;
//     const products = await Product.find({})
//       .populate("category")
//       .populate("subs")
//       .sort([[sort, order]])
//       .limit(limit)
//       .exec();

//     res.json(products);
//   } catch (err) {
//     console.log(err);
//   }
// };

// WITH PAGINATION
// exports.list = async (req, res) => {
//   try {
//     const { sort, order, page } = req.body;
//     const currentPage = page || 1;
//     const perPage = 3; // 3

//     const products = await Product.find({})
//       .skip((currentPage - 1) * perPage)
//       .populate("category")
//       .populate("subs")
//       .populate("subs2")
//       .sort([[sort, order]])
//       .limit(perPage)
//       .exec();

//     res.json(products);
//   } catch (err) {
//     console.log(err);
//   }
// };

// exports.flashlist = async (req, res) => {
//   try {
//     const products = await Product.find({ onSale: "Yes" })
//       .populate("category")
//       .populate("subs")
//       .populate("subs2")
//       .exec();

//     res.json(products);
//   } catch (err) {
//     console.log(err);
//     res.status(400).send("Flash Products list failed");
//   }
// };

exports.flashcurrent = async (req, res) => {
  try {
    const now = new Date();
    const products = await Product.find({ onSale: "Yes" })
      .populate("category")
      .populate("attributes.subs")
      .populate("attributes.subs2")
      .exec();

    const uniqueTimes = Array.from(
      new Set(products.map((product) => new Date(product.saleTime)))
    );

    const SaleTimeWhichpassed = uniqueTimes
      .filter((time) => time <= now) // Filter out past sale times
      .sort((a, b) => a - b)[0]; // Sort in ascending order // Get the first (nearest) sale time

    // Reset sale time for products that have passed the nearest sale time
    if (SaleTimeWhichpassed <= now) {
      const bulkOption = products
        .filter((product) => new Date(product.saleTime) <= now)
        .map((product) => ({
          updateOne: {
            filter: { _id: product._id }, // Filter by product ID
            update: { $set: { saleTime: "", onSale: "No", disprice: "" } },
          },
        }));
      await Product.bulkWrite(bulkOption, {});
    }

    // Return products that are currently on sale
    const updatedProducts = await Product.find({ onSale: "Yes" })
      .populate("category")
      .populate("attributes.subs")
      .populate("attributes.subs2")
      .exec();

    const nearestSaleTime = uniqueTimes
      .filter((time) => time >= now) // Filter out past sale times
      .sort((a, b) => a - b)[0]; // Sort in ascending order // Get the first (nearest) sale time

    const productsNearCurrentTime = updatedProducts.filter((product) => {
      const productSaleTime = new Date(product.saleTime);
      return +productSaleTime === +nearestSaleTime;
    });

    res.json(productsNearCurrentTime);
  } catch (err) {
    console.log(err);
    res.status(400).send("Flash Products list failed");
  }
};

exports.checkFlash = async (req, res) => {
  try {
    const slug = req.params.slug;
    // Get the product from the Product collection based on the slug
    const product = await Product.findOne({ slug }).exec();

    if (!product) {
      return res.status(404).send("Product not found");
    }

    // Store the product's saleTime in a variable
    const productSaleTime = new Date(product.saleTime);

    // Get all products that are currently on sale
    const productsOnSale = await Product.find({ onSale: "Yes" }).exec();

    const now = new Date();

    // Calculate the nearest sale time among the products that are currently on sale
    const uniqueTimes = Array.from(
      new Set(productsOnSale.map((product) => new Date(product.saleTime)))
    );

    const SaleTimeWhichpassed = uniqueTimes
      .filter((time) => time <= now) // Filter out past sale times
      .sort((a, b) => a - b)[0]; // Sort in ascending order // Get the first (nearest) sale time

    // Reset sale time for products that have passed the nearest sale time
    if (SaleTimeWhichpassed <= now) {
      const bulkOption = productsOnSale
        .filter((product) => new Date(product.saleTime) <= now)
        .map((product) => ({
          updateOne: {
            filter: { _id: product._id }, // Filter by product ID
            update: { $set: { saleTime: "", onSale: "No", disprice: "" } },
          },
        }));
      await Product.bulkWrite(bulkOption, {});
    }

    // Return products that are currently on sale
    const updatedProducts = await Product.find({ onSale: "Yes" })
      .populate("category")
      .populate("attributes.subs")
      .populate("attributes.subs2")
      .exec();

    // Calculate the nearest sale time among the products that are currently on sale
    const uniqueSaleTimes = Array.from(
      new Set(updatedProducts.map((product) => new Date(product.saleTime)))
    );

    const nearestSaleTime = uniqueSaleTimes
      .filter((time) => time >= now) // Filter out past sale times
      .sort((a, b) => a - b)[0]; // Get the first (nearest) sale time

    // Check if the stored product's saleTime equals the nearestSaleTime
    if (productSaleTime.getTime() === nearestSaleTime.getTime()) {
      return res.send(nearestSaleTime.toISOString()); // Return nearestSaleTime if they match
    } else {
      return res.send("Not on Sale"); // Return nothing if the condition is not met
    }
  } catch (err) {
    console.log(err);
    res.status(400).send("Error checking flash");
  }
};

// exports.flashreset = async (req, res) => {
//   try {
//     console.log("req.body of Flash reset", req.body.date);

//     let products = await Product.find({ onSale: "Yes" }).exec();

//     let bulkOption = products.map((item) => {
//       return {
//         updateOne: {
//           filter: { saleTime: req.body.date }, // IMPORTANT item.product
//           update: { $set: { saleTime: "", onSale: "No" } },
//         },
//       };
//     });
//     const updated = await Product.bulkWrite(bulkOption, {});
//     console.log("flash reset success", updated);
//   } catch (err) {
//     console.log("Flash UPDATE ERROR ----> ", err);
//   }
// };

exports.productsCount = async (req, res) => {
  let total = await Product.find({}).estimatedDocumentCount().exec();
  res.json(total);
};

// New system - with pagination

const handleCategory = async (req, res, category) => {
  try {
    let products = await Product.find({ category })
      .populate("category", "_id name")
      .populate("attributes.subs")
      .populate("attributes.subs2")
      .exec();

    res.json({
      products,
    });
  } catch (err) {
    console.log(err);
  }
};

const handleBrand = async (req, res, brand) => {
  const products = await Product.find({ brand })
    .populate("category", "_id name")
    .populate("attributes.subs")
    .populate("attributes.subs2")
    // .populate("subs2")
    // .populate("postedBy", "_id name")
    .exec();

  res.json({
    products,
  });
};

exports.searchFilters = async (req, res) => {
  const { category, brand } = req.body.arg;
  const page = req.body.page;
  const perPage = req.body.perPage;
  if (category) {
    // console.log("category ---> ", category);
    await handleCategory(req, res, category);
  }
  if (brand) {
    // console.log("brand ---> ", brand);
    await handleBrand(req, res, brand);
  }
};

exports.highestprice = async (req, res) => {
  try {
    const highestPriceProduct = await Product.findOne()
      .sort({ price: -1 }) // Sort in descending order by price
      .exec();

    res.json(highestPriceProduct.price);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
