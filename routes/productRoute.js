const express = require("express");
const router = express.Router();
const {
  getAllProducts,
  createProduct,
  updateProduct,  
  deleteProduct,
  getSingleProductDetails,
    createReview,
    getProductReviews,
    deleteReview,
    getAdminProducts,
} = require("../controllers/product");
const { isAuthenticatedUser, authorisedRoles } = require("../Middlewares/auth");

router.route("/products").get(getAllProducts);
router.route("/product/:id").get(getSingleProductDetails);

router
  .route("/admin/product/new")
  .post(isAuthenticatedUser, authorisedRoles("admin"), createProduct);

router
  .route("/admin/product/:id")
  .put(isAuthenticatedUser, authorisedRoles("admin"), updateProduct);

router
  .route("/admin/product/:id")
  .delete(isAuthenticatedUser, authorisedRoles("admin"), deleteProduct);

router.route("/review").put(isAuthenticatedUser, createReview);

router
  .route("/reviews")
  .get(getProductReviews)
  .delete(isAuthenticatedUser, deleteReview);

router
  .route("/admin/products")
  .get(isAuthenticatedUser, authorisedRoles("admin"), getAdminProducts);

module.exports = router;
