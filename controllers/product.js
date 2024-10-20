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
    req.body.slug = slugify(`${req.body.title}`);

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
      .populate("category")
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

exports.flashcurrent = async (req, res) => {
  //
};

exports.checkFlash = async (req, res) => {
  //
};

exports.productsCount = async (req, res) => {
  let total = await Product.find({}).estimatedDocumentCount().exec();
  res.json(total);
};

// New system - with pagination
const handleQuery = async (req, res, query, page, perPage) => {
  try {
    // Perform text search on title and description
    const textSearchResults = await Product.find({ $text: { $search: query } })
      .populate("category", "_id name")
      .skip((page - 1) * perPage) // Skip products for pagination
      .limit(perPage) // Limit the number of products returned
      .exec();

    const totalTextSearchResults = await Product.find({
      $text: { $search: query },
    }).countDocuments();

    if (textSearchResults.length !== 0) {
      return res.json({
        products: textSearchResults,
        totalProducts: totalTextSearchResults,
      });
    }

    const allProducts = await Product.find({})
      .populate("category", "_id name")
      .exec();

    const lowerCaseQuery = query.toLowerCase();

    // Filter by title, description, etc. and paginate the results
    const searchResults = allProducts.filter((product) => {
      return (
        product.title.toLowerCase().includes(lowerCaseQuery) ||
        product.description.toLowerCase().includes(lowerCaseQuery) ||
        product.category.name.toLowerCase().includes(lowerCaseQuery) ||
        product.brand?.toLowerCase().includes(lowerCaseQuery) ||
        product.art === parseInt(query)
      );
    });

    // Paginate the filtered results
    const paginatedResults = searchResults.slice(
      (page - 1) * perPage,
      page * perPage
    );

    if (paginatedResults.length !== 0) {
      return res.json({
        products: paginatedResults,
        totalProducts: searchResults.length, // Total results count
      });
    }

    res.status(404).json({ message: "No products found" });
  } catch (err) {
    console.error("Error handling query:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const handleCategory = async (req, res, category) => {
  try {
    let products = await Product.find({ category })
      .populate("category", "_id name")
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
    .exec();

  res.json({
    products,
  });
};

exports.searchFilters = async (req, res) => {
  const { query, category, brand } = req.body.arg;
  const page = req.body.page;
  const perPage = req.body.perPage;

  if (query) {
    // console.log("query --->", query);
    await handleQuery(req, res, query, page, perPage);
  }

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
