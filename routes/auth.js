const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const { check, body } = require("express-validator");
const User = require("../models/user");
//this is for the login route
router.get("/login", authController.getLogin);

router.post("/login", 
    [
        body("email")
    .isEmail()
    .withMessage("Please enter a valid email")
    .normalizeEmail(),

    body("password", "please enter a valid password")
    .isLength({ min: 5 })
    .isAlphanumeric()
    .trim()
    ]
, authController.postLogin);


router.post("/logout", authController.postLogout);

router.get("/signup", authController.getSignup);

router.post("/signup", 
[
    check("email")
    .isEmail()
    .withMessage("please enter a valid email")
    .custom((value, {req})=>{
        return User.findOne({ email: value }).then(userDoc =>{
            console.log(userDoc);
            if (userDoc) {
              return Promise.reject("The email already exist, kindly pick another one");
            }
            return true
        })
    })
    .normalizeEmail(),
    //validation for password
    body("password", "Your password should be have atleast 5 charcters and contain both letter and numbers")
    .isLength({ min: 5 })
    .isAlphanumeric()
    .trim(),
    //validation for confirm password
    body("confirmPassword")
    .trim()
    .custom((value, {req})=>{
        if(value !== req.body.password){
            throw new Error("Passwod does not match");
        }
        return true;
    })

], authController.postSignup);

router.get("/reset", authController.getReset);

router.post("/reset", authController.postReset);

router.get("/reset/:token", authController.getNewPassword);

router.post("/new-password", authController.postNewPassword);



module.exports = router; 