const express = require("express");
const router = express.Router();
const shopController = require("../controllers/shop");
const routeProtect = require("../routeProtect/routeProtect");

router.get("/", shopController.getProduct);

router.post("/cart", routeProtect, shopController.postCart);

router.get("/cart", routeProtect, shopController.getCart);

router.post("/cart-delete-item", routeProtect, shopController.deleteCartProduct);

router.get("/checkout", shopController.getCheckout);



router.get("/product-list", shopController.getProductList);

 router.get("/product-list/:productId", shopController.getEachProduct);

router.get("/order", routeProtect, shopController.getOrder);

//this is the route responsible for downloading invoice
router.get("/order/:orderId", routeProtect, shopController.getInvoice);

  module.exports = router;