const express = require("express");
const router = express.Router();
const rootDir = require("../util/path");
const adminController = require("../controllers/admin");
const routeProtect = require("../routeProtect/routeProtect");
const { body } = require("express-validator");


router.get("/add-product", routeProtect,  adminController.getAddProduct);


router.get("/admin-product", routeProtect, adminController.getAdminProduct);
  
router.post("/add-product", 
[
    body("title")
    .isString()
    .isLength({ min: 3 })
    .withMessage("kindly enter an alphabet for your title")
    .trim(),

    body("price")
    .isFloat()
    .withMessage("kindly enter the correct price"),

    body("description")
    .isLength({ min: 3, max: 400 })
    .withMessage("This textbox can only contain letter")
    .trim()
]


    
, adminController.postAddProduct);

router.get("/edit-product/:productId", adminController.getEditAdminProduct);

router.post("/edit-product",
 [
    body("title")
    .isString()
    .isLength({ min: 3 })
    .withMessage("kindly enter an alphabet for your title")
    .trim(),
    
    body("price")
    .isFloat()
    .withMessage("Enter a correct price"),

    body("description")
    .isString()
    .isLength({ min: 3, max: 400 })
    .withMessage("This textbox can only contain letter")
    .trim()
], 
adminController.postEditAdminProduct);


router.delete("/product:productId", adminController.deleteAdminProduct);
module.exports = router;

